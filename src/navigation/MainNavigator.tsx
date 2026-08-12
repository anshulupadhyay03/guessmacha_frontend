import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type {
  MainTabParamList,
  HomeStackParamList,
  ProfileStackParamList,
  FriendsStackParamList,
} from './types';
import { ROUTES } from '../constants/routes';
import { colors } from '../constants/colors';
import { dimensions } from '../constants/dimensions';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import CreateMatchScreen from '../screens/Match/CreateMatchScreen';
import JoinMatchScreen from '../screens/Match/JoinMatchScreen';
import FriendInviteScreen from '../screens/Match/FriendInviteScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

import LeaderboardScreen from '../screens/Leaderboard/LeaderboardScreen';

import FriendsScreen from '../screens/Friends/FriendsScreen';

import ProfileScreen from '../screens/Profile/ProfileScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import StoreScreen from '../screens/Store/StoreScreen';
import CoinsScreen from '../screens/Store/CoinsScreen';
import SeasonPassScreen from '../screens/Store/SeasonPassScreen';
import AchievementsScreen from '../screens/Achievements/AchievementsScreen';

/**
 * TODO(icons): swap these emoji placeholders for the real icon set
 * (Phosphor/Lucide via react-native-svg, stroke vs filled per active state)
 * as described in the design tokens spec.
 */
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.base } }}
    >
      <HomeStack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <HomeStack.Screen name={ROUTES.CREATE_MATCH} component={CreateMatchScreen} />
      <HomeStack.Screen name={ROUTES.JOIN_MATCH} component={JoinMatchScreen} />
      <HomeStack.Screen name={ROUTES.FRIEND_INVITE} component={FriendInviteScreen} />
      <HomeStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </HomeStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.base } }}
    >
      <ProfileStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <ProfileStack.Screen name={ROUTES.HISTORY} component={HistoryScreen} />
      <ProfileStack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <ProfileStack.Screen name={ROUTES.STORE} component={StoreScreen} />
      <ProfileStack.Screen name={ROUTES.COINS} component={CoinsScreen} />
      <ProfileStack.Screen name={ROUTES.SEASON_PASS} component={SeasonPassScreen} />
      <ProfileStack.Screen name={ROUTES.ACHIEVEMENTS} component={AchievementsScreen} />
    </ProfileStack.Navigator>
  );
}

function FriendsStackNavigator() {
  return (
    <FriendsStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.base } }}
    >
      <FriendsStack.Screen name={ROUTES.FRIENDS} component={FriendsScreen} />
      {/* PublicProfile reuses ProfileScreen in read-only mode via the userId param */}
      <FriendsStack.Screen name="PublicProfile" component={ProfileScreen as any} />
    </FriendsStack.Navigator>
  );
}

/** Dummy component — PlayTab never actually renders; its tabPress is intercepted below. */
function PlayTabPlaceholder() {
  return null;
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.subtle,
          height: dimensions.tabBarHeight,
        },
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME_TAB}
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.LEADERBOARD_TAB}
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Ranks',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.PLAY_TAB}
        component={PlayTabPlaceholder}
        options={{
          tabBarLabel: 'Play',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔎" focused={focused} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default tab navigation — open the full-screen Match modal instead.
            e.preventDefault();
            (navigation.getParent() as any)?.navigate('MatchFlow', { screen: 'CreateMatch' });
          },
        })}
      />
      <Tab.Screen
        name={ROUTES.FRIENDS_TAB}
        component={FriendsStackNavigator}
        options={{
          tabBarLabel: 'Friends',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE_TAB}
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🕵️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
