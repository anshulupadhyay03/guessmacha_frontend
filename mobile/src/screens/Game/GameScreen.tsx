import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius, elevation } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import PollComposerSheet from './PollComposerSheet';
import { chatService, ChatMessage } from '../../services/chatService';
import { guessService } from '../../services/guessService';
import { useRealtimeChannel } from '../../hooks/useRealtimeChannel';
import type { MatchStackScreenProps } from '../../navigation/types';
import Toast from 'react-native-toast-message';

type InputMode = 'text' | 'poll';

export default function GameScreen({ navigation, route }: MatchStackScreenProps<'Game'>) {
  const { matchId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [draft, setDraft] = useState('');
  const [pollSheetVisible, setPollSheetVisible] = useState(false);
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const listRef = useRef<FlatList>(null);

  const questionCount = messages.filter((m) => m.type === 'text' || m.type === 'poll').length;

  // Initial history fetch — realtime augments this, doesn't replace it.
  useEffect(() => {
    chatService
      .fetchHistory(matchId)
      .then(setMessages)
      .catch((err) => Toast.show({ type: 'error', text1: 'Could not load chat history', text2: err.message }))
      .finally(() => setLoadingHistory(false));
  }, [matchId]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useRealtimeChannel(`match:${matchId}:chat`, {
    onEvent: (payload: any) => {
      if (payload?.type === 'new_message') {
        setMessages((prev) => [...prev, payload.message]);
        listRef.current?.scrollToEnd({ animated: true });
      }
      if (payload?.type === 'typing') setOpponentTyping(!!payload.isTyping);
      if (payload?.type === 'opponent_left') {
        navigation.replace('Result', { matchId });
      }
    },
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleSendText = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    // Optimistic append
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      matchId,
      senderId: 'me',
      type: 'text',
      text,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      await chatService.sendText(matchId, text);
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...m, status: 'failed' } : m)),
      );
    }
  };

  const handleSendPoll = async (question: string, options: string[]) => {
    try {
      await chatService.sendPoll(matchId, question, options);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: "Couldn't send poll", text2: err.message });
    }
  };

  const handleGuessPress = () => {
    navigation.navigate('SecretObjectSelection', {
      matchId,
      categoryId: '__guess_mode__',
    });
    // NOTE: in production, route to a dedicated GuessSheet (see spec) rather
    // than reusing SecretObjectSelection — left as a TODO wiring point since
    // the two screens share ~90% of the same picker UI.
  };

  return (
    <ScreenContainer noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.opponentName}>🎭 Opponent</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatText}>⏱ {formatTime(elapsedSeconds)}</Text>
          <Text style={styles.headerStatText}>❓ {questionCount}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={
            opponentTyping ? <Text style={styles.typingIndicator}>Opponent is typing…</Text> : null
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <Pressable
            style={styles.modeToggle}
            onPress={() => setInputMode(inputMode === 'text' ? 'poll' : 'text')}
          >
            <Text style={styles.modeToggleText}>{inputMode === 'text' ? '📊' : '💬'}</Text>
          </Pressable>

          {inputMode === 'text' ? (
            <>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask a question…"
                placeholderTextColor={colors.text.disabled}
                style={styles.textInput}
                maxLength={200}
                multiline
              />
              <Pressable style={styles.sendButton} onPress={handleSendText} disabled={!draft.trim()}>
                <Text style={styles.sendButtonText}>➤</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.pollOpenButton} onPress={() => setPollSheetVisible(true)}>
              <Text style={styles.pollOpenButtonText}>Create a Poll…</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Guess FAB */}
      <Pressable style={styles.guessFab} onPress={handleGuessPress}>
        <Text style={styles.guessFabText}>🔍 Guess</Text>
      </Pressable>

      <PollComposerSheet
        visible={pollSheetVisible}
        onClose={() => setPollSheetVisible(false)}
        onSend={handleSendPoll}
      />
    </ScreenContainer>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isMine = message.senderId === 'me' || message.id.startsWith('local-');
  return (
    <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {message.type === 'poll' ? (
          <>
            <Text style={styles.bubbleText}>{message.text}</Text>
            {message.pollOptions?.map((opt) => (
              <View key={opt} style={styles.pollOptionPill}>
                <Text style={styles.pollOptionText}>{opt}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.bubbleText}>{message.text}</Text>
        )}
        {message.status === 'failed' && <Text style={styles.failedText}>Failed to send — tap to retry</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  opponentName: { ...textStyles.bodyMedium, color: colors.text.primary },
  headerStats: { flexDirection: 'row', gap: spacing.md },
  headerStatText: { ...textStyles.small, color: colors.text.secondary },
  chatContent: { padding: spacing.md, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  bubbleMine: { backgroundColor: colors.accent.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.bg.surface, borderBottomLeftRadius: 4 },
  bubbleText: { ...textStyles.body, color: colors.text.primary },
  failedText: { ...textStyles.caption, color: colors.state.error, marginTop: 2 },
  pollOptionPill: {
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  pollOptionText: { ...textStyles.small, color: colors.text.primary },
  typingIndicator: { ...textStyles.caption, color: colors.text.secondary, paddingLeft: spacing.sm },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  modeToggle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleText: { fontSize: 18 },
  textInput: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: { color: colors.text.primary, fontSize: 16 },
  pollOpenButton: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pollOpenButtonText: { ...textStyles.bodyMedium, color: colors.accent.secondary },
  guessFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 90,
    backgroundColor: colors.accent.ranked,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...elevation.fab,
  },
  guessFabText: { ...textStyles.button, color: colors.text.primary },
});
