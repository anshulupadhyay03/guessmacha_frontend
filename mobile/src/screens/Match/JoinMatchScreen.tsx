import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import Button from '../../components/common/Button';
import ScreenContainer from '../../components/common/ScreenContainer';
import { matchService } from '../../services/matchService';

export default function JoinMatchScreen({ navigation, route }: any) {
  const [code, setCode] = useState(route?.params?.inviteCode ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidFormat = /^[A-Z0-9]{3,4}-?[A-Z0-9]{3,4}$/i.test(code.trim());

  const handleJoin = async () => {
    setError(null);
    if (!isValidFormat) {
      setError('Enter a valid invite code (e.g. ABC-123)');
      return;
    }
    setLoading(true);
    try {
      const match = await matchService.joinMatchByCode(code.trim().toUpperCase());
      if (match.status !== 'waiting') {
        setError('This match has already started or ended.');
        return;
      }
      navigation.replace('WaitingRoom', { matchId: match.id });
    } catch (err: any) {
      const message: string = err?.message ?? '';
      if (message.includes('expired')) setError('This invite has expired.');
      else if (message.includes('full')) setError('This match is already full.');
      else if (message.includes('not_found')) setError('Invalid code — double check and try again.');
      else setError("Couldn't join this match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Join a Match</Text>
      <Text style={styles.subtitle}>Enter the invite code your friend shared with you</Text>

      <TextInput
        value={code}
        onChangeText={(v) => {
          setCode(v.toUpperCase());
          setError(null);
        }}
        placeholder="ABC-123"
        placeholderTextColor={colors.text.disabled}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={9}
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.footer}>
        <Button label="Join Match" onPress={handleJoin} loading={loading} disabled={!code} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.md },
  subtitle: { ...textStyles.body, color: colors.text.secondary, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...textStyles.titleLarge,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 4,
  },
  inputError: {
    borderColor: colors.state.error,
  },
  errorText: {
    ...textStyles.small,
    color: colors.state.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
});