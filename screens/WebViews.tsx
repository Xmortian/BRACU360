import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Import createNativeStackNavigator

// Assuming you will move styles to a separate file like `styles/styles.js`
// For this fix, I'm including the styles directly so the code is self-contained.
// In your project, you would import them like: `import styles from '../styles/styles';`
const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
    appBar: {
        backgroundColor: '#4A90E2', // Blue banner color
        elevation: 0, // Remove shadow for flat look
        shadowOpacity: 0, // Remove shadow for iOS
    },
    appBarTitle: {
        color: '#FFFFFF', // White text
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left', // Align title to left
    },
    paddingContainer: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
        color: '#333',
    },
    webviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    webviewCardWrapper: {
        width: '45%', // Adjust as needed for spacing
        margin: '2.5%', // Provides spacing between cards
        aspectRatio: 1, // Makes the card square
        marginBottom: 15,
    },
    webviewCard: {
        flex: 1,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    webviewCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    webviewCardUrl: {
        fontSize: 12,
        textAlign: 'center',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
    },
});

// Create a Stack Navigator instance for this file
const Stack = createNativeStackNavigator();

// --- Webview Detail Screen (opens a specific website) ---
function WebviewDetailScreen({ route }) {
    const { url, title } = route.params;
    const navigation = useNavigation();
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Action icon={() => <ArrowLeft size={24} color={theme.colors.onPrimary} />} onPress={() => navigation.goBack()} />
                <Appbar.Content title={title || "Webview"} titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading {title || 'website'}...</Text>
                    </View>
                )}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    Alert.alert("Webview Error", `Failed to load: ${nativeEvent.description}`);
                    navigation.goBack(); // Go back on error
                }}
            />
        </SafeAreaView>
    );
}

// --- Webview List Screen (shows clickable boxes for websites) ---
function WebviewListScreen() {
    const navigation = useNavigation();
    const theme = useTheme();

    const websites = [
        { name: 'Pre-Reg', url: 'https://preprereg.vercel.app/' },
        { name: 'BRACU Official', url: 'https://www.bracu.ac.bd/' },
        { name: 'CSE SDS', url: 'https://cse.sds.bracu.ac.bd/' },
        { name: 'Thesis Supervising List', url: 'https://cse.sds.bracu.ac.bd/thesis/supervising/list' },
        { name: 'BRACU Library', url: 'https://library.bracu.ac.bd/' },
        { name: 'BRACU Express', url: 'https://bracuexpress.com/' },
    ];

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Web Links" titleStyle={styles.appBarTitle} />
                <Appbar.Action icon={() => <Bell size={24} color={theme.colors.onPrimary} />} onPress={() => Alert.alert('Notifications', 'Coming Soon!')} />
            </Appbar.Header>
            <ScrollView style={styles.paddingContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Quick Access Webviews
                </Text>
                <View style={styles.webviewGrid}>
                    {websites.map((site, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.webviewCardWrapper}
                            onPress={() => navigation.navigate('WebviewDetail', { url: site.url, title: site.name })}
                        >
                            <Card style={[styles.webviewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Card.Content>
                                    <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>{site.name}</Title>
                                    <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>{site.url.replace(/(^\w+:|^)\/\//, '').split('/')[0]}</Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

// --- Main WebViews Component (wrapper for the stack navigator) ---
const WebViews = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WebviewList" component={WebviewListScreen} />
            <Stack.Screen name="WebviewDetail" component={WebviewDetailScreen} />
        </Stack.Navigator>
    );
};

export default WebViews;