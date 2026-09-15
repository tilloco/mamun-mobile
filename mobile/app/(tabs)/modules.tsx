import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { CourseModule } from '../../src/types/api';

export default function ModulesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await api.listModules(token);
      setModules(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Kursni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Kurs dasturi</Text>
        <ErrorText message={error} />

        {modules.map((m) => (
          <View key={m.id} style={styles.moduleBlock}>
            <Text style={styles.moduleTitle}>{m.title}</Text>
            {m.weeks.map((w) => (
              <View key={w.id} style={styles.weekBlock}>
                <Text style={styles.weekTitle}>{w.title}</Text>
                {w.lessons.map((l) => (
                  <Pressable
                    key={l.id}
                    style={({ pressed }) => [styles.lessonRow, pressed && styles.lessonRowPressed]}
                    onPress={() => router.push(`/lesson/${l.id}`)}
                  >
                    <Text style={styles.lessonText}>{l.title}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        ))}

        {modules.length === 0 && !error && (
          <Text style={styles.empty}>Hozircha kurs kontenti qo'shilmagan.</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  moduleBlock: { marginBottom: spacing.lg },
  moduleTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  weekBlock: { marginBottom: spacing.sm, marginLeft: spacing.sm },
  weekTitle: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.xs,
  },
  lessonRowPressed: { opacity: 0.7 },
  lessonText: { fontSize: 15, color: colors.text, flex: 1 },
  chevron: { fontSize: 20, color: colors.textMuted },
  empty: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
