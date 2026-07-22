import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fonts } from '../theme/theme';

const VARIANTS = {
  urgent: { bg: colors.urgent, text: colors.urgentText },
  warning: { bg: colors.warning, text: colors.warningText },
  success: { bg: colors.success, text: colors.successText },
  info: { bg: colors.info, text: colors.infoText },
  neutral: { bg: colors.neutral, text: colors.neutralText },
};

export default function Pill({ label, variant = 'neutral', style }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <View style={[styles.pill, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...fonts.small,
    fontWeight: '700',
  },
});
