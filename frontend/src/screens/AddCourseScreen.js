import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts, radius } from "../theme/theme";
import FormInput from "../components/FormInput";
import ChipGroup from "../components/ChipGroup";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { addCourse } from "../api/courses";

const GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "F",
];
const GRADE_POINTS = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

export default function AddCourseScreen({ navigation }) {
  const { user } = useAuth();
  const [semester, setSemester] = useState(String(user?.semester || 1));
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState("3.0");
  const [grade, setGrade] = useState("A-");
  const [saving, setSaving] = useState(false);

  const gradePoint = GRADE_POINTS[grade] ?? 0;
  const credits = parseFloat(creditHours) || 0;
  const pointsEarned = useMemo(
    () => +(credits * gradePoint).toFixed(2),
    [credits, gradePoint],
  );

  const handleSave = async () => {
    if (!courseName || !creditHours || !grade) {
      Alert.alert(
        "Missing info",
        "Course name, credit hours, and grade are required.",
      );
      return;
    }
    try {
      setSaving(true);
      await addCourse({
        semester: Number(semester) || 1,
        courseName,
        creditHours: credits,
        grade,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert("Could not save course", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Course</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <FormInput
          label="Semester"
          placeholder={`Semester ${user?.semester || 1} (Current)`}
          value={semester}
          onChangeText={setSemester}
          keyboardType="number-pad"
        />

        <FormInput
          label="Course Name"
          placeholder="e.g. Compiler Design"
          value={courseName}
          onChangeText={setCourseName}
        />

        <View style={styles.row}>
          <FormInput
            label="Credit Hours"
            placeholder="3.0"
            value={creditHours}
            onChangeText={setCreditHours}
            keyboardType="decimal-pad"
            containerStyle={{ flex: 1, marginRight: spacing.sm }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>GRADE</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={grade}
                onValueChange={(value) => setGrade(value)}
                style={styles.picker}
                dropdownIconColor={colors.textSecondary}
                itemStyle={styles.pickerItem}
              >
                {GRADES.map((g) => (
                  <Picker.Item key={g} label={g} value={g} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <Text style={styles.label}>GRADE POINTS EARNED</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultNumber}>{pointsEarned.toFixed(2)}</Text>
          <Text style={styles.resultSubtitle}>
            {credits.toFixed(1)} credits × {gradePoint.toFixed(2)} grade points
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={`Add to Semester ${semester || ""}`}
          onPress={handleSave}
          loading={saving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...fonts.h3 },
  saveText: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  container: { padding: spacing.md },
  row: { flexDirection: "row" },
  label: {
    ...fonts.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  pickerContainer: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  picker: {
    color: colors.textPrimary,
    height: 56,
    paddingHorizontal: spacing.md,
  },
  pickerItem: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  resultNumber: { fontSize: 36, fontWeight: "800", color: colors.primary },
  resultSubtitle: { ...fonts.small, color: colors.textSecondary, marginTop: 4 },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
