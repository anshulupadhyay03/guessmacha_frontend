// src/constants/routes.ts

export const ROUTES = {
  // Auth Flow
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  AUTH: 'Auth',

  // Root Flow
  AUTH_FLOW: 'AuthFlow',
  INTERESTS: 'Interests',
  MAIN_FLOW: 'MainFlow',
  MATCH_FLOW: 'MatchFlow',

  // Home Stack
  HOME: 'Home',
  CREATE_MATCH: 'CreateMatch',
  JOIN_MATCH: 'JoinMatch',
  FRIEND_INVITE: 'FriendInvite',
  NOTIFICATIONS: 'Notifications',

  // Profile Stack
  PROFILE: 'Profile',
  HISTORY: 'History',
  SETTINGS: 'Settings',
  STORE: 'Store',
  COINS: 'Coins',
  SEASON_PASS: 'SeasonPass',
  ACHIEVEMENTS: 'Achievements',

  // Friends Stack
  FRIENDS: 'Friends',
  PUBLIC_PROFILE: 'PublicProfile',

  // Main Tabs
  HOME_TAB: 'HomeTab',
  LEADERBOARD_TAB: 'LeaderboardTab',
  PLAY_TAB: 'PlayTab',
  FRIENDS_TAB: 'FriendsTab',
  PROFILE_TAB: 'ProfileTab',

  // Match Flow
  CATEGORY_SELECTION: 'CategorySelection',
  SECRET_OBJECT_SELECTION: 'SecretObjectSelection',
  WAITING_ROOM: 'WaitingRoom',
  GAME: 'Game',
  LEADERBOARD: 'Leaderboard',
  RESULT: 'Result',
  REPLAY: 'Replay',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];
