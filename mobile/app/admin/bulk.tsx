import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { api } from '../../src/lib/api';
import { useAdmin } from '../../src/lib/admin-context';
import { colors, radius, spacing } from '../../src/theme/colors';

const PLACEHOLDER = `Q: O'zbekiston qachon mustaqillikka erishdi?
A) 1989
B) 1991
C) 1993
D) 1995
CORRECT: B
EXPLAIN: O'zbekiston 1991-yil 1-sentyabrda mustaqillikni e'lon qildi.
---
Q: Keyingi savol...`;

export default function AdminBulk() {
  const router = useRouter();
  const { adminKey, selectedLessonId } = useAdmin();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blockCount = useMemo(() => {
    const blocks = text.split(/\n\s*-{3,}\s*\n/).map((b) => b.trim()).filter((b) => b.length > 0);
    return blocks.length;
  }, [text]);

  const onSubmit = async () => {
    if (!adminKey || !selectedLessonId || !text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.createQuestionsBulkAdmin(adminKey, { lessonId: selectedLessonId, text });
      Alert.alert('Saqlandi', result.message);
      setText('');
      router.back();
    } catch (e: any) {
      setError(e.message || 'Xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        {error && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        )}
        <TextInput
          style={styles.textarea}
          value={text}
          onChangeText={setText}
          placeholder={PLACEHOLDER}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.hint}>
          Format: Q: savol / A)-D) variantlar / CORRECT: harf / EXPLAIN: tushuntirish / --- (keyingisi)
        </Text>
        <Text style={styles.count}>{blockCount} ta savol aniqlandi</Text>
        <PrimaryButton title="Yuklash" onPress={onSubmit} loading={submitting} disabled={!text.trim()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.xl },
  textarea: {
    minHeight: 280,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },
  count: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.md },
  banner: { backgroundColor: '#FBEAE8', borderRadius: radius.sm, padding: spacing.sm + 4, marginBottom: spacing.md },
  bannerText: { color: colors.danger, fontSize: 13 },
});