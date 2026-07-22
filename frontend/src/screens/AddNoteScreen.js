import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, radius } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { addNote } from '../api/notes';

const DEFAULT_TAGS = ['Compiler', 'Networks', 'AI'];

export default function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [tag, setTag] = useState(DEFAULT_TAGS[0]);
  const [newTagInput, setNewTagInput] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [content, setContent] = useState('');
  const [shared, setShared] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTag(trimmed);
    }
    setNewTagInput('');
    setAddingTag(false);
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Missing info', 'Please give your note a title.');
      return;
    }
    try {
      setSaving(true);
      await addNote({
        title,
        tag,
        content,
        pages: Math.max(1, Math.ceil(content.length / 1800)),
        sharedWithClassmates: shared,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save note', err.message);
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
        <Text style={styles.headerTitle}>New Note</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <FormInput
          label="Title"
          placeholder="e.g. Flex Lexical Analyzer Notes"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>TAG</Text>
        <View style={styles.tagRow}>
          {tags.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTag(t)}
              style={[styles.tagChip, tag === t && styles.tagChipActive]}
            >
              <Text style={[styles.tagText, tag === t && styles.tagTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
          {addingTag ? (
            <FormInput
              placeholder="New tag"
              value={newTagInput}
              onChangeText={setNewTagInput}
              onSubmitEditing={handleAddTag}
              autoFocus
              containerStyle={{ width: 120, marginBottom: 0 }}
            />
          ) : (
            <TouchableOpacity style={styles.tagChip} onPress={() => setAddingTag(true)}>
              <Text style={styles.tagText}>+ New Tag</Text>
            </TouchableOpacity>
          )}
        </View>

        <FormInput
          placeholder="Start writing your notes here..."
          value={content}
          onChangeText={setContent}
          multiline
          containerStyle={{ marginTop: spacing.sm }}
        />

        <View style={styles.shareRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shareTitle}>Share with classmates</Text>
            <Text style={styles.shareSubtitle}>Others can view, not edit</Text>
          </View>
          <Switch
            value={shared}
            onValueChange={setShared}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Save Note" onPress={handleSave} loading={saving} />
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
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: spacing.md },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  tagChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { ...fonts.body, fontWeight: '600', color: colors.textPrimary },
  tagTextActive: { color: colors.white },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  shareTitle: { ...fonts.h3, fontSize: 15 },
  shareSubtitle: { ...fonts.small, color: colors.textSecondary, marginTop: 2 },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
