import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Title, Paragraph, useTheme, FAB, Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { ArrowLeft } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styles from '../styles/styles';
import CircularText from '../UI/CirculatText';

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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.screenContainer, { backgroundColor: '#000' }]}>
                    <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                        <Appbar.Action icon={() => <ArrowLeft size={24} color={theme.colors.onPrimary} />} onPress={() => navigation.goBack()} />
                        <Appbar.Content title="Website Add Proposal" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                    </Appbar.Header>
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <Text style={localStyles.inputLabel}>ID</Text>
                        <TextInput value={link} onChangeText={setLink} style={localStyles.input} placeholderTextColor="#888" />

                        <Text style={localStyles.inputLabel}>Gsuite Email</Text>
                        <TextInput value={reason} onChangeText={setReason} style={localStyles.input} placeholderTextColor="#888" />

                        <Text style={localStyles.inputLabel}>Link of the Site</Text>
                        <TextInput value={category} onChangeText={setCategory} style={localStyles.input} placeholderTextColor="#888" />

                        <Text style={localStyles.inputLabel}>How will the site help the students</Text>
                        <TextInput value={name} onChangeText={setName} style={localStyles.input} placeholderTextColor="#888" />

                        <Button mode="contained" style={{ marginTop: 20 }} onPress={submitWebsite}>
                            Submit
                        </Button>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

// --- Webview List Screen ---
function WebviewListScreen() {
    const navigation = useNavigation();
    const theme = useTheme();
    const cardColors = ['#cce5cc', '#ffe0b3', '#b3d9ff', '#b3ffe0', '#ffe6ff'];
    
    const websites = [
        { name: 'Freelabs', url: 'https://freelabs.pages.dev/?fbclid=IwY2xjawMZidNleHRuA2FlbQIxMABicmlkETFKbmt3SGdhd1Z3QUNQSnc2AR56a8vwBRg7XFmSqGzrus_9kDtNQnEN3UDlw9WzL3ilm023hWOU6amIk5GJcg_aem_ouJteWW86PflxUs3kwz3pw' },
        { name: 'PrePre-Reg', url: 'https://preprereg.vercel.app/' },
        { name: 'Connect Unlocked', url: 'https://usis.eniamza.com/n' },
        { name: 'BRACU Official', url: 'https://www.bracu.ac.bd/' },
        { name: 'CSE Detailed List', url: 'https://docs.google.com/spreadsheets/d/1myGvBOTsxcMATsz_uTzr-kBpA0xn1291jO4p8_2hIxw/edit?usp=drivesdk' },
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
                            onPress={() => {
                                // Conditional logic to open the Google Sheet in the external browser
                                if (site.name === 'CSE Detailed List') {
                                    Linking.openURL(site.url);
                                } else {
                                    navigation.navigate('WebviewDetail', { url: site.url, title: site.name });
                                }
                            }}
                        >
                            <Card style={[styles.webviewCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
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
                    <View style={localStyles.loadingContainer}>
                        <CircularText text="BRACU*360*" />
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

// --- Local styles for input fields and new components ---
const localStyles = StyleSheet.create({
    inputLabel: {
        color: '#fff',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#1c1c1c',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    circularTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        transform: [{ rotate: '0deg' }],
    },
    circularLetterContainer: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circularLetterText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
});