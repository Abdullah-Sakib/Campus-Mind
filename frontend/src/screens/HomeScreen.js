import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fonts, radius } from '../theme/theme';
import DarkCard from '../components/DarkCard';
import Pill from '../components/Pill';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../api/home';

const priorityToVariant = (priority) => {
  if (priority === 'Urgent') return 'urgent';
  if (priority === 'Low') return 'success';
  return 'warning';
};

const formatDueLabel = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffMs = due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `${diffDays} days`;
  return 'Overdue';
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      // fail silently on dashboard; screen shows empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const displayName = dashboard?.user?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'there';
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, {displayName}</Text>
          <Text style={styles.dateLine}>
            {dateStr} · Semester {dashboard?.user?.semester ?? user?.semester ?? ''}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{dashboard?.currentGpa ?? '—'}</Text>
              <Text style={styles.statLabel}>Current GPA</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{dashboard?.dueTodayCount ?? 0}</Text>
              <Text style={styles.statLabel}>Due today</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>TODAY'S CLASSES</Text>
          <DarkCard style={{ marginBottom: spacing.lg }}>
            {(dashboard?.todaysClasses ?? []).length === 0 ? (
              <Text style={styles.emptyText}>No classes scheduled today.</Text>
            ) : (
              dashboard.todaysClasses.map((cls, idx) => (
                <View
                  key={cls._id}
                  style={[
                    styles.row,
                    idx !== dashboard.todaysClasses.length - 1 && styles.rowDivider,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{cls.subject}</Text>
                    <Text style={styles.rowSubtitle}>
                      {cls.startTime} · Room {cls.room}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </DarkCard>

          <Text style={styles.sectionLabel}>UPCOMING DEADLINES</Text>
          <DarkCard>
            {(dashboard?.upcomingDeadlines ?? []).length === 0 ? (
              <Text style={styles.emptyText}>You're all caught up!</Text>
            ) : (
              dashboard.upcomingDeadlines.map((task, idx) => (
                <View
                  key={task._id}
                  style={[
                    styles.row,
                    idx !== dashboard.upcomingDeadlines.length - 1 && styles.rowDivider,
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: spacing.sm }}>
                    <Text style={styles.rowTitle}>{task.title}</Text>
                    <Text style={styles.rowSubtitle}>
                      {formatDueLabel(task.dueDate) === 'Today' || formatDueLabel(task.dueDate) === 'Tomorrow'
                        ? formatDueLabel(task.dueDate)
                        : new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {' · '}
                      {task.type}
                    </Text>
                  </View>
                  <Pill
                    label={formatDueLabel(task.dueDate)}
                    variant={priorityToVariant(task.priority)}
                  />
                </View>
              ))
            )}
          </DarkCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  greeting: { ...fonts.h1, color: colors.white },
  dateLine: { ...fonts.body, color: colors.textOnDarkSecondary, marginTop: 4, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statNumber: { ...fonts.h1, color: colors.white },
  statLabel: { ...fonts.small, color: colors.textOnDarkSecondary, marginTop: 2 },
  body: { padding: spacing.md },
  sectionLabel: {
    ...fonts.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rowTitle: { ...fonts.h3, color: colors.white },
  rowSubtitle: { ...fonts.small, color: colors.textOnDarkSecondary, marginTop: 2 },
  emptyText: { color: colors.textOnDarkSecondary, paddingVertical: spacing.sm },
});
