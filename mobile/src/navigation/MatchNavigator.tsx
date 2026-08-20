import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MatchStackParamList } from './types';
import { ROUTES } from '../constants/routes';
import { colors } from '../constants/colors';

import CreateMatchScreen from '../screens/Match/CreateMatchScreen';
import JoinMatchScreen from '../screens/Match/JoinMatchScreen';
import FriendInviteScreen from '../screens/Match/FriendInviteScreen';
import CategorySelectionScreen from '../screens/Match/CategorySelectionScreen';
import SecretObjectSelectionScreen from '../screens/Match/SecretObjectSelectionScreen';
import WaitingRoomScreen from '../screens/Match/WaitingRoomScreen';
import GameScreen from '../screens/Game/GameScreen';
import ResultScreen from '../screens/Result/ResultScreen';
import ReplayScreen from '../screens/Result/ReplayScreen';

const Stack = createNativeStackNavigator<MatchStackParamList>();

/**
 * MatchNavigator — the in-match flow lives in its own stack because it has
 * different back-button rules than the rest of the app (confirm-to-exit
 * dialogs mid-match, no casual swipe-back once secrets are locked in).
 * Presented as a full-screen modal from the root navigator.
 */
export default function MatchNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.CREATE_MATCH}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.base },
        animation: 'slide_from_right',
        // Disallow the OS swipe-back gesture once inside an active match —
        // individual screens (Game, WaitingRoom) opt into a confirm dialog instead.
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name={ROUTES.CREATE_MATCH} component={CreateMatchScreen} />
      <Stack.Screen name={ROUTES.JOIN_MATCH} component={JoinMatchScreen} />
      <Stack.Screen name={ROUTES.FRIEND_INVITE} component={FriendInviteScreen} />
      <Stack.Screen name={ROUTES.CATEGORY_SELECTION} component={CategorySelectionScreen} />
      <Stack.Screen
        name={ROUTES.SECRET_OBJECT_SELECTION}
        component={SecretObjectSelectionScreen}
      />
      <Stack.Screen
        name={ROUTES.WAITING_ROOM}
        component={WaitingRoomScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ROUTES.GAME}
        component={GameScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ROUTES.RESULT}
        component={ResultScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name={ROUTES.REPLAY} component={ReplayScreen} />
    </Stack.Navigator>
  );
}