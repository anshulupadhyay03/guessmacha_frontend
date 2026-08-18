import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import { getCategoryById } from '../../constants/categories';
import Button from '../../components/common/Button';
import ScreenContainer from '../../components/common/ScreenContainer';
import { matchService } from '../../services/matchService';
import type { MatchStackScreenProps } from '../../navigation/types';
import Toast from 'react-native-toast-message';

export default function SecretObjectSelectionScreen({
  navigation,
  route,
}: MatchStackScreenProps<'SecretObjectSelection'>) {
  const { matchId, categoryId } = route.params;
  const category = getCategoryById(categoryId);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [locking, setLocking] = useState(false);

  const filtered = useMemo(() => {
    if (!category) return [];
    return category.objects.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  }, [category, search]);

  const handleLockIn = async () => {
    if (!selected) return;
    setLocking(true);
    try {
      await matchService.lockSecretObject(matchId, selected);
      setLocked(true);
      // WaitingRoom polls/subscribes for both-locked state and advances to Game itself.
      navigation.replace('WaitingRoom', { matchId });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: "Couldn't lock in your object", text2: err.message });
    } finally {
      setLocking(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Choose Your Secret</Text>
      <Text style={styles.subtitle}>
        🔒 Private to you — your opponent can never see this until they guess it correctly.
      </Text>

      {!locked && (
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={`Search ${category?.label ?? 'objects'}…`}
          placeholderTextColor={colors.text.disabled}
          style={styles.search}
        />
      )}

      {selected && (
        <View style={styles.previewCard}>
          <Text style={styles.previewEmoji}>{category?.icon}</Text>
          <Text style={styles.previewText}>{selected}</Text>
          <Text style={styles.previewLock}>🔒</Text>
        </View>
      )}

      {!locked && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No matches — try another spelling</Text>
          }
          renderItem={({ item }) => {
            const isSelected = selected === item;
            return (
              <Pressable
                onPress={() => setSelected(item)}
                style={[styles.tile, isSelected && styles.tileSelected]}
              >
                <Text style={styles.tileText}>{item}</Text>
              </Pressable>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <Button
          label="Lock In"
          onPress={handleLockIn}
          disabled={!selected || locked}
          loading={locking}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.sm },
  subtitle: { ...textStyles.small, color: colors.text.secondary, marginBottom: spacing.md },
  search: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.primaryMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  previewEmoji: { fontSize: 20 },
  previewText: { ...textStyles.bodyMedium, color: colors.text.primary, flex: 1 },
  previewLock: { fontSize: 16 },
  grid: { paddingBottom: spacing.xl },
  row: { gap: spacing.sm },
  tile: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tileSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryMuted,
  },
  tileText: { ...textStyles.small, color: colors.text.primary, textAlign: 'center' },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  footer: { paddingBottom: spacing.lg },
});