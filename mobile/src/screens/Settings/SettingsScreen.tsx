import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View, Pressable } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { supabase } from '../../api/supabaseClient';
import type { ProfileStackScreenProps } from '../../navigation/types';

interface SettingsGroup {
  title: string;
  rows: {
    label: string;
    type: 'toggle' | 'chevron' | 'destructive';
    value?: boolean;
    onToggle?: (v: boolean) => void;
    onPress?: () => void;
  }[];
}

export default function SettingsScreen({ navigation }: ProfileStackScreenProps<'Settings'>) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [matchInvitesEnabled, setMatchInvitesEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Dark mode is default per design brief

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // AppNavigator's auth listener routes back to AuthFlow automatically.
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account and match history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: call a confirmed server-side delete_account RPC (re-auth or typed confirmation first).
          },
        },
      ],
    );
  };

  const groups: SettingsGroup[] = [
    {
      title: 'Account',
      rows: [
        { label: 'Edit Profile', type: 'chevron', onPress: () => navigation.navigate('Profile') },
        { label: 'Blocked Users', type: 'chevron', onPress: () => {} },
      ],
    },
    {
      title: 'Notifications',
      rows: [
        { label: 'Push Notifications', type: 'toggle', value: pushEnabled, onToggle: setPushEnabled },
        {
          label: 'Match Invites',
          type: 'toggle',
          value: matchInvitesEnabled,
          onToggle: setMatchInvitesEnabled,
        },
      ],
    },
    {
      title: 'Appearance',
      rows: [{ label: 'Dark Mode', type: 'toggle', value: darkMode, onToggle: setDarkMode }],
    },
    {
      title: 'Privacy & Language',
      rows: [
        { label: 'Profile Visibility', type: 'chevron', onPress: () => {} },
        { label: 'Language', type: 'chevron', onPress: () => {} },
      ],
    },
    {
      title: 'About',
      rows: [
        { label: 'Terms of Service', type: 'chevron', onPress: () => {} },
        { label: 'Privacy Policy', type: 'chevron', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScreenContainer edges={['top']}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.rows.map((row, i) => (
                <Pressable
                  key={row.label}
                  style={[styles.row, i < group.rows.length - 1 && styles.rowBorder]}
                  onPress={row.onPress}
                  disabled={row.type === 'toggle'}
                >
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  {row.type === 'toggle' ? (
                    <Switch
                      value={row.value}
                      onValueChange={row.onToggle}
                      trackColor={{ false: colors.border.strong, true: colors.accent.primary }}
                    />
                  ) : (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable style={styles.signOutRow} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        <Pressable style={styles.deleteRow} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.sm, marginBottom: spacing.md },
  group: { marginBottom: spacing.lg },
  groupTitle: { ...textStyles.caption, color: colors.text.secondary, marginBottom: spacing.xs, textTransform: 'uppercase' },
  groupCard: { backgroundColor: colors.bg.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  rowLabel: { ...textStyles.body, color: colors.text.primary },
  chevron: { color: colors.text.secondary, fontSize: 18 },
  signOutRow: { alignItems: 'center', paddingVertical: spacing.md },
  signOutText: { ...textStyles.bodyMedium, color: colors.accent.secondary },
  deleteRow: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.xl },
  deleteText: { ...textStyles.bodyMedium, color: colors.state.error },
});