import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing, shadow } from '../../src/theme/colors';
import type { ExamResult } from '../../src/types/api';

export default function ExamResultScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !sessionId) return;
    api.getExamResult(token, sessionId)
      .then(setResult)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Natijani yuklab bo'lmadi"));
  }, [token, sessionId]);

  if (error) {
    return (
      <Screen style={styles.center}>
        <ErrorText message={error} />
      </Screen>
    );
  }

  if (!result) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Natija</Text>
          <Text style={styles.bigNumber}>{result.totalScore?.toFixed(1)} / {result.maxScore?.toFixed(1)}</Text>
          <Text style={styles.gradeText}>{result.grade ?? "Sertifikatga loyiq emas"}</Text>
        </View>

        <View style={styles.rowCards}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardLabel}>Yopiq savollar</Text>
            <Text style={styles.bigNumber}>{result.closedCorrect}/{result.closedTotal}</Text>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardLabel}>Ochiq savollar</Text>
            <Text style={styles.bigNumber}>{result.openFullyCorrect}/{result.openTotal}</Text>
          </View>
        </View>

        <PrimaryButton title="Bosh sahifaga qaytish" onPress={() => router.replace('/(tabs)/dashboard')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadow },
  cardLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.xs },
  bigNumber: { fontSize: 22, fontWeight: '700', color: colors.text },
  gradeText: { fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  rowCards: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1 },
});