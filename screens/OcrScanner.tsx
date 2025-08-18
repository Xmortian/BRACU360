import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, StatusBar, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import {
    ChevronLeft,
    ScanText,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import styles from '../styles/styles';

const { width } = Dimensions.get('window');

const OcrScannerModal = ({ visible, onClose }) => {
    const theme = useTheme();
    const [imageUri, setImageUri] = useState(null);
    const [rawText, setRawText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scheduleData, setScheduleData] = useState([]);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Permission to access the media library is required to pick an image.');
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                await performOcr(uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    const performOcr = async (uri) => {
        setLoading(true);
        setRawText(null);
        setScheduleData([]);

        try {
            const textResult = await TextRecognition.recognize(uri);
            const fullText = textResult.text;
            setRawText(fullText);

            // Using the new, more sophisticated parsing function
            const parsedSchedule = parseFullSchedule(textResult.blocks);
            console.log('Parsed Schedule:', parsedSchedule);
            
            // Convert the parsed object into an array for the FlatList/ScrollView
            const flatSchedule = Object.entries(parsedSchedule).flatMap(([day, times]) =>
                Object.entries(times).map(([time, course]) => ({
                    day,
                    time,
                    course: course.trim(), // Trim whitespace
                }))
            );

            // Filter out empty 'XXXX' slots for cleaner display
            setScheduleData(flatSchedule.filter(item => item.course !== "XXXX"));

        } catch (error) {
            console.error('Error performing OCR:', error);
            Alert.alert('OCR Error', 'Failed to perform OCR on the image. Please try again.');
            setRawText(`OCR failed with error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

const parseFullSchedule = (ocrBlocks) => {
    const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const TIME_REGEX = /\d{1,2}:\d{2}\s?(AM|PM)\s*-\s*\d{1,2}:\d{2}\s?(AM|PM)/i;

    // Fix common OCR issues: O → 0, extra spaces
    const normalize = (text) =>
        text
            .toUpperCase()
            .replace(/O/g, "0")
            .replace(/\s+/g, " ")
            .trim();

    const allBlocks = ocrBlocks.filter(b => b && b.text).map(b => ({
        ...b,
        text: normalize(b.text),
    }));

    const dayHeaders = [];
    const timeSlots = [];
    const courses = [];

    allBlocks.forEach(block => {
        if (DAYS.includes(block.text)) {
            dayHeaders.push(block);
        } else if (TIME_REGEX.test(block.text)) {
            timeSlots.push(block.text);
        } else {
            courses.push(block);
        }
    });

    // Deduplicate + preserve order
    const uniqueTimeSlots = [...new Set(timeSlots)];

    const routine = {};
    DAYS.forEach(day => {
        routine[day] = {};
        uniqueTimeSlots.forEach(slot => {
            routine[day][slot] = "XXXX"; // fill all blanks with XXXX
        });
    });

    // Assign courses row by row
    // (Very simplified version: assumes OCR gives blocks in row order)
    let currentDay = null;
    let slotIndex = 0;

    allBlocks.forEach(block => {
        if (DAYS.includes(block.text)) {
            currentDay = block.text;
            slotIndex = 0;
        } else if (TIME_REGEX.test(block.text)) {
            // move slotIndex to match this time
            slotIndex = uniqueTimeSlots.indexOf(block.text);
        } else if (currentDay && slotIndex < uniqueTimeSlots.length) {
            // assign course
            const slot = uniqueTimeSlots[slotIndex];
            routine[currentDay][slot] = block.text;
            slotIndex++;
        }
    });

    return routine;
};

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
                <Appbar.Header style={styles.appBar}>
                    <Appbar.BackAction
                        icon={() => <ChevronLeft size={24} color={theme.colors.onPrimary} />}
                        onPress={onClose}
                    />
                    <Appbar.Content title="OCR Routine" titleStyle={styles.appBarTitle} />
                </Appbar.Header>

                <ScrollView contentContainerStyle={styles.paddingContainer}>
                    <Card style={[styles.mainCard, { marginBottom: 20 }]}>
                        <Card.Content style={{ alignItems: 'center', backgroundColor: '#000000', borderRadius: 10 }}>
                            <Image
                                source={require('../assets/routine.gif')}
                                style={{ width: '100%', height: 200, resizeMode: 'contain', marginBottom: 10 }}
                            />
                            <Title style={[styles.cardTitle, { color: '#ffffff' }]}>
                                Class Routine Upload
                            </Title>
                            <Paragraph style={[styles.cardParagraph, { color: '#ffffff', textAlign: 'center' }]}>
                                Step 1: Log in to Connect.
                            </Paragraph>
                            <Paragraph style={[styles.cardParagraph, { color: '#ffffff', textAlign: 'center' }]}>
                                Step 2: Take a screenshot of your class routine.
                            </Paragraph>
                            <Paragraph style={[styles.cardParagraph, { color: '#ffffff', textAlign: 'center' }]}>
                                Step 3: Upload the screenshot!
                            </Paragraph>
                        </Card.Content>
                    </Card>

                    <Card style={styles.mainCard}>
                        <Card.Content>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                                <PaperButton
                                    mode="contained"
                                    onPress={pickImage}
                                    disabled={loading}
                                    style={{ flex: 1, backgroundColor: theme.colors.primary }}
                                    labelStyle={styles.scanButtonLabel}
                                    icon={() => <ScanText size={20} color={theme.colors.onPrimary} />}
                                >
                                    {loading ? "Recognizing..." : "Upload Screenshot"}
                                </PaperButton>
                                <PaperButton
                                    mode="outlined"
                                    onPress={() => Alert.alert('Manual Input', 'Coming soon!')}
                                    disabled={loading}
                                    style={{ flex: 1, borderColor: theme.colors.primary }}
                                    labelStyle={[styles.scanButtonLabel, { color: theme.colors.primary }]}
                                >
                                    Manual Input
                                </PaperButton>
                            </View>

                            {imageUri && (
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
                                </View>
                            )}

                            {loading && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>Recognizing text...</Text>
                                </View>
                            )}

                            {!loading && (
                                <View style={styles.resultsContainer}>
                                    {scheduleData.length > 0 && (
                                        <View style={styles.parsedSection}>
                                            <Title style={styles.sectionTitle}>Parsed Class Schedule</Title>
                                            <View style={styles.tableContainer}>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
                                                    <View>
                                                        <View style={[styles.scheduleItem, styles.tableHeader]}>
                                                            <Text style={[styles.scheduleDay, styles.tableHeaderText]}>Day</Text>
                                                            <Text style={[styles.scheduleTime, styles.tableHeaderText]}>Time</Text>
                                                            <Text style={[styles.scheduleDetails, styles.tableHeaderText]}>Details</Text>
                                                        </View>
                                                        {scheduleData.map((item, index) => (
                                                            <View key={index} style={[styles.scheduleItem, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                                                                <Text style={[styles.scheduleDay, { color: theme.colors.onSurface }]}>{item.day}</Text>
                                                                <Text style={[styles.scheduleTime, { color: theme.colors.onSurface }]}>{item.time}</Text>
                                                                <Text style={[styles.scheduleDetails, { color: theme.colors.onSurface }]}>{item.course}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        </View>
                                    )}

                                    {rawText && (
                                        <View style={styles.rawSection}>
                                            <Title style={styles.sectionTitle}>Raw OCR Text</Title>
                                            <View style={styles.rawTextContainer} key={rawText ? 'raw-text-present' : 'raw-text-empty'}>
                                                <Text style={[styles.rawTextOutput, { color: theme.colors.onSurface }]}>{rawText}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {imageUri && scheduleData.length === 0 && rawText && (
                                        <Text style={[styles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
                                            No class schedule details were found in the image.
                                        </Text>
                                    )}
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default OcrScannerModal;