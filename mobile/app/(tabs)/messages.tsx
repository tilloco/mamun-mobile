import React, { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function MessagesScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      api.getConversations(token).then(setConversations).catch(() => {});
    }, [token]),
  );

  const renderItem = ({ item }: { item: any }) => {
    const other = item.participants.find((p: any) => p.user.id !== user?.id)?.user;
    const title = item.type === 'GROUP' ? item.name : other?.name || 'Foydalanuvchi';
    const lastMessage = item.messages?.[0]?.content || '';
    const avatarUrl = item.type === 'GROUP' ? null : other?.avatarUrl;

    return (
      <TouchableOpacity style={styles.row} onPress={() => router.push(`/chat/${item.id}?title=${encodeURIComponent(title)}`)}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>{title?.[0]?.toUpperCase() || '?'}</Text>
          </View>
        )}
        <View style={styles.rowText}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.preview} numberOfLines={1}>{lastMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <Text style={styles.heading}>Xabarlar</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: colors.white, fontSize: 20, fontWeight: '700' },
  rowText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  preview: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
});