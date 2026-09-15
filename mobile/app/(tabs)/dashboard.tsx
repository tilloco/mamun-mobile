import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing, shadow } from '../../src/theme/colors';
import type { DashboardData } from '../../src/types/api';

function daysUntil(dateIso: string): number {
  const target = new Date(dateIso);
  const now = new Date();
  const diffMs = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function paceMessage(data: DashboardData, examDaysLeft: number | null): string {
  const remaining = Math.max(0, data.totalLessons - data.completedLessons);

  if (remaining === 0) {
    return "Barcha darslarni tugatdingiz! Endi mavjud test simulyatsiyalari bilan mustahkamlang.";
  }
  if (examDaysLeft === null) {
    return `Qolgan ${remaining} ta darsni tugatish uchun imtihon sanangizni belgilang.`;
  }
  if (examDaysLeft <= 0) {
    return "Belgilangan imtihon sanasi o'tdi - sanani yangilang.";
  }

  const perDay = remaining / examDaysLeft;
  if (perDay <= 1) {
    return `Shu tezlikda davom etsangiz, imtihongacha ulgurasiz. Kuniga taxminan ${Math.max(1, Math.ceil(perDay))} ta dars yetarli.`;
  }
  return `Imtihonga ${examDaysLeft} kun qoldi, ${remaining} ta dars qoldi - ulgurish uchun kuniga taxminan ${Math.ceil(perDay)} ta dars kerak bo'ladi.`;
}

export default function DashboardScreen() {
  const { token, user, refreshUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const [dashboard] = await Promise.all([api.getDashboard(token), refreshUser()]);
      setData(dashboard);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, refreshUser]);

  useEffect(() => {
    load();
  }, [load]);

  // Har safar bu tab fokusga kelganda (masalan darsni tugatib qaytganda) yangilaymiz
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const examDaysLeft = user?.examDate ? daysUntil(user.examDate) : null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.greeting}>Salom, {user?.name || ''}!</Text>

        <ErrorText message={error} />

        {data && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Umumiy progress</Text>
              <Text style={styles.bigNumber}>{data.progressPercent}%</Text>
              <ProgressBar percent={data.progressPercent} />
              <Text style={styles.cardSub}>
                {data.completedLessons} / {data.totalLessons} dars tugatildi
              </Text>
            </View>

            <View style={styles.rowCards}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>Streak</Text>
                <Text style={[styles.bigNumber, { color: colors.warning }]}>{data.streak} kun</Text>
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>Imtihongacha</Text>
                <Text style={styles.bigNumber}>{examDaysLeft !== null ? `${examDaysLeft} kun` : 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Prognoz</Text>
              <Text style={styles.paceText}>{paceMessage(data, examDaysLeft)}</Text>
            </View>

            {data.weakTopics.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Zaif mavzular</Text>
                {data.weakTopics.map((t) => (
                  <View key={t.title} style={styles.weakRow}>
                    <Text style={styles.weakTitle}>{t.title}</Text>
                    <Text style={styles.weakPercent}>{t.correctPercent}%</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.xl },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  rowCards: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1 },
  cardLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.xs },
  bigNumber: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  cardSub: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm },
  paceText: { fontSize: 15, color: colors.text, lineHeight: 21 },
  weakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  weakTitle: { fontSize: 14, color: colors.text, flex: 1 },
  weakPercent: { fontSize: 14, color: colors.danger, fontWeight: '600' },
});