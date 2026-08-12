import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ---------------------------------------------------------------------------
// Auth stack — Splash / Onboarding / Auth (pre-account)
// ---------------------------------------------------------------------------
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
};

// ---------------------------------------------------------------------------
// Home stack — nested inside the Home tab
// ---------------------------------------------------------------------------
export type HomeStackParamList = {
  Home: undefined;
  CreateMatch: undefined;
  JoinMatch: { inviteCode?: string } | undefined;
  FriendInvite: undefined;
  Notifications: undefined;
};

// ---------------------------------------------------------------------------
// Profile stack — nested inside the Profile tab
// ---------------------------------------------------------------------------
export type ProfileStackParamList = {
  Profile: { userId?: string } | undefined;
  History: undefined;
  Settings: undefined;
  Store: undefined;
  Coins: undefined;
  SeasonPass: undefined;
  Achievements: undefined;
};

// ---------------------------------------------------------------------------
// Friends stack — nested inside the Friends tab
// ---------------------------------------------------------------------------
export type FriendsStackParamList = {
  Friends: undefined;
  PublicProfile: { userId: string };
};

// ---------------------------------------------------------------------------
// Main bottom tabs
// ---------------------------------------------------------------------------
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  LeaderboardTab: undefined;
  PlayTab: undefined; // intercepted by a tab-press listener to open MatchFlow instead of rendering
  FriendsTab: NavigatorScreenParams<FriendsStackParamList> | undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

// ---------------------------------------------------------------------------
// Match flow — full-screen modal stack, own back-button rules
// ---------------------------------------------------------------------------
export type MatchStackParamList = {
  CreateMatch: undefined;
  JoinMatch: { inviteCode?: string } | undefined;
  FriendInvite: undefined;
  CategorySelection: { matchId: string };
  SecretObjectSelection: { matchId: string; categoryId: string };
  WaitingRoom: { matchId: string };
  Game: { matchId: string };
  Result: { matchId: string };
  Replay: { matchId: string };
};

// ---------------------------------------------------------------------------
// Root stack
// ---------------------------------------------------------------------------
export type RootStackParamList = {
  AuthFlow: NavigatorScreenParams<AuthStackParamList> | undefined;
  Interests: undefined;
  MainFlow: NavigatorScreenParams<MainTabParamList> | undefined;
  MatchFlow: NavigatorScreenParams<MatchStackParamList> | undefined;
};

// ---------------------------------------------------------------------------
// Screen prop helpers — use these in each screen component's props type
// ---------------------------------------------------------------------------
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

export type FriendsStackScreenProps<T extends keyof FriendsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<FriendsStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type MatchStackScreenProps<T extends keyof MatchStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MatchStackParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

// Augment React Navigation's global types so `useNavigation()` etc. are typed
// without needing to pass generics everywhere.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}