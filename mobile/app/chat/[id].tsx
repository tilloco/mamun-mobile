import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { api } from '../../src/lib/api';
import { getSocket } from '../../src/lib/socket';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function ChatScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const { token, user } = useAuth();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: title ? decodeURIComponent(title) : 'Chat' });
  }, [title]);

  useEffect(() => {
    if (!token || !id) return;

    api.getMessages(token, id).then((msgs) => setMessages(msgs.reverse()));

    const socket = getSocket(token);
    socket.emit('conversation:join', id);

    const onNewMessage = (msg: any) => {
      if (msg.conversationId === id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('message:new', onNewMessage);

    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, [token, id]);

  const send = () => {
    if (!text.trim() || !token) return;
    const socket = getSocket(token);
    socket.emit('message:send', { conversationId: id, type: 'TEXT', content: text.trim() });
    setText('');
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.senderId === user?.id;
    return (
      <View style={[styles.bubbleRow, isMine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={isMine ? styles.textMine : styles.textTheirs}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Xabar yozing..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={send} disabled={!text.trim()}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.xs },
  bubbleRow: { flexDirection: 'row', marginVertical: 2 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '75%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  textMine: { color: colors.white, fontSize: 15 },
  textTheirs: { color: colors.text, fontSize: 15 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  input: {
    flex: 1, backgroundColor: colors.background, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100,
    fontSize: 15, color: colors.text,
  },
  sendButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonText: { color: colors.white, fontSize: 18 },
});