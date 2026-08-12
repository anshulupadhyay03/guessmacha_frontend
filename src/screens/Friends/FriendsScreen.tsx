import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { friendsService, Friend } from '../../services/friendsService';
import { useRealtimeChannel } from '../../hooks/useRealtimeChannel';
import type { FriendsStackScreenProps } from '../../navigation/types';

type Tab = 'friends' | 'requests' | 'suggested';

interface FriendRequest {
  id: string;
  username: string;
  avatarEmoji: string;
}

export default function FriendsScreen({ navigation }: FriendsStackScreenProps<'Friends'>) {
  const [tab, setTab] = useState<Tab>('friends');
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    friendsService
      .listFriends()
      .then(setFriends)
      .finally(() => setLoading(false));
  }, []);

  useRealtimeChannel('presence:friends', {
    onPresenceChange: (state) => {
      const onlineIds = new Set(Object.keys(state ?? {}));
      setFriends((prev) => prev.map((f) => ({ ...f, online: onlineIds.has(f.id) })));
    },
  });

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInviteToMatch = (friend: Friend) => {
    (navigation.getParent() as any)?.navigate('MatchFlow', {
      screen: 'FriendInvite',
    });
  };

  const handleAccept = (req: FriendRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setFriends((prev) => [...prev, { id: req.id, username: req.username, avatarEmoji: req.avatarEmoji, online: false }]);
  };

  const handleDecline = (req: FriendRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  return (
    <ScreenContainer edges={['top']}>
      <Text style={styles.title}>Friends</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search by username"
        placeholderTextColor={colors.text.disabled}
        style={styles.search}
      />

      <View style={styles.tabRow}>
        {(['friends', 'requests', 'suggested'] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'friends' ? 'Friends' : t === 'requests' ? `Requests (${requests.length})` : 'Suggested'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'friends' &&
        (!loading && filteredFriends.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>No friends yet</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.friendRow}
                onPress={() => navigation.navigate('PublicProfile', { userId: item.id })}
              >
                <Text style={styles.friendAvatar}>{item.avatarEmoji}</Text>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{item.username}</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, item.online && styles.statusDotOnline]} />
                    <Text style={styles.statusText}>{item.online ? 'Online' : 'Offline'}</Text>
                  </View>
                </View>
                <Pressable style={styles.quickInvite} onPress={() => handleInviteToMatch(item)}>
                  <Text style={styles.quickInviteText}>Invite</Text>
                </Pressable>
              </Pressable>
            )}
          />
        ))}

      {tab === 'requests' && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending requests</Text>}
          renderItem={({ item }) => (
            <View style={styles.friendRow}>
              <Text style={styles.friendAvatar}>{item.avatarEmoji}</Text>
              <Text style={[styles.friendName, styles.friendInfo]}>{item.username}</Text>
              <Pressable style={styles.acceptBtn} onPress={() => handleAccept(item)}>
                <Text style={styles.acceptBtnText}>Accept</Text>
              </Pressable>
              <Pressable style={styles.declineBtn} onPress={() => handleDecline(item)}>
                <Text style={styles.declineBtnText}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {tab === 'suggested' && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No suggestions right now</Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.sm, marginBottom: spacing.sm },
  search: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tabRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.bg.surface },
  tabActive: { backgroundColor: colors.accent.primary },
  tabText: { ...textStyles.small, color: colors.text.secondary },
  tabTextActive: { color: colors.text.primary },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  friendAvatar: { fontSize: 28 },
  friendInfo: { flex: 1 },
  friendName: { ...textStyles.bodyMedium, color: colors.text.primary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text.disabled },
  statusDotOnline: { backgroundColor: colors.state.success },
  statusText: { ...textStyles.caption, color: colors.text.secondary },
  quickInvite: { backgroundColor: colors.accent.primary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  quickInviteText: { ...textStyles.small, color: colors.text.primary },
  acceptBtn: { backgroundColor: colors.state.success, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  acceptBtnText: { ...textStyles.small, color: colors.text.primary },
  declineBtn: { padding: spacing.xs },
  declineBtnText: { color: colors.text.disabled },
  emptyState: { alignItems: 'center', marginTop: spacing.xxxl, gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
});
