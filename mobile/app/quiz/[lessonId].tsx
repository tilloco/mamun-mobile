import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { LessonDetail, SubmitAnswerResult } from '../../src/types/api';

export default function QuizScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitAnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await api.getLesson(token, lessonId);
        setLesson(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Testni yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, lessonId]);

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (!lesson || lesson.questions.length === 0) {
    return (
      <Screen style={styles.center}>
        <ErrorText message={error || "Bu darsda hozircha savollar yo'q"} />
      </Screen>
    );
  }

  const question = lesson.questions[index];
  const isLast = index === lesson.questions.length - 1;

  const onSelectOption = (optionIndex: number) => {
    if (result) return; // javob berilgandan keyin o'zgartirib bo'lmaydi
    setSelected(optionIndex);
  };

  const onSubmit = async () => {
    if (selected === null || !token) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitAnswer(token, question.id, selected);
      setResult(res);
      if (res.isCorrect) setCorrectCount((c) => c + 1);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'FREE_LIMIT_REACHED') {
        setLimitReached(true);
      } else {
        setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = async () => {
    if (isLast) {
      setFinishing(true);
      try {
        if (token) await api.completeLesson(token, lesson.id);
      } catch {
        // Dars yakunlanganini belgilash muvaffaqiyatsiz bo'lsa ham, foydalanuvchini bloklamaymiz
      } finally {
        setFinishing(false);
        router.replace('/(tabs)/dashboard');
      }
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
  };

  if (limitReached) {
    return (
      <Screen style={styles.center}>
        <Stack.Screen options={{ title: 'Bepul limit' }} />
        <Text style={styles.limitTitle}>Bugungi bepul savollar tugadi</Text>
        <Text style={styles.limitSubtitle}>
          Premium tarifga o'tib, cheklovsiz test yeching. Ertaga yana {`3`} ta bepul savol ochiladi.
        </Text>
        <PrimaryButton title="Orqaga" onPress={() => router.back()} variant="outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: `Savol ${index + 1}/${lesson.questions.length}` }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ErrorText message={error} />
        <Text style={styles.questionText}>{question.text}</Text>

        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrectOption = result && result.correctIndex === i;
          const isWrongSelected = result && isSelected && !result.isCorrect;

          return (
            <Pressable
              key={i}
              onPress={() => onSelectOption(i)}
              disabled={!!result}
              style={[
                styles.option,
                isSelected && !result && styles.optionSelected,
                isCorrectOption && styles.optionCorrect,
                isWrongSelected && styles.optionWrong,
              ]}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          );
        })}

        {result && (
          <View style={[styles.feedback, result.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>{result.isCorrect ? "To'g'ri!" : "Noto'g'ri"}</Text>
            <Text style={styles.feedbackText}>{result.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {!result ? (
        <PrimaryButton title="Javobni tekshirish" onPress={onSubmit} loading={submitting} disabled={selected === null} />
      ) : (
        <PrimaryButton
          title={isLast ? 'Darsni yakunlash' : 'Keyingi savol'}
          onPress={onNext}
          loading={finishing}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.lg },
  questionText: { fontSize: 19, fontWeight: '600', color: colors.text, marginBottom: spacing.lg, lineHeight: 26 },
  option: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#EAF3F6' },
  optionCorrect: { borderColor: colors.success, backgroundColor: '#E7F5EA' },
  optionWrong: { borderColor: colors.danger, backgroundColor: '#FBEAE9' },
  optionText: { fontSize: 15, color: colors.text },
  feedback: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  feedbackCorrect: { backgroundColor: '#E7F5EA' },
  feedbackWrong: { backgroundColor: '#FBEAE9' },
  feedbackTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  feedbackText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  limitTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  limitSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
});
