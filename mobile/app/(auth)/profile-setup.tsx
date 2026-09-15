import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, spacing } from '../../src/theme/colors';

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { token, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const minExamDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // ertaga
  const [examDate, setExamDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!token) return;
    if (name.trim().length < 2) {
      setError("Ismingizni kiriting");
      return;
    }

    setLoading(true);
    try {
      await api.updateProfile(token, { name: name.trim(), examDate: toIsoDate(examDate) });
      await refreshUser();
      router.replace('/'); // index.tsx endi dashboard'ga yo'naltiradi
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.content}>
      <Text style={styles.title}>Tanishib olaylik</Text>
      <Text style={styles.subtitle}>Ismingiz va imtihon rejangiz bo'yicha 2 ta savol</Text>

      <Text style={styles.label}>Ismingiz</Text>
      <TextInput
        style={styles.input}
        placeholder="Masalan: Aziz"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={styles.label}>Imtihonni qachon topshirmoqchisiz?</Text>
      <View style={styles.dateRow}>
        <Text style={styles.dateText} onPress={() => setShowPicker(true)}>
          {examDate.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>
      {showPicker && (
        <DateTimePicker
          value={examDate}
          mode="date"
          minimumDate={minExamDate}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) setExamDate(selected);
          }}
        />
      )}

      <ErrorText message={error} />

      <PrimaryButton title="Davom etish" onPress={onSubmit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.xl },
  label: { fontSize: 14, color: colors.text, marginBottom: spacing.xs, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 17,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  dateRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  dateText: { fontSize: 17, color: colors.text },
});
