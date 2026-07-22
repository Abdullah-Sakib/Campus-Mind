import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export default function SignUpScreen({ navigation }) {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!fullName || !studentId || !university || !department || !semester || !email || !password) {
      Alert.alert('Missing info', 'Please fill in every field to create your account.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    try {
      setLoading(true);
      await signup({
        fullName,
        studentId,
        university,
        department,
        semester: Number(semester) || 1,
        email,
        password,
      });
    } catch (err) {
      Alert.alert('Sign up failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create account</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <FormInput
            label="Full Name"
            placeholder="Shantay Chandra Paul"
            value={fullName}
            onChangeText={setFullName}
          />
          <FormInput
            label="Student ID"
            placeholder="20245103067"
            keyboardType="number-pad"
            value={studentId}
            onChangeText={setStudentId}
          />
          <FormInput
            label="University"
            placeholder="Bangladesh University of Business and Technology"
            value={university}
            onChangeText={setUniversity}
          />
          <FormInput
            label="Department & Semester"
            placeholder="CSE"
            value={department}
            onChangeText={setDepartment}
          />
          <FormInput
            label="Semester Number"
            placeholder="4"
            keyboardType="number-pad"
            value={semester}
            onChangeText={setSemester}
          />
          <FormInput
            label="Email"
            placeholder="you@bubt.edu.bd"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormInput
            label="Password"
            placeholder="Minimum 8 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <PrimaryButton
            title="Create Account"
            onPress={handleCreateAccount}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...fonts.h3 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl },
});
