import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, fonts, radius } from '../theme/theme';
import FAB from '../components/FAB';
import FormInput from '../components/FormInput';
import ChipGroup from '../components/ChipGroup';
import PrimaryButton from '../components/PrimaryButton';
import { getDocuments, uploadDocument, deleteDocument } from '../api/documents';
import { toAbsoluteFileUrl } from '../api/client';

const CATEGORIES = [
  'CV/Resume',
  'Academic Certificate',
  'Achievement Certificate',
  'Course Certificate',
  'Internship Certificate',
  'Training Certificate',
  'Other',
];

const FILE_ICONS = { pdf: 'document-text', jpg: 'image', png: 'image' };

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentsScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [pendingFile, setPendingFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      // ignore, empty state will show
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setPendingFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setCategory('Other');
    } catch (err) {
      Alert.alert('Could not open file picker', err.message);
    }
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile || !title) {
      Alert.alert('Missing title', 'Please give this document a name.');
      return;
    }
    try {
      setUploading(true);
      await uploadDocument(pendingFile, title, category);
      setPendingFile(null);
      setTitle('');
      load();
    } catch (err) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleView = (doc) => {
    const url = toAbsoluteFileUrl(doc.fileUrl);
    Linking.openURL(url).catch(() =>
      Alert.alert('Could not open document', 'No app available to open this file type.')
    );
  };

  const handleDelete = (doc) => {
    Alert.alert('Delete document', `Delete "${doc.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDocument(doc._id);
            setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
          } catch (err) {
            Alert.alert('Could not delete document', err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Important Documents</Text>
          <Text style={styles.headerSubtitle}>{documents.length} documents</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>
            No documents yet. Tap + to upload your CV, certificates, or other important files.
          </Text>
        ) : (
          documents.map((doc) => (
            <View key={doc._id} style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name={FILE_ICONS[doc.fileType] || 'document'} size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.cardTitle}>{doc.title}</Text>
                <Text style={styles.cardSubtitle}>
                  {doc.category} · {doc.fileType.toUpperCase()}
                  {doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleView(doc)} style={styles.actionBtn} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(doc)} style={styles.actionBtn} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={colors.urgent} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <FAB onPress={handlePickFile} />

      <Modal visible={!!pendingFile} transparent animationType="slide" onRequestClose={() => setPendingFile(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Upload document</Text>
            <Text style={styles.modalFileName} numberOfLines={1}>
              {pendingFile?.name}
            </Text>

            <FormInput label="Document Name" value={title} onChangeText={setTitle} placeholder="e.g. CV - 2026" />

            <ChipGroup label="Category" options={CATEGORIES} value={category} onChange={setCategory} />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPendingFile(null)}
                disabled={uploading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton
                title="Upload"
                onPress={handleConfirmUpload}
                loading={uploading}
                style={{ flex: 1, marginLeft: spacing.sm }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn: { marginRight: spacing.sm },
  headerTitle: { ...fonts.h3, color: colors.white },
  headerSubtitle: { ...fonts.small, color: colors.textOnDarkSecondary, marginTop: 2 },
  body: { padding: spacing.md, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...fonts.h3, color: colors.white },
  cardSubtitle: { ...fonts.small, color: colors.textOnDarkSecondary, marginTop: 2 },
  actionBtn: { marginLeft: spacing.sm, padding: 4 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalTitle: { ...fonts.h2, marginBottom: 4 },
  modalFileName: { ...fonts.small, color: colors.textSecondary, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', marginTop: spacing.sm },
  cancelBtn: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: { ...fonts.h3, fontSize: 15, color: colors.textPrimary },
});
