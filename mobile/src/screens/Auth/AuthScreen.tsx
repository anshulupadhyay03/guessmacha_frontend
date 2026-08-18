import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing } from '../../constants/tokens';
import Button from '../../components/common/Button';
import ScreenContainer from '../../components/common/ScreenContainer';
import { supabase } from '../../api/supabaseClient';
import Toast from 'react-native-toast-message';

type Provider = 'google' | 'apple' | 'guest' | null;

export default function AuthScreen() {
  const [loadingProvider, setLoadingProvider] = useState<Provider>(null);

  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    try {
      // TODO: wire up @react-native-google-signin/google-signin to get an idToken,
      // then call supabase.auth.signInWithIdToken({ provider: 'google', token: idToken }).
      // Left as a stub here since it depends on native config (webClientId, SHA keys).
      throw new Error('Google Sign-In not yet configured');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Sign-in failed', text2: err.message });
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoadingProvider('apple');
    try {
      // TODO: wire up @invertase/react-native-apple-authentication, then
      // supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken }).
      throw new Error('Apple Sign-In not yet configured');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Sign-in failed', text2: err.message });
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGuest = async () => {
    setLoadingProvider('guest');
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      // AppNavigator will pick up the new session automatically via onAuthStateChange.
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Could not continue as guest', text2: err.message });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoEmoji}>🕵️</Text>
        <Text style={styles.title}>Guess It</Text>
        <Text style={styles.tagline}>Deduce their secret before they deduce yours.</Text>
      </View>

      <View style={styles.buttonGroup}>
        <Button
          label="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="secondary"
          loading={loadingProvider === 'google'}
          disabled={loadingProvider !== null && loadingProvider !== 'google'}
        />
        {Platform.OS === 'ios' && (
          <Button
            label="Continue with Apple"
            onPress={handleAppleSignIn}
            variant="secondary"
            loading={loadingProvider === 'apple'}
            disabled={loadingProvider !== null && loadingProvider !== 'apple'}
          />
        )}
        <Button
          label="Continue as Guest"
          onPress={handleGuest}
          variant="ghost"
          loading={loadingProvider === 'guest'}
          disabled={loadingProvider !== null && loadingProvider !== 'guest'}
        />
      </View>

      <Text style={styles.legal}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.displayLarge,
    color: colors.text.primary,
  },
  tagline: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  buttonGroup: {
    gap: spacing.md,
  },
  legal: {
    ...textStyles.caption,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});