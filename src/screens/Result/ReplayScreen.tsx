import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { chatService, ChatMessage } from '../../services/chatService';
import type { MatchStackScreenProps } from '../../navigation/types';

export default function ReplayScreen({ route }: MatchStackScreenProps<'Replay'>) {
  const { matchId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    chatService
      .fetchHistory(matchId)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [matchId]);

  const visibleMessages = messages.slice(0, cursor + 1);

  return (
    <ScreenContainer noPadding>
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          Message {Math.min(cursor + 1, messages.length)} of {messages.length}
        </Text>
      </View>

      <FlatList
        data={visibleMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.senderId === 'me' && styles.bubbleRowMine]}>
            <View
              style={[
                styles.bubble,
                item.senderId === 'me' ? styles.bubbleMine : styles.bubbleTheirs,
              ]}
            >
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.controls}>
        <Pressable
          style={styles.controlButton}
          onPress={() => setCursor((c) => Math.max(0, c - 1))}
          disabled={cursor === 0}
        >
          <Text style={styles.controlText}>⏮ Back</Text>
        </Pressable>
        <Pressable
          style={styles.controlButton}
          onPress={() => setCursor((c) => Math.min(messages.length - 1, c + 1))}
          disabled={cursor >= messages.length - 1}
        >
          <Text style={styles.controlText}>Next ⏭</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    alignItems: 'center',
  },
  progressText: { ...textStyles.small, color: colors.text.secondary },
  list: { padding: spacing.md, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: radius.lg, padding: spacing.sm },
  bubbleMine: { backgroundColor: colors.accent.primary },
  bubbleTheirs: { backgroundColor: colors.bg.surface },
  bubbleText: { ...textStyles.body, color: colors.text.primary },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  controlButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  controlText: { ...textStyles.bodyMedium, color: colors.text.primary },
});