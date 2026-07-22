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
import DarkCard from '../components/DarkCard';
import { getRoutine } from '../api/routine';

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function RoutineScreen({ navigation }) {
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 6 ? 0 : (new Date().getDay() + 1) % 7]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (day) => {
    try {
      const data = await getRoutine(day);
      setClasses(data);
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
      load(activeDay);
    }, [activeDay])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load(activeDay);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Class Routine</Text>
            <Text style={styles.subtitle}>Semester 4 · CSE</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddClass')}>
            <Ionicons name="add" size={22} color={colors.headerBg} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayTabs}
      >
        {DAYS.map((day) => {
          const active = day === activeDay;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setActiveDay(day)}
              style={[styles.dayTab, active && styles.dayTabActive]}
            >
              <Text style={[styles.dayTabText, active && styles.dayTabTextActive]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : classes.length === 0 ? (
          <Text style={styles.emptyText}>No classes on {activeDay}. Tap + to add one.</Text>
        ) : (
          <DarkCard>
            {classes.map((cls, idx) => (
              <View
                key={cls._id}
                style={[styles.row, idx !== classes.length - 1 && styles.rowDivider]}
              >
                <View style={[styles.dot, { backgroundColor: cls.colorTag || colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{cls.subject}</Text>
                  <Text style={styles.rowSubtitle}>
                    {cls.type} · Rm {cls.room}
                  </Text>
                </View>
                <Text style={styles.rowTime}>
                  {cls.startTime.replace(' AM', '').replace(' PM', '')}–
                  {cls.endTime.replace(' AM', '').replace(' PM', '')}
                </Text>
              </View>
            ))}
          </DarkCard>
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
  dayTabs: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: 8 },
  dayTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayTabActive: { backgroundColor: colors.cardDark, borderColor: colors.cardDark },
  dayTabText: { ...fonts.body, fontWeight: '700', color: colors.textPrimary },
  dayTabTextActive: { color: colors.white },
  body: { padding: spacing.md, paddingTop: 0 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  rowTitle: { ...fonts.h3, color: colors.white },
  rowSubtitle: { ...fonts.small, color: colors.textOnDarkSecondary, marginTop: 2 },
  rowTime: { ...fonts.small, color: colors.textOnDarkSecondary },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },
});
