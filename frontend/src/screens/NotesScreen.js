import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts, radius } from "../theme/theme";
import Pill from "../components/Pill";
import { getNotes } from "../api/notes";

const TAG_VARIANT = {
  Compiler: "info",
  Networks: "success",
};

export default function NotesScreen({ navigation }) {
  const [activeTag, setActiveTag] = useState("All");
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (tag) => {
    try {
      const data = await getNotes(tag === "All" ? undefined : tag);
      setNotes(data);
      if (tag === "All") {
        const uniqueTags = ["All", ...new Set(data.map((n) => n.tag))];
        setTags(uniqueTags);
      }
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
      load(activeTag);
    }, [activeTag]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load(activeTag);
  };

  const sharedCount = notes.filter((n) => n.sharedWithClassmates).length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Study Notes</Text>
            <Text style={styles.subtitle}>
              {notes.length} notes · {sharedCount} shared
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("AddNote")}
          >
            <Ionicons name="add" size={22} color={colors.headerBg} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
      >
        {tags.map((tag) => {
          const active = tag === activeTag;
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => setActiveTag(tag)}
              style={[styles.tagChip, active && styles.tagChipActive]}
            >
              <Text style={[styles.tagText, active && styles.tagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: spacing.xl }}
          />
        ) : notes.length === 0 ? (
          <Text style={styles.emptyText}>
            No notes yet. Tap + to create one.
          </Text>
        ) : (
          notes.map((note) => (
            <View key={note._id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={colors.white}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{note.title}</Text>
                    <Pill
                      label={note.tag}
                      variant={TAG_VARIANT[note.tag] || "info"}
                    />
                  </View>
                  <Text style={styles.cardSubtitle}>
                    Updated {new Date(note.updatedAt).toLocaleDateString()} ·{" "}
                    {note.pages} pages ·{" "}
                    {note.sharedWithClassmates
                      ? `Shared with ${note.sharedCount || "classmates"}`
                      : "Private"}
                  </Text>
                </View>
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
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { ...fonts.h1, color: colors.white },
  subtitle: { ...fonts.body, color: colors.textOnDarkSecondary, marginTop: 4 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  tagRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  tagChip: {
    height: 45,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: {
    backgroundColor: colors.cardDark,
    borderColor: colors.cardDark,
  },
  tagText: { ...fonts.body, fontWeight: "700", color: colors.textPrimary },
  tagTextActive: { color: colors.white },
  body: { padding: spacing.md, paddingTop: 0 },
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    ...fonts.h3,
    color: colors.white,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardSubtitle: {
    ...fonts.small,
    color: colors.textOnDarkSecondary,
    marginTop: 6,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});
