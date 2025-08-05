import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, DefaultTheme, Provider as PaperProvider, useTheme } from 'react-native-paper';
import OcrScannerScreen from './screens/OcrScanner';
import GradesheetReaderScreen from './screens/GradesheetReaderScreen.tsx';
import {
    Globe,
    PlusCircle,
    Calculator,
    Calendar,
    BookOpen,
    Users,
    User,
    Home
} from 'lucide-react-native';

// Import all screen components from your screens folder
import HomeScreen from './screens/HomeScreen';
import CoursesScreen from './screens/Courses';
import ProfileScreen from './screens/Profile';
import FriendsScreen from './screens/Friends';
import CgpaCalcScreen from './screens/CgpaCalc';
import AdditionalScreen from './screens/Additional';
import WebViewsScreen from './screens/WebViews';

// Import the centralized styles file
import styles from './styles/styles';

const Tab = createBottomTabNavigator();

// --- Main App Component ---
export default function App() {
    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#4A90E2', // A vibrant blue
            primaryContainer: '#D0E0F8', // Lighter shade for selected items
            onPrimaryContainer: '#1A3A6B', // Darker text on primary container
            onPrimary: '#FFFFFF', // Text color on primary background
            accent: '#50E3C2', // A bright green/teal
            background: '#F8F9FA', // Light gray background
            surface: '#FFFFFF', // Card backgrounds
            onSurface: '#333333', // Dark text on surfaces
            onSurfaceVariant: '#666666', // Lighter text on surfaces
            backdrop: 'rgba(0, 0, 0, 0.5)',
        },
    };

    return (
        <NavigationContainer>
            <PaperProvider theme={theme}>
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
                            let iconComponent;
                            switch (route.name) {
                                case 'WebviewTab':
                                    iconComponent = <Globe color={color} size={size} />;
                                    break;
                                case 'AdditionalTab':
                                    iconComponent = <PlusCircle color={color} size={size} />;
                                    break;
                                case 'CGPATab':
                                    iconComponent = <Calculator color={color} size={size} />;
                                    break;
                                case 'RoutineTab':
                                    iconComponent = <Calendar color={color} size={size} />;
                                    break;
                                case 'CoursesTab':
                                    iconComponent = <BookOpen color={color} size={size} />;
                                    break;
                                case 'FriendFinderTab':
                                    iconComponent = <Users color={color} size={size} />;
                                    break;
                                case 'ProfileTab':
                                    iconComponent = <User color={color} size={size} />;
                                    break;
                                case 'OcrScannerScreen':
                                    iconComponent = <User color={color} size={size} />;
                                    break;
                                case 'GradesheetReaderScreen':
                                    iconComponent = <User color={color} size={size} />;
                                default:
                                    iconComponent = <Home color={color} size={size} />;
                            }
                            return iconComponent;
                        },
                    })}
                >
                    <Tab.Screen name="WebviewTab" component={WebViewsScreen} options={{ tabBarLabel: 'Web' }} />
                    <Tab.Screen name="AdditionalTab" component={AdditionalScreen} options={{ tabBarLabel: 'Add' }} />
                    <Tab.Screen name="CGPATab" component={CgpaCalcScreen} options={{ tabBarLabel: 'CGPA' }} />
                    <Tab.Screen name="RoutineTab" component={HomeScreen} options={{ tabBarLabel: 'Routine' }} />
                    <Tab.Screen name="CoursesTab" component={CoursesScreen} options={{ tabBarLabel: 'Courses' }} />
                    <Tab.Screen name="FriendFinderTab" component={FriendsScreen} options={{ tabBarLabel: 'Friends' }} />
                    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
                    <Tab.Screen name="OcrScannerScreen" component={OcrScannerScreen} options={{ tabBarLabel: 'OCR' }} />
                    <Tab.Screen name="GradesheetReaderScreen" component={GradesheetReaderScreen} options={{ tabBarLabel: 'OCR2' }} />




                </Tab.Navigator>
            </PaperProvider>
        </NavigationContainer>
    );
}