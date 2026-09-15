import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { PickerField } from '../../src/components/PickerField';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAdmin } from '../../src/lib/admin-context';
import { colors, radius, spacing, shadow } from '../../src/theme/colors';

export default function AdminHome() {
  const router = useRouter();
  const { adminKey, tree, isLoading, error, selectedLessonId, setSelectedLessonId } = useAdmin();

  const [moduleId, setModuleId] = useState<string | null>(null);
  const [weekId, setWeekId] = useState<string | null>(null);

  const moduleOptions = tree.map((m) => ({ id: m.id, label: m.title }));
  const selectedModule = tree.find((m) => m.id === moduleId) || null;
  const weekOptions = selectedModule ? selectedModule.weeks.map((w) => ({ id: w.id, label: w.title })) : [];
  const selectedWeek = selectedModule?.weeks.find((w) => w.id === weekId) || null;
  const lessonOptions = selectedWeek ? selectedWeek.lessons.map((l) => ({ id: l.id, label: l.title })) : [];
  const selectedLesson = selectedWeek?.lessons.find((l) => l.id === selectedLessonId) || null;

  if (!adminKey) {
    return (
      <Screen>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Admin kaliti kiritilmagan</Text>
          <Text style={styles.emptyText}>Savol qo'shishdan oldin admin kalitini kiriting.</Text>
          <PrimaryButton title="Sozlamalarga o'tish" onPress={() => router.push('/admin/settings')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        {error && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Dars tanlang</Text>
        <PickerField
          label="Fan"
          value={selectedModule ? { id: selectedModule.id, label: selectedModule.title } : null}
          options={moduleOptions}
          onChange={(opt) => {
            setModuleId(opt.id);
            setWeekId(null);
            setSelectedLessonId(null);
          }}
        />
        <PickerField
          label="Hafta"
          value={selectedWeek ? { id: selectedWeek.id, label: selectedWeek.title } : null}
          options={weekOptions}
          onChange={(opt) => {
            setWeekId(opt.id);
            setSelectedLessonId(null);
          }}
          disabled={!selectedModule}
        />
        <PickerField
          label="Dars"
          value={selectedLesson ? { id: selectedLesson.id, label: selectedLesson.title } : null}
          options={lessonOptions}
          onChange={(opt) => setSelectedLessonId(opt.id)}
          disabled={!selectedWeek}
        />

        {isLoading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />}

        <Text style={styles.sectionTitle}>Savol qo'shish</Text>
        <Pressable
          style={[styles.actionCard, !selectedLessonId && styles.actionCardDisabled]}
          onPress={() => selectedLessonId && router.push('/admin/manual')}
          disabled={!selectedLessonId}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Qo'lda qo'shish</Text>
            <Text style={styles.actionSub}>Bir nechta savolni birma-bir kiriting</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={[styles.actionCard, !selectedLessonId && styles.actionCardDisabled]}
          onPress={() => selectedLessonId && router.push('/admin/bulk')}
          disabled={!selectedLessonId}
        >
          <Ionicons name="albums-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Ommaviy qo'shish</Text>
            <Text style={styles.actionSub}>Matn joylashtiring, ko'p savolni birdan yuklang</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        <Pressable style={styles.settingsLink} onPress={() => router.push('/admin/settings')}>
          <Text style={styles.settingsLinkText}>Sozlamalar</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing.lg, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm },
  banner: { backgroundColor: '#FBEAE8', borderRadius: radius.sm, padding: spacing.sm + 4, marginBottom: spacing.md },
  bannerText: { color: colors.danger, fontSize: 13 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow,
  },
  actionCardDisabled: { opacity: 0.5 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  actionSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  settingsLink: { alignSelf: 'center', marginTop: spacing.lg },
  settingsLinkText: { color: colors.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});