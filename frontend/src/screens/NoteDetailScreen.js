import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts, radius } from "../theme/theme";
import Pill from "../components/Pill";
import { getNotes, deleteNote } from "../api/notes";

const TAG_VARIANT = {
  Compiler: "info",
  Networks: "success",
};

export default function NoteDetailScreen({ navigation, route }) {
  const { noteId } = route.params;
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      // There's no single-note GET endpoint yet, so we pull the list and
      // find this one — fine at this scale, and it means this screen
      // always reflects the latest saved content whenever it regains focus
      // (e.g. right after editing).
      const notes = await getNotes();
      const found = notes.find((n) => n._id === noteId);
      if (!found) {
        setNotFound(true);
      } else {
        setNote(found);
        setNotFound(false);
      }
    } catch (err) {
      Alert.alert("Could not load note", err.message);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete note",
      `Delete "${note.title}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNote(note._id);
              navigation.goBack();
            } catch (err) {
              Alert.alert("Could not delete note", err.message);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {note?.title || "Note"}
        </Text>
        {note ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AddNote", { noteId: note._id })
              }
              hitSlop={10}
              style={{ marginRight: spacing.md }}
            >
              <Ionicons
                name="create-outline"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} hitSlop={10}>
              <Ionicons
                name="trash-outline"
                size={22}
                color={colors.urgentText}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 26 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xl }}
        />
      ) : notFound || !note ? (
        <View style={styles.centered}>
          <Ionicons
            name="document-text-outline"
            size={40}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            This note couldn't be found. It may have been deleted.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.metaRow}>
            <Pill label={note.tag} variant={TAG_VARIANT[note.tag] || "info"} />
            <Text style={styles.metaText}>
              Updated{" "}
              {new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          <View style={styles.shareRow}>
            <Ionicons
              name={
                note.sharedWithClassmates
                  ? "people-outline"
                  : "lock-closed-outline"
              }
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.shareText}>
              {note.sharedWithClassmates
                ? `Shared with classmates${note.sharedCount ? ` · ${note.sharedCount}` : ""}`
                : "Private — only visible to you"}
            </Text>
          </View>

          <View style={styles.divider} />

          {note.content ? (
            <Text style={styles.contentText}>{note.content}</Text>
          ) : (
            <Text style={styles.emptyContentText}>
              This note doesn't have any written content yet.
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...fonts.h3, flex: 1, marginHorizontal: spacing.sm },
  headerActions: { flexDirection: "row", alignItems: "center" },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  metaText: { ...fonts.small, color: colors.textSecondary },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  shareText: { ...fonts.small, color: colors.textSecondary, marginLeft: 6 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  contentText: { ...fonts.body, color: colors.textPrimary, lineHeight: 24 },
  emptyContentText: {
    ...fonts.body,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyText: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
