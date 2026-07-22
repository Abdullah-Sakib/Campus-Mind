import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HeaderBanner({ title, subtitle, children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.banner, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...fonts.h1,
    color: colors.white,
  },
  subtitle: {
    ...fonts.body,
    color: colors.textOnDarkSecondary,
    marginTop: 4,
  },
});
