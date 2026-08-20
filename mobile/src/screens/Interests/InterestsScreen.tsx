import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import { CATEGORIES } from '../../constants/categories';
import Button from '../../components/common/Button';
import ScreenContainer from '../../components/common/ScreenContainer';
import { supabase } from '../../api/supabaseClient';
import Toast from 'react-native-toast-message';

const MIN_SELECTION = 3;

export default function InterestsScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const remaining = Math.max(0, MIN_SELECTION - selectedIds.length);
  const canContinue = remaining === 0 && !saving;

  const handleContinue = async () => {
    if (!canContinue) return;
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (!userId) throw new Error('No active session');

      const { error } = await supabase
        .from('profiles')
        .update({ interests: selectedIds })
        .eq('id', userId);
      if (error) throw error;
      // AppNavigator's `hasCompletedInterests` flag (from useAuth/profile) should
      // flip on the next profile refresh/realtime tick and route to MainFlow.
    } catch (err: any) {
      Toast.show({ type: 'error', text1: "Couldn't save interests", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>What do you enjoy?</Text>
      <Text style={styles.subtitle}>
        Pick at least {MIN_SELECTION} categories — this helps us match you with relevant
        opponents and daily challenges.
      </Text>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);
          return (
            <Pressable
              onPress={() => toggle(item.id)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={styles.chipEmoji}>{item.icon}</Text>
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {item.label}
              </Text>
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          );
        }}
      />

      <View style={styles.ctaWrap}>
        <Text style={styles.helper}>
          {remaining > 0
            ? `Pick ${remaining} more to continue`
            : `${selectedIds.length} selected`}
        </Text>
        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          loading={saving}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  grid: {
    paddingBottom: spacing.xl,
  },
  row: {
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.accent.primaryMuted,
    borderColor: colors.accent.primary,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    flexShrink: 1,
  },
  chipLabelSelected: {
    color: colors.text.primary,
  },
  checkmark: {
    marginLeft: 'auto',
    color: colors.accent.secondary,
    fontWeight: '700',
  },
  ctaWrap: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  helper: {
    ...textStyles.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});