import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { api } from '../../src/lib/api';
import { useAdmin } from '../../src/lib/admin-context';
import { colors, radius, spacing } from '../../src/theme/colors';

interface DraftQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number | null;
  explanation: string;
  status: 'idle' | 'ok' | 'err';
  statusMsg: string;
}

function blankQuestion(): DraftQuestion {
  return {
    id: 'q' + Date.now() + Math.random().toString(36).slice(2, 7),
    text: '',
    options: ['', ''],
    correctIndex: null,
    explanation: '',
    status: 'idle',
    statusMsg: '',
  };
}

export default function AdminManual() {
  const router = useRouter();
  const { adminKey, selectedLessonId } = useAdmin();
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const updateQuestion = (id: string, patch: Partial<DraftQuestion>) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const updateOption = (id: string, idx: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        const options = [...q.options];
        options[idx] = value;
        return { ...q, options };
      }),
    );
  };

  const addOption = (id: string) => {
    setQuestions((qs) => qs.map((q) => (q.id === id && q.options.length < 4 ? { ...q, options: [...q.options, ''] } : q)));
  };

  const removeOption = (id: string, idx: number) => {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id || q.options.length <= 2) return q;
        const options = q.options.filter((_, i) => i !== idx);
        let correctIndex = q.correctIndex;
        if (correctIndex === idx) correctIndex = null;
        else if (correctIndex !== null && correctIndex > idx) correctIndex -= 1;
        return { ...q, options, correctIndex };
      }),
    );
  };

  const addCard = () => setQuestions((qs) => [...qs, blankQuestion()]);
  const removeCard = (id: string) => setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.id !== id) : qs));

  const validate = (): string[] => {
    const errors: string[] = [];
    questions.forEach((q, i) => {
      const label = `${i + 1}-savol`;
      if (!q.text.trim()) errors.push(`${label}: matn kiritilmagan`);
      if (q.options.some((o) => !o.trim())) errors.push(`${label}: bo'sh variant bor`);
      if (q.correctIndex === null) errors.push(`${label}: to'g'ri javob belgilanmagan`);
      if (!q.explanation.trim()) errors.push(`${label}: tushuntirish kiritilmagan`);
    });
    return errors;
  };

  const onSaveAll = async () => {
    if (!adminKey || !selectedLessonId) return;
    const errors = validate();
    if (errors.length) {
      setBanner(errors.join(' · '));
      return;
    }
    setBanner(null);
    setSaving(true);

    const results = await Promise.all(
      questions.map(async (q) => {
        try {
          await api.createQuestionAdmin(adminKey, {
            lessonId: selectedLessonId,
            text: q.text.trim(),
            options: q.options.map((o) => o.trim()),
            correctIndex: q.correctIndex as number,
            explanation: q.explanation.trim(),
          });
          return { ...q, status: 'ok' as const, statusMsg: 'Saqlandi' };
        } catch (e: any) {
          return { ...q, status: 'err' as const, statusMsg: e.message || 'Xatolik' };
        }
      }),
    );

    const remaining = results.filter((q) => q.status !== 'ok');
    const okCount = results.length - remaining.length;
    setSaving(false);

    if (remaining.length === 0) {
      Alert.alert('Saqlandi', `${okCount} ta savol saqlandi`);
      router.back();
      return;
    }

    setQuestions(remaining);
    setBanner(okCount > 0 ? `${okCount} ta saqlandi, ${remaining.length} tasi xato bilan qoldi` : null);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        {banner && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        )}

        {questions.map((q, qi) => (
          <View key={q.id} style={[styles.card, q.status === 'ok' && styles.cardOk, q.status === 'err' && styles.cardErr]}>
            <View style={styles.cardHead}>
              <Text style={styles.qnum}>{qi + 1}</Text>
              {questions.length > 1 && (
                <Pressable onPress={() => removeCard(q.id)}>
                  <Text style={styles.removeText}>O'chirish</Text>
                </Pressable>
              )}
            </View>

            <TextInput
              style={styles.textarea}
              value={q.text}
              onChangeText={(t) => updateQuestion(q.id, { text: t })}
              placeholder="Savol matni..."
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <Text style={styles.fieldLabel}>Variantlar (to'g'risini belgilang)</Text>
            {q.options.map((opt, oi) => (
              <View key={oi} style={styles.optRow}>
                <Pressable
                  style={[styles.bubble, q.correctIndex === oi && styles.bubbleActive]}
                  onPress={() => updateQuestion(q.id, { correctIndex: oi })}
                >
                  <Text style={[styles.bubbleText, q.correctIndex === oi && styles.bubbleTextActive]}>
                    {String.fromCharCode(65 + oi)}
                  </Text>
                </Pressable>
                <TextInput
                  style={styles.optInput}
                  value={opt}
                  onChangeText={(t) => updateOption(q.id, oi, t)}
                  placeholder={`${String.fromCharCode(65 + oi)} varianti`}
                  placeholderTextColor={colors.textMuted}
                />
                {q.options.length > 2 && (
                  <Pressable onPress={() => removeOption(q.id, oi)}>
                    <Ionicons name="close" size={18} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            ))}
            {q.options.length < 4 && (
              <Pressable style={styles.addOption} onPress={() => addOption(q.id)}>
                <Text style={styles.addOptionText}>+ Variant qo'shish</Text>
              </Pressable>
            )}

            <Text style={styles.fieldLabel}>Tushuntirish</Text>
            <TextInput
              style={styles.textarea}
              value={q.explanation}
              onChangeText={(t) => updateQuestion(q.id, { explanation: t })}
              placeholder="To'g'ri javob nima uchun to'g'ri..."
              placeholderTextColor={colors.textMuted}
              multiline
            />

            {q.statusMsg ? (
              <Text style={[styles.statusMsg, q.status === 'err' && styles.statusErr]}>{q.statusMsg}</Text>
            ) : null}
          </View>
        ))}

        <Pressable style={styles.addCard} onPress={addCard}>
          <Text style={styles.addCardText}>+ Yana savol qo'shish</Text>
        </Pressable>

        <PrimaryButton title="Barchasini saqlash" onPress={onSaveAll} loading={saving} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.xl },
  banner: { backgroundColor: '#FBEAE8', borderRadius: radius.sm, padding: spacing.sm + 4, marginBottom: spacing.md },
  bannerText: { color: colors.danger, fontSize: 13 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardOk: { borderLeftColor: colors.primary },
  cardErr: { borderLeftColor: colors.danger },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  qnum: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  removeText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  textarea: {
    minHeight: 56,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
  fieldLabel: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm + 4, marginBottom: 6 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs + 2 },
  bubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  bubbleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  bubbleText: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted },
  bubbleTextActive: { color: colors.white },
  optInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 4,
    fontSize: 14,
    color: colors.text,
  },
  addOption: { marginTop: spacing.xs, alignSelf: 'flex-start' },
  addOptionText: { fontSize: 13, color: colors.primary },
  statusMsg: { fontSize: 12.5, color: colors.primary, marginTop: spacing.sm },
  statusErr: { color: colors.danger },
  addCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addCardText: { fontSize: 13.5, color: colors.textMuted },
});