import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme/colors';

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});
