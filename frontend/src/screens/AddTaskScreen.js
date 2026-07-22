import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors, spacing, fonts } from '../theme/theme';
import FormInput from '../components/FormInput';
import ChipGroup from '../components/ChipGroup';
import PrimaryButton from '../components/PrimaryButton';
import { addTask } from '../api/tasks';

const TYPES = ['Assignment', 'Project', 'Exam', 'Quiz'];
const PRIORITIES = ['Low', 'Medium', 'Urgent'];

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Assignment');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !course || !dueDate) {
      Alert.alert('Missing info', 'Title, course, and due date are required.');
      return;
    }
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      Alert.alert('Invalid date', 'Please enter the due date as YYYY-MM-DD, e.g. 2026-06-25.');
      return;
    }
    try {
      setSaving(true);
      await addTask({
        title,
        type,
        course,
        dueDate: parsedDate,
        priority,
        progress: Math.round(progress),
        notes,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save task', err.message);
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
        <Text style={styles.headerTitle}>New Task</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <FormInput
          label="Title"
          placeholder="e.g. Networks Lab Report"
          value={title}
          onChangeText={setTitle}
        />

        <ChipGroup label="Type" options={TYPES} value={type} onChange={setType} />

        <FormInput
          label="Course"
          placeholder="e.g. Computer Networks"
          value={course}
          onChangeText={setCourse}
        />

        <FormInput
          label="Due Date"
          placeholder="YYYY-MM-DD, e.g. 2026-06-25"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <ChipGroup label="Priority" options={PRIORITIES} value={priority} onChange={setPriority} />

        <Text style={styles.label}>PROGRESS — {Math.round(progress)}%</Text>
        <Slider
          style={{ marginBottom: spacing.md }}
          minimumValue={0}
          maximumValue={100}
          step={5}
          value={progress}
          onValueChange={setProgress}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />

        <FormInput
          label="Notes"
          placeholder="Add details, checklist, or reminders..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Save Task" onPress={handleSave} loading={saving} />
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
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
