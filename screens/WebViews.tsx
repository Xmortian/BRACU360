import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Title, Paragraph, useTheme, FAB, Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { ArrowLeft } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styles from '../styles/styles';

const Stack = createNativeStackNavigator();

// --- Utility to send data to Google Form ---
async function sendToGoogleForm(formUrl, fields) {
    const formBody = Object.entries(fields)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");

    return fetch(formUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
    });
}

// --- Webview Detail Screen ---
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

// --- Website Adding Form Screen ---
function WebsiteAddScreen() {
    const theme = useTheme();
    const navigation = useNavigation();

    const [link, setLink] = useState("");
    const [reason, setReason] = useState("");
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");

    const submitWebsite = async () => {
        if (!link || !reason || !category || !name) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        try {
            await sendToGoogleForm(
                "https://docs.google.com/forms/d/e/1FAIpQLSeGKKnxNsFTyc_xCEmLH4sWBIqiijM6TZklzAnvGcfXXFIVgQ/formResponse",
                {
                    "entry.565161717": link,
                    "entry.13187988": reason,
                    "entry.941856268": category,
                    "entry.1143181463": name,
                }
            );
            Alert.alert("Success", "Your website suggestion has been sent.");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Error", "Could not submit website.");
        }
    };

    return (
        <SafeAreaView style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Action icon={() => <ArrowLeft size={24} color={theme.colors.onPrimary} />} onPress={() => navigation.goBack()} />
                <Appbar.Content title="Add Website" titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <TextInput placeholder="ID" value={link} onChangeText={setLink} style={localStyles.input} />
                <TextInput placeholder="Gsuite Email" value={reason} onChangeText={setReason} style={localStyles.input} />
                <TextInput placeholder="Link Of the Site" value={category} onChangeText={setCategory} style={localStyles.input} />
                <TextInput placeholder="How will the site help the students" value={name} onChangeText={setName} style={localStyles.input} />
                <Button mode="contained" style={{ marginTop: 20 }} onPress={submitWebsite}>
                    Submit
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Webview List Screen ---
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
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background, flex: 1 }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Web Links" titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={[styles.paddingContainer, { paddingBottom: 80 }]}>
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
                                    <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>
                                        {site.url.replace(/(^\w+:|^)\/\//, '').split('/')[0]}
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <FAB
                icon="plus"
                style={{ position: "absolute", bottom: 80, right: 20, backgroundColor: theme.colors.primary }}
                onPress={() => navigation.navigate("AddWebsite")}
            />
        </View>
    );
}

// --- Main WebViews Component ---
const WebViews = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WebviewList" component={WebviewListScreen} />
            <Stack.Screen name="WebviewDetail" component={WebviewDetailScreen} />
            <Stack.Screen name="AddWebsite" component={WebsiteAddScreen} />
        </Stack.Navigator>
    );
};

export default WebViews;

// --- Local styles for input fields ---
const localStyles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 20,
        marginBottom: 100,
        backgroundColor: 'white'
    }
});