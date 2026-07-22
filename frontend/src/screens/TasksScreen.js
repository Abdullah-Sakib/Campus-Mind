import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, radius } from '../theme/theme';
import Pill from '../components/Pill';
import { getTasks } from '../api/tasks';

const FILTERS = ['All', 'Pending', 'Submitted'];

const formatDueLabel = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffMs = due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return 'Overdue';
};

const dueVariant = (dueDate) => {
  const label = formatDueLabel(dueDate);
  if (label === 'Tomorrow' || label === 'Today' || label === 'Overdue') return 'urgent';
  return 'warning';
};

export default function TasksScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (f) => {
    try {
      const data = await getTasks(f === 'All' ? undefined : f.toLowerCase());
      setTasks(data);
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
      load(filter);
    }, [filter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load(filter);
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const submittedCount = tasks.filter((t) => t.status === 'submitted').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Assignments</Text>
            <Text style={styles.subtitle}>
              {pendingCount} pending · {submittedCount} submitted
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddTask')}>
            <Ionicons name="add" size={22} color={colors.headerBg} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks here yet. Tap + to add one.</Text>
        ) : (
          tasks.map((task) => (
            <View key={task._id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{task.title}</Text>
                <Pill label={formatDueLabel(task.dueDate)} variant={dueVariant(task.dueDate)} />
              </View>
              <Text style={styles.cardSubtitle}>
                {task.type} · {task.course}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${task.progress}%`,
                      backgroundColor: task.progress >= 70 ? colors.primary : colors.warning,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.headerBg, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...fonts.h1, color: colors.white },
  subtitle: { ...fonts.body, color: colors.textOnDarkSecondary, marginTop: 4 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', padding: spacing.md, gap: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.cardDark, borderColor: colors.cardDark },
  filterText: { ...fonts.small, fontWeight: '700', color: colors.textPrimary },
  filterTextActive: { color: colors.white },
  body: { padding: spacing.md, paddingTop: 0 },
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { ...fonts.h3, color: colors.white, flex: 1, marginRight: spacing.sm },
  cardSubtitle: { ...fonts.small, color: colors.textOnDarkSecondary, marginTop: 4, marginBottom: spacing.md },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressFill: { height: 6, borderRadius: 3 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },
});
