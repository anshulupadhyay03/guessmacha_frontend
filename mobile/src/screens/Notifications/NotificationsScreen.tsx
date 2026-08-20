import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { notificationsService, AppNotification } from '../../services/notificationsService';
import { useRealtimeChannel } from '../../hooks/useRealtimeChannel';

export default function NotificationsScreen({ navigation }: any) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsService
      .list()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  useRealtimeChannel('notifications:me', {
    onEvent: (payload: any) => {
      if (payload?.type === 'new_notification') {
        setItems((prev) => [payload.notification, ...prev]);
      }
    },
  });

  const handlePress = (item: AppNotification) => {
    if (item.deepLink) {
      navigation.navigate(item.deepLink.screen, item.deepLink.params);
    }
  };

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    notificationsService.dismiss(id).catch(() => {});
  };

  if (!loading && items.length === 0) {
    return (
      <ScreenContainer style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>✅</Text>
        <Text style={styles.emptyText}>You're all caught up</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.markAllRead} onPress={() => notificationsService.markAllRead()}>
          Mark all read
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => handlePress(item)}>
            {!item.read && <View style={styles.unreadDot} />}
            <Text style={styles.rowIcon}>{item.icon}</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowBody} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
            <Text style={styles.dismiss} onPress={() => handleDismiss(item.id)}>
              ✕
            </Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: { ...textStyles.titleLarge, color: colors.text.primary },
  markAllRead: { ...textStyles.small, color: colors.accent.secondary },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.primary,
    marginTop: 6,
  },
  rowIcon: { fontSize: 22 },
  rowInfo: { flex: 1 },
  rowTitle: { ...textStyles.bodyMedium, color: colors.text.primary },
  rowBody: { ...textStyles.small, color: colors.text.secondary, marginTop: 2 },
  dismiss: { color: colors.text.disabled, padding: spacing.xs },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...textStyles.body, color: colors.text.secondary },
});