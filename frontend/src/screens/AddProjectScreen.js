import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, fonts, radius } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import {
  getProjects,
  addProject,
  updateProject,
  addAttachments,
  deleteAttachment,
} from '../api/projects';
import { toAbsoluteFileUrl } from '../api/client';

export default function AddProjectScreen({ navigation, route }) {
  const projectId = route.params?.projectId;
  const isEditing = !!projectId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [features, setFeatures] = useState('');
  const [objectives, setObjectives] = useState('');
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]); // files picked but not yet uploaded (new project only)
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const loadExisting = useCallback(async () => {
    try {
      const all = await getProjects();
      const project = all.find((p) => p._id === projectId);
      if (!project) {
        Alert.alert('Not found', 'This project could not be found.');
        navigation.goBack();
        return;
      }
      setTitle(project.title);
      setDescription(project.description || '');
      setTechnologies((project.technologies || []).join(', '));
      setFeatures(project.features || '');
      setObjectives(project.objectives || '');
      setExistingAttachments(project.attachments || []);
    } catch (err) {
      Alert.alert('Could not load project', err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, navigation]);

  useEffect(() => {
    if (isEditing) loadExisting();
  }, [isEditing, loadExisting]);

  const handlePickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    await handleAttachFile({ uri: file.uri, name: file.name, mimeType: file.mimeType || 'application/pdf' });
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const name = asset.fileName || asset.uri.split('/').pop() || `photo-${Date.now()}.jpg`;
    await handleAttachFile({ uri: asset.uri, name, mimeType: asset.mimeType || 'image/jpeg' });
  };

  const handleAttachFile = async (file) => {
    if (isEditing) {
      // Project already exists on the server — upload right away.
      try {
        setUploadingAttachment(true);
        const project = await addAttachments(projectId, [file]);
        setExistingAttachments(project.attachments || []);
      } catch (err) {
        Alert.alert('Could not attach file', err.message);
      } finally {
        setUploadingAttachment(false);
      }
    } else {
      // New project — stage locally, upload after the project is created.
      setStagedFiles((prev) => [...prev, file]);
    }
  };

  const handleRemoveStagedFile = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = (attachment) => {
    Alert.alert('Remove attachment', `Remove "${attachment.originalName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const project = await deleteAttachment(projectId, attachment._id);
            setExistingAttachments(project.attachments || []);
          } catch (err) {
            Alert.alert('Could not remove attachment', err.message);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Missing info', 'Please give your project a title.');
      return;
    }
    try {
      setSaving(true);
      const payload = { title, description, technologies, features, objectives };

      if (isEditing) {
        await updateProject(projectId, payload);
      } else {
        const project = await addProject(payload);
        if (stagedFiles.length > 0) {
          await addAttachments(project._id, stagedFiles);
        }
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save project', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Project' : 'New Project'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <FormInput label="Project Title" placeholder="e.g. CampusMind" value={title} onChangeText={setTitle} />

        <FormInput
          label="Description"
          placeholder="What is this project about?"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <FormInput
          label="Technologies Used"
          placeholder="e.g. React Native, Node.js, MongoDB"
          value={technologies}
          onChangeText={setTechnologies}
        />

        <FormInput
          label="Features"
          placeholder="Key features of the project"
          value={features}
          onChangeText={setFeatures}
          multiline
        />

        <FormInput
          label="Objectives"
          placeholder="What were you trying to achieve?"
          value={objectives}
          onChangeText={setObjectives}
          multiline
        />

        <Text style={styles.label}>ATTACHMENTS</Text>
        <View style={styles.attachBtnRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={handlePickPdf} disabled={uploadingAttachment}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.attachBtnText}>Add PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage} disabled={uploadingAttachment}>
            <Ionicons name="image-outline" size={18} color={colors.primary} />
            <Text style={styles.attachBtnText}>Add Image</Text>
          </TouchableOpacity>
        </View>

        {uploadingAttachment && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />}

        {existingAttachments.map((att) => (
          <View key={att._id} style={styles.attachmentRow}>
            {att.fileType === 'pdf' ? (
              <Ionicons name="document-text" size={20} color={colors.textPrimary} />
            ) : (
              <Image source={{ uri: toAbsoluteFileUrl(att.fileUrl) }} style={styles.attachmentThumb} />
            )}
            <Text style={styles.attachmentName} numberOfLines={1}>
              {att.originalName}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveExistingAttachment(att)} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.urgentText} />
            </TouchableOpacity>
          </View>
        ))}

        {stagedFiles.map((file, idx) => (
          <View key={`${file.name}-${idx}`} style={styles.attachmentRow}>
            <Ionicons name="attach" size={20} color={colors.textPrimary} />
            <Text style={styles.attachmentName} numberOfLines={1}>
              {file.name}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveStagedFile(idx)} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.urgentText} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={isEditing ? 'Save Changes' : 'Add Project'} onPress={handleSave} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...fonts.h3 },
  saveText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  container: { padding: spacing.md },
  label: {
    ...fonts.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  attachBtnRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginRight: spacing.sm,
  },
  attachBtnText: { color: colors.primary, fontWeight: '700', marginLeft: 6 },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  attachmentThumb: { width: 28, height: 28, borderRadius: 4 },
  attachmentName: { flex: 1, marginHorizontal: spacing.sm, color: colors.textPrimary },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
