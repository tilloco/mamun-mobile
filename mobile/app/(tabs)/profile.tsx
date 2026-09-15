import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const onLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.card}>
          <Row label="Ism" value={user?.name || '—'} />
          <Row label="Telefon" value={user?.phone || '—'} />
          <Row
            label="Imtihon sanasi"
            value={user?.examDate ? new Date(user.examDate).toLocaleDateString('uz-UZ') : '—'}
          />
          <Row label="Tarif" value={user?.isPremium ? 'Premium' : 'Bepul'} />
          <Row label="Referral kodi" value={user?.referralCode || '—'} last />
        </View>

        <View style={styles.card}>
          <Row label="Hamyon balansi" value={`${user?.walletBalance ?? 0} so'm`} last />
        </View>

        <PrimaryButton title="Chiqish" onPress={onLogout} variant="outline" />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm + 4 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '600' },
});
