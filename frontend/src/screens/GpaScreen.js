import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, radius } from '../theme/theme';
import DarkCard from '../components/DarkCard';
import Pill from '../components/Pill';
import { useAuth } from '../context/AuthContext';
import { getGpaSummary } from '../api/courses';

const statusToVariant = {
  'midterm-soon': 'warning',
  'on-track': 'success',
  good: 'info',
  'at-risk': 'urgent',
};

const statusToLabel = {
  'midterm-soon': 'Midterm soon',
  'on-track': 'On track',
  good: 'Good',
  'at-risk': 'At risk',
};

export default function GpaScreen({ navigation }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getGpaSummary();
      setSummary(data);
    } catch (err) {
      // ignore
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

  const currentSemester = summary?.semesters?.[summary.semesters.length - 1];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>GPA Tracker</Text>
            <Text style={styles.subtitle}>
              {user?.university || 'CampusMind'} · {user?.department || ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddCourse')}>
            <Ionicons name="add" size={22} color={colors.headerBg} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            <DarkCard style={styles.cgpaCard}>
              <Text style={styles.cgpaNumber}>{summary?.cgpa ?? '0.00'}</Text>
              <Text style={styles.cgpaLabel}>Cumulative GPA (CGPA)</Text>
            </DarkCard>

            <DarkCard>
              {!currentSemester || currentSemester.courses.length === 0 ? (
                <Text style={styles.emptyText}>No courses added yet. Tap + to add one.</Text>
              ) : (
                currentSemester.courses.map((course, idx) => (
                  <View
                    key={course._id}
                    style={[
                      styles.row,
                      idx !== currentSemester.courses.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <Text style={styles.rowTitle}>{course.courseName}</Text>
                    <Pill
                      label={statusToLabel[course.status] || 'On track'}
                      variant={statusToVariant[course.status] || 'success'}
                    />
                  </View>
                ))
              )}
            </DarkCard>

            {summary?.semesters?.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>SEMESTER GPA HISTORY</Text>
                <DarkCard>
                  {summary.semesters.map((s, idx) => (
                    <View
                      key={s.semester}
                      style={[
                        styles.row,
                        idx !== summary.semesters.length - 1 && styles.rowDivider,
                      ]}
                    >
                      <Text style={styles.rowTitle}>Semester {s.semester}</Text>
                      <Text style={styles.gpaValue}>{s.gpa.toFixed(2)}</Text>
                    </View>
                  ))}
                </DarkCard>
              </>
            )}
          </>
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
  body: { padding: spacing.md },
  cgpaCard: { alignItems: 'center', marginBottom: spacing.md, paddingVertical: spacing.lg },
  cgpaNumber: { fontSize: 44, fontWeight: '800', color: colors.primary },
  cgpaLabel: { ...fonts.body, color: colors.textOnDarkSecondary, marginTop: 4 },
  sectionLabel: {
    ...fonts.label,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm + 2 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rowTitle: { ...fonts.h3, color: colors.white },
  gpaValue: { ...fonts.h3, color: colors.primary },
  emptyText: { color: colors.textOnDarkSecondary, paddingVertical: spacing.sm },
});
