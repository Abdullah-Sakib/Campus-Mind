import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, radius } from '../theme/theme';
import DarkCard from '../components/DarkCard';
import { useAuth } from '../context/AuthContext';

const FIELDS = [
  { key: 'fullName', label: 'Full Name', icon: 'person-outline' },
  { key: 'email', label: 'Email', icon: 'mail-outline' },
  { key: 'studentId', label: 'Student ID', icon: 'card-outline' },
  { key: 'university', label: 'University', icon: 'school-outline' },
  { key: 'department', label: 'Department', icon: 'library-outline' },
  { key: 'semester', label: 'Semester', icon: 'calendar-outline' },
];

export default function ProfileScreen({ navigation }) {
  const { user, loading } = useAuth();

  const initials = (user?.fullName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {loading ? (
          <Text style={styles.emptyText}>Loading profile…</Text>
        ) : !user ? (
          <Text style={styles.emptyText}>
            We couldn't load your profile. Try logging in again.
          </Text>
        ) : (
          <>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || '?'}</Text>
              </View>
              <Text style={styles.name}>{user.fullName}</Text>
              <Text style={styles.subtitle}>{user.email}</Text>
            </View>

            <DarkCard>
              {FIELDS.map((field, idx) => (
                <View
                  key={field.key}
                  style={[styles.row, idx !== FIELDS.length - 1 && styles.rowDivider]}
                >
                  <Ionicons
                    name={field.icon}
                    size={18}
                    color={colors.textOnDarkSecondary}
                    style={{ marginRight: spacing.sm }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <Text style={styles.fieldValue}>
                      {field.key === 'semester'
                        ? `Semester ${user.semester ?? '—'}`
                        : user[field.key] || '—'}
                    </Text>
                  </View>
                </View>
              ))}
            </DarkCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn: { width: 24 },
  headerTitle: { ...fonts.h3, color: colors.white },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { ...fonts.h1, color: colors.white },
  name: { ...fonts.h2 },
  subtitle: { ...fonts.body, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  fieldLabel: { ...fonts.small, color: colors.textOnDarkSecondary },
  fieldValue: { ...fonts.h3, color: colors.white, marginTop: 2 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },
});
