import React from 'react';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { colors } from '../constants/colors';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MatchNavigator from './MatchNavigator';
import InterestsScreen from '../screens/Interests/InterestsScreen';
import SplashScreen from '../screens/Splash/SplashScreen';

// TODO: this hook is expected to live at src/hooks/useAuth.ts and expose:
//   { initializing: boolean; session: Session | null; hasCompletedInterests: boolean }
// It should wrap supabase.auth.getSession()/onAuthStateChange and the user's
// profile.interests length check, and sync results into authSlice/userSlice.
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg.base,
    card: colors.bg.surface,
    text: colors.text.primary,
    border: colors.border.subtle,
    primary: colors.accent.primary,
  },
};

export default function AppNavigator() {
  const { initializing, session, hasCompletedInterests } = useAuth();

  if (initializing) {
    // Reuse the Splash screen itself as the bootstrap/loading state so there's
    // no visual seam between native launch screen -> JS boot -> routing decision.
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainFlow" component={MainNavigator} />
        {/* {!session ? (
          <Stack.Screen name="AuthFlow" component={AuthNavigator} />
        ) : !hasCompletedInterests ? (
          <Stack.Screen name="Interests" component={InterestsScreen} />
        ) : (
          <>
            <Stack.Screen name="MainFlow" component={MainNavigator} />
            <Stack.Screen
              name="MatchFlow"
              component={MatchNavigator}
              options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
            />
          </>
        )} */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}