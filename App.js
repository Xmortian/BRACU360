import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  Globe,
  PlusCircle,
  Calendar,
  BookOpen,
  Users,
  User, // ✅ real profile icon
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
            {/* ✅ Fill status bar area with solid primary color */}
            <StatusBar
              backgroundColor={theme.colors.primary}
              barStyle="light-content"
            />

            <Tab.Navigator
              initialRouteName="RoutineTab"
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                tabBarStyle: {
                  height: Platform.OS === 'ios' ? 90 : 60,
                  backgroundColor: theme.colors.surface,
                  borderTopWidth: 0,
                  elevation: 8,
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  borderRadius: 20,
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  right: 10,
                  paddingBottom: Platform.OS === 'ios' ? 25 : 5,
                  paddingTop: 5,
                },
                tabBarLabelStyle: {
                  fontSize: 12,
                  fontWeight: '600',
                },
                tabBarIcon: ({ color, size }) => {
                  switch (route.name) {
                    case 'WebviewTab':
                      return <Globe color={color} size={size} />;
                    case 'AdditionalTab':
                      return <PlusCircle color={color} size={size} />;
                    case 'RoutineTab':
                      return <Calendar color={color} size={size} />;
                    case 'CoursesTab':
                      return <BookOpen color={color} size={size} />;
                    case 'FriendFinderTab':
                      return <Users color={color} size={size} />;
                    case 'Profile':
                      return <User color={color} size={size} />;
                    default:
                      return <Calendar color={color} size={size} />;
                  }
                },
              })}
            >
              <Tab.Screen
                name="WebviewTab"
                component={WebViewsScreen}
                options={{ tabBarLabel: 'Web' }}
              />
              <Tab.Screen
                name="AdditionalTab"
                component={AdditionalScreen}
                options={{ tabBarLabel: 'Additional' }}
              />
              <Tab.Screen
                name="RoutineTab"
                component={HomeScreen}
                options={{ tabBarLabel: 'Routine' }}
              />
              <Tab.Screen
                name="CoursesTab"
                component={CoursesScreen}
                options={{ tabBarLabel: 'Course' }}
              />
              <Tab.Screen
                name="FriendFinderTab"
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
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
