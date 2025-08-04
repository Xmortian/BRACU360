import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import {
    ChevronLeft,
    Bell,
    ScanText,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';


// --- Custom Theme Definition (matches the home screen theme) ---
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#6200EE',
        primaryContainer: '#D1C4E9',
        onPrimaryContainer: '#311B92',
        background: '#F5F5F5',
        onBackground: '#212121',
        surface: '#FFFFFF',
        onSurface: '#212121',
        surfaceVariant: '#E0E0E0',
        onSurfaceVariant: '#424242',
    },
};


// Define a type for the OCR text block for better type inference
type OcrBlock = {
    text: string;
    frame: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
};

// Define a type for the parsed schedule item
type ScheduleItem = {
    day: string;
    time: string;
    details: string;
};


// --- Main OCR Scanner App Component ---
const OcrScannerApp = () => {
    const theme = useTheme();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [rawText, setRawText] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);

    // useEffect hook to request media library permissions
    useEffect(() => {
        // Request media library permissions
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Permission to access the media library is required to pick an image.');
            }
        })();
    }, []);

    // Function to handle picking an image from the device's gallery
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
                // Automatically start OCR on the selected image
                await performOcr(uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    // Function to perform OCR on a given image URI
    const performOcr = async (uri: string) => {
        setLoading(true);
        setRawText(null);
        setScheduleData([]);
        
        try {
            const textResult = await TextRecognition.recognize(uri);
            const fullText = textResult.text;
            
            setRawText(fullText);

            // Parse the text to extract the full class schedule using block-level data
            const parsedSchedule = parseClassSchedule(textResult.blocks as OcrBlock[]);
            setScheduleData(parsedSchedule);

        } catch (error) {
            console.error('Error performing OCR:', error);
            Alert.alert('OCR Error', 'Failed to perform OCR on the image. Please try again.');
            setRawText(`OCR failed with error: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Parses the OCR text blocks to extract a class schedule by first identifying
     * the column headers (days of the week) and then associating each course
     * block with the correct day based on its horizontal position.
     *
     * @param {Array<OcrBlock>} blocks An array of text block objects from the OCR result.
     * @returns {Array<ScheduleItem>} A formatted array of schedule objects.
     */
    const parseClassSchedule = (blocks: OcrBlock[]): ScheduleItem[] => {
        if (!blocks || blocks.length === 0) return [];

        // Define regex patterns for days, times, and course details
        const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        // Updated timeRegex to handle common OCR errors like 'O' instead of '0', and extra characters like 'M' or 'N' in place of a hyphen
        const timeRegex = /(\d{1,2}:[0-9O]{2}\s*(A|P)M{1,2}?)\s*[-—MN]?\s*(\d{1,2}:[0-9O]{2}\s*(A|P)M{1,2}?)/i;
        const courseRegex = /^\s*([A-Z]{2,4})\s?([A-Z0-9-]{3,10}).*$/i;

        // First, identify the day headers and their horizontal positions
        const dayHeaders: { [key: string]: number } = {};
        blocks.forEach(block => {
            const text = block.text.trim().toUpperCase();
            if (daysOfWeek.includes(text)) {
                dayHeaders[text] = block.frame.left;
            }
        });

        // If no day headers are found, we can't parse the schedule correctly
        if (Object.keys(dayHeaders).length === 0) {
            return [];
        }
        
        // Group blocks by row based on their vertical position (top)
        const rows: { [key: string]: OcrBlock[] } = {};
        blocks.forEach(block => {
            const top = Math.round(block.frame.top / 10) * 10; // Grouping by tens for tolerance
            if (!rows[top]) {
                rows[top] = [];
            }
            rows[top].push(block);
        });

        const formattedSchedule: ScheduleItem[] = [];
        // Explicitly typing 'a' and 'b' to resolve the TypeScript error
        const sortedRowKeys = Object.keys(rows).sort((a: string, b: string) => parseInt(a) - parseInt(b));
        
        console.log("--- Processing Blocks by Row ---");

        sortedRowKeys.forEach(rowKey => {
            // Explicitly typing 'a' and 'b' to resolve the TypeScript error
            const rowBlocks = rows[rowKey].sort((a: OcrBlock, b: OcrBlock) => a.frame.left - b.frame.left);
            let timeForThisRow: string | null = null;

            console.log(`Processing row at vertical position: ${rowKey}`);

            // First pass through the row to find the time block
            rowBlocks.forEach(block => {
                const text = block.text.trim().toUpperCase();
                console.log(`LOG: Processing block "${text}" with horizontal position ${block.frame.left}`);
                if (timeRegex.test(text)) {
                    timeForThisRow = text;
                    console.log(`LOG: Found time block: "${timeForThisRow}" and setting it for this row.`);
                }
            });

            // Second pass through the row to find course blocks and assign them the row's time
            if (timeForThisRow) {
                rowBlocks.forEach(block => {
                    const text = block.text.trim().toUpperCase();
                    if (courseRegex.test(text)) {
                        let closestDay: string | null = null;
                        let minDistance = Infinity;

                        for (const day in dayHeaders) {
                            const distance = Math.abs(block.frame.left - dayHeaders[day]);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestDay = day;
                            }
                        }

                        if (closestDay) {
                            const newEntry: ScheduleItem = {
                                day: closestDay,
                                time: timeForThisRow!,
                                details: text,
                            };
                            formattedSchedule.push(newEntry);
                            console.log(`LOG: Matched course block: "${text}" with day: "${closestDay}" and time: "${timeForThisRow}"`);
                        } else {
                            console.log(`LOG: Failed to find a matching day header for course block: "${text}"`);
                        }
                    } else {
                        console.log(`LOG: Block "${text}" did not match the course regex.`);
                    }
                });
            } else {
                console.log(`LOG: No time block found for row at vertical position: ${rowKey}. Skipping course matching.`);
            }
        });

        // Sort the final schedule by day of the week
        const sortedByDay = formattedSchedule.sort((a: ScheduleItem, b: ScheduleItem) => {
            const dayAIndex = daysOfWeek.indexOf(a.day);
            const dayBIndex = daysOfWeek.indexOf(b.day);
            return dayAIndex - dayBIndex;
        });
        
        console.log("--- Final Formatted Schedule ---");
        console.log(sortedByDay);
        console.log("--------------------------------");

        return sortedByDay;
    };


    return (
        <PaperProvider theme={theme}>
            <SafeAreaView style={[appStyles.safeArea, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
                <Appbar.Header style={appStyles.appBar}>
                    {/* Back Button */}
                    <Appbar.Action
                        icon={() => <ChevronLeft size={24} color={theme.colors.onPrimary} />}
                        onPress={() => console.log('Navigate back')}
                    />
                    <Appbar.Content title="Course Details OCR" titleStyle={appStyles.appBarTitle} />
                    {/* Notifications Button */}
                    <Appbar.Action
                        icon={() => <Bell size={24} color={theme.colors.onPrimary} />}
                        onPress={() => console.log('Show notifications')}
                    />
                </Appbar.Header>

                <ScrollView style={appStyles.contentContainer}>
                    <Card style={appStyles.mainCard}>
                        <Card.Content>
                            <View style={appStyles.scanContainer}>
                                <Title style={[appStyles.cardTitle, { color: theme.colors.onSurface }]}>
                                    Class Schedule Extractor
                                </Title>
                                <Paragraph style={[appStyles.cardParagraph, { color: theme.colors.onSurfaceVariant }]}>
                                    Pick an image of your class schedule to extract the details.
                                </Paragraph>
                                
                                <PaperButton
                                    mode="contained"
                                    onPress={pickImage}
                                    disabled={loading}
                                    style={appStyles.scanButton}
                                    labelStyle={appStyles.scanButtonLabel}
                                    icon={() => <ScanText size={20} color={theme.colors.onPrimary} />}
                                >
                                    Pick Image from Gallery
                                </PaperButton>
                            </View>

                            {imageUri && (
                                <View style={appStyles.imageContainer}>
                                    <Image source={{ uri: imageUri }} style={appStyles.image} resizeMode="contain" />
                                </View>
                            )}

                            {loading && (
                                <View style={appStyles.loadingContainer}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={[appStyles.loadingText, { color: theme.colors.onSurface }]}>Recognizing text...</Text>
                                </View>
                            )}

                            {/* Display OCR results */}
                            {!loading && (
                                <View style={appStyles.resultsContainer}>
                                    {scheduleData.length > 0 && (
                                        <View style={appStyles.parsedSection}>
                                            <Title style={appStyles.sectionTitle}>Parsed Class Schedule</Title>
                                            <View style={appStyles.tableContainer}>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={appStyles.scheduleScroll}>
                                                    <View>
                                                        {/* Table Header */}
                                                        <View style={[appStyles.scheduleItem, appStyles.tableHeader]}>
                                                            <Text style={[appStyles.scheduleDay, appStyles.tableHeaderText]}>Day</Text>
                                                            <Text style={[appStyles.scheduleTime, appStyles.tableHeaderText]}>Time</Text>
                                                            <Text style={[appStyles.scheduleDetails, appStyles.tableHeaderText]}>Details</Text>
                                                        </View>

                                                        {/* Display the schedule in a structured format */}
                                                        {scheduleData.map((item, index) => (
                                                            <View key={index} style={[appStyles.scheduleItem, index % 2 === 0 ? appStyles.evenRow : appStyles.oddRow]}>
                                                                <Text style={[appStyles.scheduleDay, { color: theme.colors.onSurface }]}>{item.day}</Text>
                                                                <Text style={[appStyles.scheduleTime, { color: theme.colors.onSurface }]}>{item.time}</Text>
                                                                <Text style={[appStyles.scheduleDetails, { color: theme.colors.onSurface }]}>{item.details}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        </View>
                                    )}

                                    {rawText && (
                                        <View style={appStyles.rawSection}>
                                            <Title style={appStyles.sectionTitle}>Raw OCR Text</Title>
                                            {/* Using a key to force re-render and reset scroll position */}
                                            <View style={appStyles.rawTextContainer} key={rawText ? 'raw-text-present' : 'raw-text-empty'}>
                                                <Text style={[appStyles.rawTextOutput, { color: theme.colors.onSurface }]}>{rawText}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Display a message if no results are found */}
                                    {imageUri && scheduleData.length === 0 && rawText && (
                                        <Text style={[appStyles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
                                            No class schedule details were found in the image.
                                        </Text>
                                    )}
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                </ScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
};


// --- STYLESHEET ---
const appStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    appBar: {
        backgroundColor: '#4A90E2', // Blue banner color
        elevation: 0, // Remove shadow for flat look
        shadowOpacity: 0, // Remove shadow for iOS
    },
    appBarTitle: {
        color: theme.colors.onPrimary,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    mainCard: {
        borderRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    scanContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    cardParagraph: {
        textAlign: 'center',
        marginBottom: 20,
    },
    scanButton: {
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    scanButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
    },
    loadingContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    resultsContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    parsedSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: theme.colors.onSurface,
    },
    scheduleScroll: {
        flexGrow: 0,
    },
    tableContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    scheduleItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    evenRow: {
        backgroundColor: '#f9f9f9',
    },
    oddRow: {
        backgroundColor: '#ffffff',
    },
    tableHeader: {
        backgroundColor: theme.colors.surfaceVariant,
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
        paddingVertical: 15,
    },
    tableHeaderText: {
        fontWeight: 'bold',
        color: theme.colors.onSurfaceVariant,
    },
    scheduleDay: {
        width: 100,
        fontWeight: 'bold',
    },
    scheduleTime: {
        width: 120,
    },
    scheduleDetails: {
        flex: 1,
    },
    rawSection: {
        marginTop: 20,
    },
    rawTextContainer: {
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 70,
        // Added flexGrow to ensure this ScrollView properly occupies space
        flexGrow: 1, 
    },
    rawTextOutput: {
        fontSize: 16,
        lineHeight: 24,
    },
    noResultsText: {
        marginTop: 20,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default OcrScannerApp;
