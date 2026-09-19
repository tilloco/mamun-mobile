import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ErrorText } from '../../src/components/ErrorText';
import { SkeletonBlock } from '../../src/components/Skeleton';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing, shadow } from '../../src/theme/colors';
import type { DashboardData } from '../../src/types/api';

function daysUntil(dateIso: string): number {
  const target = new Date(dateIso);
  const now = new Date();
  const diffMs = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

export default function DashboardScreen() {
  const router = useRouter();
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
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SkeletonBlock style={{ width: 160, height: 24, marginBottom: spacing.md }} />
          <SkeletonBlock style={{ height: 72, marginBottom: spacing.md }} />
          <SkeletonBlock style={{ height: 84 }} />
        </ScrollView>
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
        <View style={styles.hero}>
          <Text style={styles.heroGreeting}>Salom, {user?.name || ''}!</Text>
          <Text style={styles.heroSubtext}>Bugun ham davom etamizmi?</Text>
        </View>

        <ErrorText message={error} />

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.mockCard}
          onPress={() => router.push('/(tabs)/exam')}
        >
          <View style={styles.mockIcon}>
            <Ionicons name="document-text" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mockTitle}>Mock</Text>
            <Text style={styles.mockSub}>Savollarni yechib ko'ring</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </TouchableOpacity>

        {data && (
          <View style={styles.row}>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.cardLabel}>Progress</Text>
              <Text style={styles.value}>{data.progressPercent}%</Text>
              <ProgressBar percent={data.progressPercent} />
              <Text style={styles.cardSub}>
                {data.completedLessons}/{data.totalLessons} dars
              </Text>
            </View>

            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.cardLabel}>Imtihongacha</Text>
              <Text style={styles.value}>{examDaysLeft !== null ? examDaysLeft : '—'}</Text>
              <Text style={styles.cardSub}>kun qoldi</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.md, paddingBottom: spacing.xl },
  hero: {
    backgroundColor: colors.hero,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  heroGreeting: { fontSize: 18, fontWeight: '700', color: colors.heroText },
  heroSubtext: { fontSize: 13, color: colors.heroText, opacity: 0.8, marginTop: 2 },
  mockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  mockSub: { fontSize: 13, color: colors.white, opacity: 0.85 },
  row: { flexDirection: 'row', gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  cardLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.xs },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  value: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
});