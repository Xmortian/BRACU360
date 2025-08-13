import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StatusBar, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import {
    ChevronLeft,
    ScanText,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import styles from '../styles/styles';

const { width } = Dimensions.get('window');

const OcrScannerScreen = ({ navigation }) => {
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
            const parsedSchedule = parseClassSchedule(textResult.blocks);
            setScheduleData(parsedSchedule);

        } catch (error) {
            console.error('Error performing OCR:', error);
            Alert.alert('OCR Error', 'Failed to perform OCR on the image. Please try again.');
            setRawText(`OCR failed with error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const parseClassSchedule = (blocks) => {
        if (!blocks || blocks.length === 0) return [];

        const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const timeRegex = /(\d{1,2}:[0-9O]{2}\s*(A|P)M{1,2}?)\s*[-—MN]?\s*(\d{1,2}:[0-9O]{2}\s*(A|P)M{1,2}?)/i;
        const courseRegex = /^\s*([A-Z]{2,4})\s?([A-Z0-9-]{3,10}).*$/i;

        const dayHeaders = {};
        blocks.forEach(block => {
            const text = block.text.trim().toUpperCase();
            if (daysOfWeek.includes(text)) {
                dayHeaders[text] = block.frame.left;
            }
        });

        if (Object.keys(dayHeaders).length === 0) {
            return [];
        }
        
        const rows = {};
        blocks.forEach(block => {
            const top = Math.round(block.frame.top / 10) * 10;
            if (!rows[top]) {
                rows[top] = [];
            }
            rows[top].push(block);
        });

        const formattedSchedule = [];
        const sortedRowKeys = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));
        
        sortedRowKeys.forEach(rowKey => {
            const rowBlocks = rows[rowKey].sort((a, b) => a.frame.left - b.frame.left);
            let timeForThisRow = null;

            rowBlocks.forEach(block => {
                const text = block.text.trim().toUpperCase();
                if (timeRegex.test(text)) {
                    timeForThisRow = text;
                }
            });

            if (timeForThisRow) {
                rowBlocks.forEach(block => {
                    const text = block.text.trim().toUpperCase();
                    if (courseRegex.test(text)) {
                        let closestDay = null;
                        let minDistance = Infinity;

                        for (const day in dayHeaders) {
                            const distance = Math.abs(block.frame.left - dayHeaders[day]);
                            if (distance < minDistance) {
                                minDistance = distance;
                                minDistance = distance;
                                closestDay = day;
                            }
                        }

                        if (closestDay) {
                            const newEntry = {
                                day: closestDay,
                                time: timeForThisRow,
                                details: text,
                            };
                            formattedSchedule.push(newEntry);
                        }
                    }
                });
            }
        });

        const sortedByDay = formattedSchedule.sort((a, b) => {
            const dayAIndex = daysOfWeek.indexOf(a.day);
            const dayBIndex = daysOfWeek.indexOf(b.day);
            return dayAIndex - dayBIndex;
        });
        
        return sortedByDay;
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Appbar.Header style={styles.appBar}>
                <Appbar.Action
                    icon={() => <ChevronLeft size={24} color={theme.colors.onPrimary} />}
                    onPress={() => console.log('Navigate back')}
                />
                <Appbar.Content title="Course Details OCR" titleStyle={styles.appBarTitle} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.paddingContainer}>
                {/* Routine GIF and Instructions Section */}
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
                                onPress={() => console.log('Manual Input pressed')}
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
                                                            <Text style={[styles.scheduleDetails, { color: theme.colors.onSurface }]}>{item.details}</Text>
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
    );
};

export default OcrScannerScreen;