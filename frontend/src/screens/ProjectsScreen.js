import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, radius } from '../theme/theme';
import FAB from '../components/FAB';
import { getProjects, deleteProject } from '../api/projects';
import { toAbsoluteFileUrl } from '../api/client';

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      // ignore
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

  const handleDelete = (project) => {
    Alert.alert('Delete project', `Delete "${project.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProject(project._id);
            setProjects((prev) => prev.filter((p) => p._id !== project._id));
          } catch (err) {
            Alert.alert('Could not delete project', err.message);
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
          <Text style={styles.headerTitle}>Projects</Text>
          <Text style={styles.headerSubtitle}>{projects.length} projects</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : projects.length === 0 ? (
          <Text style={styles.emptyText}>
            No projects yet. Tap + to add the first project from your university life.
          </Text>
        ) : (
          projects.map((project) => {
            const imageAttachments = (project.attachments || []).filter((a) => a.fileType !== 'pdf');
            const pdfCount = (project.attachments || []).filter((a) => a.fileType === 'pdf').length;

            return (
              <TouchableOpacity
                key={project._id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AddProject', { projectId: project._id })}
                onLongPress={() => handleDelete(project)}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{project.title}</Text>
                  <TouchableOpacity onPress={() => handleDelete(project)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.urgent} />
                  </TouchableOpacity>
                </View>

                {!!project.description && (
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {project.description}
                  </Text>
                )}

                {project.technologies?.length > 0 && (
                  <View style={styles.techRow}>
                    {project.technologies.map((tech) => (
                      <View key={tech} style={styles.techChip}>
                        <Text style={styles.techText}>{tech}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {imageAttachments.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                    {imageAttachments.map((att) => (
                      <Image
                        key={att._id}
                        source={{ uri: toAbsoluteFileUrl(att.fileUrl) }}
                        style={styles.thumb}
                      />
                    ))}
                  </ScrollView>
                )}

                {pdfCount > 0 && (
                  <View style={styles.pdfRow}>
                    <Ionicons name="document-text-outline" size={14} color={colors.textOnDarkSecondary} />
                    <Text style={styles.pdfText}>
                      {pdfCount} PDF attachment{pdfCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <FAB onPress={() => navigation.navigate('AddProject')} />
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
    backgroundColor: colors.cardDark,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { ...fonts.h3, color: colors.white, flex: 1, marginRight: spacing.sm },
  cardDescription: { ...fonts.small, color: colors.textOnDarkSecondary, marginTop: 6 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: 6 },
  techChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  techText: { ...fonts.small, color: colors.white, fontSize: 12 },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, marginRight: spacing.sm },
  pdfRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  pdfText: { ...fonts.small, color: colors.textOnDarkSecondary, marginLeft: 6 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
