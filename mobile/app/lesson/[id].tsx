import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, spacing } from '../../src/theme/colors';
import type { LessonDetail } from '../../src/types/api';

export default function LessonScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await api.getLesson(token, id);
        setLesson(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Darsni yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id]);

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: lesson?.title || 'Dars' }} />
      <ErrorText message={error} />
      {lesson && (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.body}>{lesson.content}</Text>
          </ScrollView>
          <PrimaryButton
            title={`Testni boshlash (${lesson.questions.length} ta savol)`}
            onPress={() => router.push(`/quiz/${lesson.id}`)}
            disabled={lesson.questions.length === 0}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingVertical: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  body: { fontSize: 16, lineHeight: 24, color: colors.text, marginBottom: spacing.lg },
});
