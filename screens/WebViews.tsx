import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styles from '../styles/styles';

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
                    navigation.goBack();
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
        { name: 'PrePre-Reg', url: 'https://preprereg.vercel.app/' },
        { name: 'Connect Unlocked', url: 'https://usis.eniamza.com/n' },
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
            </Appbar.Header>
            <ScrollView contentContainerStyle={[styles.paddingContainer, { paddingBottom: 100 }]}>
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