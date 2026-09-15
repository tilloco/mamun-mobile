import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAdmin } from '../../src/lib/admin-context';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function AdminSettings() {
  const router = useRouter();
  const { adminKey, saveKey, clearKey, error } = useAdmin();
  const [value, setValue] = useState(adminKey || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const onSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      await saveKey(value.trim());
      setMsg({ text: 'Saqlandi va ulanish tekshirildi.', ok: true });
    } catch (e: any) {
      setMsg({ text: e.message || 'Xatolik', ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Admin kaliti</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="x-admin-key"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PrimaryButton title="Saqlash" onPress={onSave} loading={saving} disabled={!value.trim()} />

        {msg && <Text style={[styles.msg, { color: msg.ok ? colors.success : colors.danger }]}>{msg.text}</Text>}
        {!msg && error && <Text style={[styles.msg, { color: colors.danger }]}>{error}</Text>}

        {adminKey && (
          <PrimaryButton
            title="Kalitni o'chirish"
            onPress={async () => {
              await clearKey();
              setValue('');
              router.back();
            }}
            variant="outline"
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.lg, gap: spacing.md },
  label: { fontSize: 13, color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.text,
  },
  msg: { fontSize: 13, textAlign: 'center' },
});