import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/colors';

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
  },
});
