import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Settings,
  Calendar,
  BookOpen,
  Users,
  User,
} from 'lucide-react-native';

// Screens
import HomeScreen from './screens/HomeScreen';
import CoursesScreen from './screens/Courses';
import FriendsScreen from './screens/Friends';
import AdditionalScreen from './screens/Additional';
import WebViewsScreen from './screens/WebViews';
import ProfileScreen from './screens/Profile';

// Styles
import styles from './styles/styles';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function MainTabs() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#4A90E2',
      primaryContainer: '#D0E0F8',
      onPrimaryContainer: '#1A3A6B',
      onPrimary: '#FFFFFF',
      accent: '#50E3C2',
      background: '#F8F9FA',
      surface: '#FFFFFF',
      onSurface: '#333333',
      onSurfaceVariant: '#666666',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
  };

  const insets = useSafeAreaInsets();

  return (
    <PaperProvider theme={theme}>
      <Tab.Navigator
        initialRouteName="Routine"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            height: 60 + insets.bottom,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            elevation: 8,
            paddingBottom: insets.bottom,
            paddingTop: 5,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconComponent;
            switch (route.name) {
              case 'Extras':
                iconComponent = <Settings color={color} size={size} />;
                break;
              case 'Courses':
                iconComponent = <BookOpen color={color} size={size} />;
                break;
              case 'Routine':
                iconComponent = <Calendar color={color} size={size} />;
                break;
              case 'Friends':
                iconComponent = <Users color={color} size={size} />;
                break;
              case 'Profile':
                iconComponent = <User color={color} size={size} />;
                break;
              default:
                iconComponent = <Calendar color={color} size={size} />;
            }
            return (
              <View style={localStyles.tabIconContainer}>
                {focused && <View style={[localStyles.activeIndicator, { backgroundColor: theme.colors.primary }]} />}
                {iconComponent}
              </View>
            );
          },
        })}
      >
        <Tab.Screen
          name="Extras"
          component={AdditionalScreen}
          options={{ tabBarLabel: 'Extras' }}
        />
        <Tab.Screen
          name="Courses"
          component={CoursesScreen}
          options={{ tabBarLabel: 'Courses' }}
        />
        <Tab.Screen
          name="Routine"
          component={HomeScreen}
          options={{ tabBarLabel: 'Routine' }}
        />
        <Tab.Screen
          name="Friends"
          component={FriendsScreen}
          options={{ tabBarLabel: 'Friends' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </PaperProvider>
  );
}

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#4A90E2',
      primaryContainer: '#D0E0F8',
      onPrimaryContainer: '#1A3A6B',
      onPrimary: '#FFFFFF',
      accent: '#50E3C2',
      background: '#F8F9FA',
      surface: '#FFFFFF',
      onSurface: '#333333',
      onSurfaceVariant: '#666666',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <PaperProvider theme={theme}>
            <StatusBar
              backgroundColor={theme.colors.primary}
              barStyle="light-content"
            />
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              <RootStack.Screen name="MainTabs" component={MainTabs} />
              <RootStack.Screen name="Webview" component={WebViewsScreen} />
            </RootStack.Navigator>
          </PaperProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const localStyles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },
  activeIndicator: {
    width: 25,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    top: 0,
  },
});