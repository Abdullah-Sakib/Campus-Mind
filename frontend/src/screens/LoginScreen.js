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
import { colors, spacing, fonts, radius } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [emailOrStudentId, setEmailOrStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrStudentId || !password) {
      Alert.alert('Missing info', 'Please enter your email/student ID and password.');
      return;
    }
    try {
      setLoading(true);
      await login(emailOrStudentId, password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.brand}>CampusMind</Text>

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Log in to keep your semester on track.</Text>

          <FormInput
            label="Email or Student ID"
            placeholder="shanto@bubt.edu.bd"
            autoCapitalize="none"
            value={emailOrStudentId}
            onChangeText={setEmailOrStudentId}
          />
          <FormInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <PrimaryButton title="Log In" onPress={handleLogin} loading={loading} />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() =>
              Alert.alert('Google Sign-In', 'Hook this up to your Google OAuth SDK of choice.')
            }
          >
            <Text style={styles.googleDot}>G</Text>
            <Text style={styles.googleText}>Google</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to CampusMind? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { padding: spacing.lg, paddingTop: spacing.xl },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.headerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoLetter: { color: colors.white, fontSize: 22, fontWeight: '800' },
  brand: { ...fonts.h2, marginBottom: spacing.lg },
  heading: { ...fonts.h1, marginBottom: spacing.xs },
  subheading: { ...fonts.body, color: colors.textSecondary, marginBottom: spacing.lg },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: spacing.lg, marginTop: -8 },
  forgotText: { color: colors.primary, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    ...fonts.label,
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 15,
  },
  googleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
    fontWeight: '800',
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  googleText: { ...fonts.body, fontWeight: '700' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
