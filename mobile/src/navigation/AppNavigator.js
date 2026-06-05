import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../stores/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';
import { Home, Search, Bell, User, ShoppingBag, MessageSquare } from 'lucide-react-native';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/public/HomeScreen';
import ProductScreen from '../screens/public/ProductScreen';
import ShopScreen from '../screens/public/ShopScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import WalletScreen from '../screens/dashboard/WalletScreen';
import LeadsScreen from '../screens/dashboard/LeadsScreen';
import MessagesScreen from '../screens/dashboard/MessagesScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#0A0A0A',
  accent: '#FFD700',
  text: '#FAFAFA',
  textSecondary: '#9CA3AF',
};

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: COLORS.primary, borderTopColor: '#1A1A1A' },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        headerShown: false,
      }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{
        tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        headerShown: false,
      }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{
        tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        headerShown: false,
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarIcon: ({ color }) => <User size={24} color={color} />,
        headerShown: false,
      }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text,
        headerTitleStyle: { color: COLORS.accent },
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Billetera' }} />
      <Stack.Screen name="Leads" component={LeadsScreen} options={{ title: 'Leads' }} />
      <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Mensajes' }} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text,
        headerTitleStyle: { color: COLORS.accent },
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Producto' }} />
      <Stack.Screen name="Shop" component={ShopScreen} options={{ title: 'Tienda' }} />
      <Stack.Screen name="Dashboard" component={DashboardStack} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}