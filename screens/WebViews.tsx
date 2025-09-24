import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Linking, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated, Easing, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Title, Paragraph, useTheme, FAB, Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import Papa from 'papaparse';
import { ArrowLeft } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styles from '../styles/styles';
import CircularText from '../UI/CirculatText';
import * as FileSystem from 'expo-file-system';

const Stack = createNativeStackNavigator();

const WEBSITES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQvY9tPIIujpH1EPTGjkQgkasnahMbbU6PeCERsI46a3m2mmwhd3DSQhp1i_RM_8Ocf2kh9xVfkSd6z/pub?gid=0&single=true&output=csv';

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

// --- Scrolling Message Component ---
const ScrollingMessage = ({ message }) => {
    const { width } = Dimensions.get('window');
    const scrollAnim = useRef(new Animated.Value(width)).current;

    const fullMessage = message ? `${message}          `.repeat(100) : '';

    useEffect(() => {
        if (!message) return;

        const animationDuration = 10000;
        
        const resetAnimation = () => {
            scrollAnim.setValue(width);
            Animated.timing(scrollAnim, {
                toValue: -width,
                duration: animationDuration,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => resetAnimation());
        };

        resetAnimation();
        
        return () => scrollAnim.stopAnimation();
    }, [message, scrollAnim, width]);

    return (
        <View style={localStyles.scrollingMessageContainer}>
            <Animated.Text
                style={[localStyles.scrollingMessageText, { transform: [{ translateX: scrollAnim }] }]}
                numberOfLines={1}
            >
                {fullMessage}
            </Animated.Text>
        </View>
    );
};

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
    
    const [websites, setWebsites] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(WEBSITES_CSV_URL);
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.data && results.data.length > 0) {
                            const formattedWebsites = results.data
                                .filter(row => row['Site Name'] && row['Site Link'])
                                .map(row => ({
                                    name: row['Site Name'],
                                    url: row['Site Link']
                                }));
                            setWebsites(formattedWebsites);
                            
                            const firstValidRow = results.data.find(row => row['Message from the creator']);
                            if (firstValidRow && firstValidRow['Message from the creator']) {
                                setMessage(firstValidRow['Message from the creator']);
                            } else {
                                setMessage('');
                            }
                        }
                        setLoading(false);
                    },
                    error: (err) => {
                        console.error("PapaParse error:", err);
                        Alert.alert("Error", "Failed to parse data from Google Sheet.");
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error("Failed to fetch data:", error);
                Alert.alert("Error", "Failed to load web links. Please check your internet connection.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
                    <View style={localStyles.loadingContainer}>
                        <CircularText text="BRACU*360*" textColor="#fff" />
                    </View>
        );
    }

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background, flex: 1 }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Web Links" titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={[styles.paddingContainer, { paddingBottom: 80 }]}>
                {message ? (
                    <ScrollingMessage message={message} />
                ) : null}

                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Quick Access Websites
                </Text>
                <View style={styles.webviewGrid}>
                    {websites.map((site, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.webviewCardWrapper}
                            onPress={() => {
                                if (site.url.includes('facebook.com') || site.url.includes('docs.google.com/spreadsheets')) {
                                    Linking.openURL(site.url).catch(err => {
                                        console.error('Failed to open URL:', err);
                                        Alert.alert("Error", "Could not open link. Please check the URL.");
                                    });
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

    // Create a ref for the WebView component
    const webviewRef = useRef(null);

    // This state will track if the webview can go back
    const [canGoBack, setCanGoBack] = useState(false);

    // The function for the back button
    const handleBackButtonPress = () => {
        // Check if the webview can go back internally
        if (webviewRef.current && canGoBack) {
            webviewRef.current.goBack();
        } else {
            // If the webview can't go back, navigate back in the app's stack
            navigation.goBack();
        }
    };
    
    const handleDownloadRequest = (request) => {
        const url = request.url;
        const fileExtension = url.split('.').pop().toLowerCase();
        const downloadableExtensions = ['pdf', 'doc', 'docx', 'zip', 'mp4', 'jpg', 'png'];

        if (downloadableExtensions.includes(fileExtension) && !url.includes('exp.host')) {
            Alert.alert("Download File", "Do you want to download this file?", [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Download",
                    onPress: async () => {
                        const fileName = url.split('/').pop();
                        const fileUri = FileSystem.documentDirectory + fileName;
                        
                        try {
                            Alert.alert("Downloading...", `Downloading started for ${fileName}`);
                            const { uri: localUri } = await FileSystem.downloadAsync(url, fileUri);
                            
                            if (localUri) {
                                Alert.alert("Download Complete", `File downloaded to app cache: ${localUri}`);
                            } else {
                                Alert.alert("Download Failed", "An unknown error occurred during download.");
                            }
                        } catch (error) {
                            console.error('Download failed:', error);
                            Alert.alert("Download Failed", "An error occurred during the download.");
                        }
                    }
                }
            ]);
            return false;
        }
        
        return true;
    };

    return (
        <SafeAreaView style={[styles.screenContainer, { backgroundColor: '#000000' }]}>
            <Appbar.Header style={styles.appBar}>
                {/* Use the new handleBackButtonPress function */}
                <Appbar.BackAction onPress={handleBackButtonPress} />
                <Appbar.Content title={title || "Webview"} titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <WebView
                ref={webviewRef}
                source={{ uri: url }}
                style={{ flex: 1, backgroundColor: '#000000' }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onShouldStartLoadWithRequest={handleDownloadRequest}
                onNavigationStateChange={navState => {
                    setCanGoBack(navState.canGoBack);
                }}
                renderLoading={() => (
                    <View style={localStyles.loadingContainer}>
                        <CircularText text="BRACU*360*" textColor="#fff" />
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
        backgroundColor: '#000000',
    },
    circularTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        transform: [{ rotate: '0deg' }],
    },
    circularLetterText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    scrollingMessageContainer: {
        height: 40,
        overflow: 'hidden',
        justifyContent: 'center',
        backgroundColor: '#333',
        paddingHorizontal: 16,
        marginBottom: 15,
    },
    scrollingMessageText: {
        fontSize: 16,
        color: '#fff',
        whiteSpace: 'nowrap',
        position: 'absolute',
        left: 0,
    }
});