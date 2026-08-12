import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fonts } from '../theme/theme';

export default function StatusToggle({ status, onToggle, loading }) {
  const isSubmitted = status === 'submitted';

  return (
    <TouchableOpacity
      style={[styles.pill, isSubmitted ? styles.submitted : styles.pending]}
      onPress={onToggle}
      disabled={loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isSubmitted ? colors.successText : colors.warningText} />
      ) : (
        <>
          <Ionicons
            name={isSubmitted ? 'checkmark-circle' : 'time-outline'}
            size={15}
            color={isSubmitted ? colors.successText : colors.warningText}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.text, { color: isSubmitted ? colors.successText : colors.warningText }]}>
            {isSubmitted ? 'Submitted' : 'Pending'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    minWidth: 100,
    justifyContent: 'center',
  },
  pending: { backgroundColor: colors.warning },
  submitted: { backgroundColor: colors.success },
  text: { ...fonts.small, fontWeight: '700' },
});
