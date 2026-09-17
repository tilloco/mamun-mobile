import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ErrorText } from '../../src/components/ErrorText';
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { useGoogleAuth } from '../../src/lib/google-auth';
import { colors, spacing } from '../../src/theme/colors';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function PhoneScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      (async () => {
        setGoogleLoading(true);
        setError(null);
        try {
          const result = await api.loginWithGoogle(response.params.id_token);
          await signIn(result.accessToken);
          router.replace('/(tabs)/dashboard');
        } catch (e) {
          setError(e instanceof ApiError ? e.message : "Google orqali kirishda xatolik yuz berdi");
        } finally {
          setGoogleLoading(false);
        }
      })();
    }
  }, [response]);

  const onSubmit = async () => {
    setError(null);
    const normalized = email.trim().toLowerCase();

    if (!isValidEmail(normalized)) {
      setError("Email manzilni to'g'ri kiriting, masalan email@example.com");
      return;
    }

    setLoading(true);
    try {
      await api.requestOtp(normalized);
      router.push({ pathname: '/(auth)/otp', params: { email: normalized } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.content}>
      <Text style={styles.title}>Huquq imtihoniga tayyorgarlik</Text>
      <Text style={styles.subtitle}>Davom etish uchun email manzilingizni kiriting</Text>

      <PrimaryButton
        title="Google orqali kirish"
        onPress={() => promptAsync()}
        loading={googleLoading}
        disabled={!request}
      />

      <Text style={styles.orText}>yoki</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        placeholderTextColor={colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <ErrorText message={error} />

      <PrimaryButton title="Kodni yuborish" onPress={onSubmit} loading={loading} disabled={email.length < 5} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.xl },
  orText: { textAlign: 'center', color: colors.textMuted, marginVertical: spacing.md },
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
});