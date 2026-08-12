import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { friendsService, Friend } from '../../services/friendsService';
import Toast from 'react-native-toast-message';

export default function FriendInviteScreen({ navigation }: any) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);

  useEffect(() => {
    friendsService
      .listFriends()
      .then((list) => setFriends(list.sort((a, b) => Number(b.online) - Number(a.online))))
      .catch((err) => Toast.show({ type: 'error', text1: "Couldn't load friends", text2: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInvite = async (friend: Friend) => {
    setPendingInviteId(friend.id);
    try {
      const match: any = await friendsService.sendInvite(friend.id);
      navigation.replace('WaitingRoom', { matchId: match.id });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: `Couldn't invite ${friend.username}`, text2: err.message });
      setPendingInviteId(null);
    }
  };

  const handleShareLink = async () => {
    try {
      // In practice, create the match first, then generate + share its link.
      const match: any = await friendsService.sendInvite('__link__' as any);
      const link = await friendsService.generateInviteLink(match.id);
      await Share.share({ message: `Join my Guess It match: ${link}` });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: "Couldn't create invite link", text2: err.message });
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Invite a Friend</Text>

      <Pressable style={styles.shareRow} onPress={handleShareLink}>
        <Text style={styles.shareEmoji}>🔗</Text>
        <Text style={styles.shareText}>Share Invite Link</Text>
      </Pressable>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search friends"
        placeholderTextColor={colors.text.disabled}
        style={styles.search}
      />

      {!loading && filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyText}>No friends yet — find some to challenge them directly.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendRow}>
              <Text style={styles.friendAvatar}>{item.avatarEmoji}</Text>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.username}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, item.online && styles.statusDotOnline]} />
                  <Text style={styles.statusText}>{item.online ? 'Online' : 'Offline'}</Text>
                </View>
              </View>
              <Pressable
                style={styles.inviteButton}
                onPress={() => handleInvite(item)}
                disabled={pendingInviteId === item.id}
              >
                <Text style={styles.inviteButtonText}>
                  {pendingInviteId === item.id ? 'Inviting…' : 'Invite'}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.md },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  shareEmoji: { fontSize: 18 },
  shareText: { ...textStyles.bodyMedium, color: colors.accent.secondary },
  search: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  friendAvatar: { fontSize: 28 },
  friendInfo: { flex: 1 },
  friendName: { ...textStyles.bodyMedium, color: colors.text.primary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text.disabled },
  statusDotOnline: { backgroundColor: colors.state.success },
  statusText: { ...textStyles.caption, color: colors.text.secondary },
  inviteButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inviteButtonText: { ...textStyles.small, color: colors.text.primary },
  emptyState: { alignItems: 'center', marginTop: spacing.xxxl, gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
});