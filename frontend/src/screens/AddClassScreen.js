import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, radius } from '../theme/theme';
import FormInput from '../components/FormInput';
import ChipGroup from '../components/ChipGroup';
import PrimaryButton from '../components/PrimaryButton';
import { addClass } from '../api/routine';

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TYPES = ['Theory', 'Lab'];
const COLOR_OPTIONS = ['#8B85EC', '#7BC99A', '#C6A6E0', '#E0AE5C'];

export default function AddClassScreen({ navigation }) {
  const [day, setDay] = useState('Sat');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('Theory');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [colorTag, setColorTag] = useState(COLOR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!subject || !startTime || !endTime) {
      Alert.alert('Missing info', 'Subject, start time, and end time are required.');
      return;
    }
    try {
      setSaving(true);
      await addClass({ day, subject, type, room, startTime, endTime, colorTag });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save class', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Class</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <ChipGroup label="Day" options={DAYS} value={day} onChange={setDay} />

        <FormInput
          label="Subject"
          placeholder="e.g. Compiler Design"
          value={subject}
          onChangeText={setSubject}
        />

        <ChipGroup label="Type" options={TYPES} value={type} onChange={setType} />

        <FormInput label="Room" placeholder="e.g. Room 301" value={room} onChangeText={setRoom} />

        <View style={styles.row}>
          <FormInput
            label="Start Time"
            placeholder="8:30 AM"
            value={startTime}
            onChangeText={setStartTime}
            containerStyle={{ flex: 1, marginRight: spacing.sm }}
          />
          <FormInput
            label="End Time"
            placeholder="10:00 AM"
            value={endTime}
            onChangeText={setEndTime}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Text style={styles.label}>COLOR TAG</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColorTag(c)}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                colorTag === c && styles.colorDotActive,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Add to Routine" onPress={handleSave} loading={saving} />
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
  row: { flexDirection: 'row' },
  label: {
    ...fonts.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  colorRow: { flexDirection: 'row', gap: 14 },
  colorDot: { width: 32, height: 32, borderRadius: 16, marginRight: 14 },
  colorDotActive: { borderWidth: 3, borderColor: colors.textPrimary },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
