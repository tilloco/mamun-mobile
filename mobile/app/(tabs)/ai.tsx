import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { AiRecommendation, ExamReadiness } from '../../src/types/api';

const READINESS_LABEL: Record<ExamReadiness, string> = {
  past_due: 'Imtihon sanasi o\'tib ketgan',
  behind: 'Sur\'atni oshirish kerak',
  on_track: 'To\'g\'ri sur\'atdasiz',
  ahead: 'Barcha darslar tugatilgan',
  unknown: 'Hali aniqlanmagan',
};

const READINESS_COLOR: Record<ExamReadiness, string> = {
  past_due: colors.danger,
  behind: colors.warning,
  on_track: colors.success,
  ahead: colors.success,
  unknown: colors.textMuted,
};

export default function AiScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<AiRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premiumRequired, setPremiumRequired] = useState(false);

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!token) return;
      setError(null);
      try {
        const rec = await api.getAiRecommendation(token, forceRefresh);
        setPremiumRequired(false);
        setData(rec);
      } catch (e) {
        if (e instanceof ApiError && e.code === 'PREMIUM_REQUIRED') {
          setPremiumRequired(true);
        } else {
          setError(e instanceof ApiError ? e.message : "Tavsiyani yuklab bo'lmadi");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (premiumRequired) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.paywallTitle}>AI shaxsiy yordamchi</Text>
        <Text style={styles.paywallBody}>
          Zaif mavzularingiz va xato javoblaringiz asosida sizga maxsus tayyorlangan o'quv rejasi va maslahatlar
          faqat Premium foydalanuvchilar uchun mavjud.
        </Text>
        <PrimaryButton title="Premium haqida" onPress={() => load()} variant="outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.heading}>AI shaxsiy tavsiya</Text>
        <ErrorText message={error} />

        {data && (
          <>
            <View style={[styles.card, styles.summaryCard]}>
              <View style={[styles.badge, { backgroundColor: READINESS_COLOR[data.examReadiness] }]}>
                <Text style={styles.badgeText}>{READINESS_LABEL[data.examReadiness]}</Text>
              </View>
              <Text style={styles.summaryText}>{data.summary}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>E'tibor talab qiladigan mavzular</Text>
              {data.focusAreas.map((f, i) => (
                <View key={`${f.topic}-${i}`} style={i > 0 ? styles.focusRow : undefined}>
                  <Text style={styles.focusTopic}>{f.topic}</Text>
                  <Text style={styles.focusReason}>{f.reason}</Text>
                  <Text style={styles.focusSuggestion}>→ {f.suggestion}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Reja</Text>
              {data.studyPlan.map((s, i) => (
                <View key={`${s.label}-${i}`} style={styles.planRow}>
                  <Text style={styles.planLabel}>{s.label}</Text>
                  <Text style={styles.planFocus}>{s.focus}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, styles.motivationCard]}>
              <Text style={styles.motivationText}>{data.motivation}</Text>
            </View>

            <Text style={styles.metaText}>
              {new Date(data.generatedAt).toLocaleString('uz-UZ')} da tayyorlangan
              {data.throttled ? ' — yangilash bir soatdan keyin qayta mavjud bo\'ladi' : ''}
            </Text>

            <PrimaryButton title="Qayta generatsiya qilish" onPress={onRefresh} variant="outline" loading={refreshing} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  heading: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryCard: { gap: spacing.sm },
  badge: { alignSelf: 'flex-start', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  summaryText: { fontSize: 15, color: colors.text, lineHeight: 21 },
  cardLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.sm },
  focusRow: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  focusTopic: { fontSize: 15, fontWeight: '700', color: colors.text },
  focusReason: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  focusSuggestion: { fontSize: 14, color: colors.primary, marginTop: spacing.xs, fontWeight: '600' },
  planRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  planLabel: { fontSize: 14, fontWeight: '700', color: colors.accent, width: 72 },
  planFocus: { fontSize: 14, color: colors.text, flex: 1 },
  motivationCard: { backgroundColor: colors.primary },
  motivationText: { fontSize: 15, color: colors.white, fontStyle: 'italic', lineHeight: 21 },
  metaText: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md, textAlign: 'center' },
  paywallTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  paywallBody: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
});
