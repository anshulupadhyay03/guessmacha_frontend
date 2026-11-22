import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { HomeScreen, CreateScreen, LobbyScreen, GameScreen, MatchesScreen, HistoryScreen, ReviewScreen, ProfileScreen } from '../screens/Screens';
import { colors } from '../theme';

type RootParams = { Tabs: undefined; Create: undefined; Lobby: { game: { gameId: string; roomCode: string; categoryId?: string; categoryName?: string } }; Game: { game: { gameId: string; roomCode: string; categoryId?: string; categoryName?: string } }; Review: { gameId: string } };
const Stack = createNativeStackNavigator<RootParams>();
const Tab = createBottomTabNavigator();
const icon = (value: string) => () => <Text style={{ fontSize: 18 }}>{value}</Text>;
function Tabs() { return <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.muted, tabBarStyle: { borderTopColor: colors.border }, tabBarIcon: icon(({ Home: '⌂', Matches: '⚔', History: '◷', Profile: '◉' } as Record<string, string>)[route.name] ?? '•') })}><Tab.Screen name="Home" component={HomeScreen} /><Tab.Screen name="Matches" component={MatchesScreen} /><Tab.Screen name="History" component={HistoryScreen} /><Tab.Screen name="Profile" component={ProfileScreen} /></Tab.Navigator>; }
export default function AppNavigator() { return <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.teal } }}><Stack.Navigator screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ink, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} /><Stack.Screen name="Create" component={CreateScreen} options={{ title: 'Create room' }} /><Stack.Screen name="Lobby" component={LobbyScreen} options={{ title: 'Match lobby' }} /><Stack.Screen name="Game" component={GameScreen} options={{ headerShown: false, gestureEnabled: false }} /><Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Match review' }} /></Stack.Navigator></NavigationContainer>; }
