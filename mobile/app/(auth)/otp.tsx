import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, spacing } from '../../src/theme/colors';

const RESEND_COOLDOWN_SEC = 60;

export default function OtpScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onVerify = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, code);
      await signIn(res.accessToken);
      router.replace('/'); // index.tsx keyingi qadamga (profil to'ldirish yoki dashboard) yo'naltiradi
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setResending(true);
    try {
      await api.requestOtp(email);
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen style={styles.content}>
      <Text style={styles.title}>Tasdiqlash kodi</Text>
      <Text style={styles.subtitle}>{email} manziliga yuborilgan 6 xonali kodni kiriting</Text>

      <TextInput
        style={styles.input}
        placeholder="123456"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        autoFocus
      />

      <ErrorText message={error} />

      <View style={styles.buttonGroup}>
        <PrimaryButton title="Tasdiqlash" onPress={onVerify} loading={loading} disabled={code.length < 4} />

        <PrimaryButton
          title={cooldown > 0 ? `Qayta yuborish (${cooldown}s)` : 'Kodni qayta yuborish'}
          onPress={onResend}
          loading={resending}
          disabled={cooldown > 0}
          variant="outline"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.xl },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  buttonGroup: { gap: spacing.md },
});
