import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import * as authApi from '../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Missing info', 'Please enter your email.');
      return;
    }
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      Alert.alert('Something went wrong', err.message);
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
        <Text style={styles.headerTitle}>Forgot password</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          {sent ? (
            <View style={styles.confirmBox}>
              <Ionicons name="mail-open-outline" size={40} color={colors.primary} />
              <Text style={styles.confirmTitle}>Check your inbox</Text>
              <Text style={styles.confirmText}>
                If an account exists for {email}, we've sent a link to reset your password.
              </Text>
              <PrimaryButton
                title="Back to Log In"
                onPress={() => navigation.navigate('Login')}
                style={{ marginTop: spacing.lg, width: '100%' }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.heading}>Reset your password</Text>
              <Text style={styles.subheading}>
                Enter the email tied to your CampusMind account and we'll send a reset link.
              </Text>
              <FormInput
                label="Email"
                placeholder="you@bubt.edu.bd"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <PrimaryButton title="Send reset link" onPress={handleSend} loading={loading} />
            </>
          )}
        </View>
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
  container: { padding: spacing.lg, paddingTop: spacing.xl, flex: 1 },
  heading: { ...fonts.h1, marginBottom: spacing.xs },
  subheading: { ...fonts.body, color: colors.textSecondary, marginBottom: spacing.lg },
  confirmBox: { alignItems: 'center', paddingTop: spacing.xl },
  confirmTitle: { ...fonts.h2, marginTop: spacing.md, marginBottom: spacing.sm },
  confirmText: { ...fonts.body, color: colors.textSecondary, textAlign: 'center' },
});
