import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, StatusBar, ActivityIndicator, Alert, Image, Dimensions, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { ChevronLeft, ScanText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import styles from '../styles/styles';

const { width } = Dimensions.get('window');

const OcrScannerModal = ({ visible, onClose, onScheduleFound }) => {
    const theme = useTheme();
    const [imageUri, setImageUri] = useState(null);
    const [rawText, setRawText] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // scheduleData state is no longer managed here

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

    const extractCourseAndSection = (text) => {
        const regex = /([A-Z]{3,4}\d{3}L?)\s*-\s*(\d{2})/;
        const match = text.match(regex);
        if (match && match.length > 2) {
            return {
                courseCode: match[1].trim(),
                sectionName: match[2].trim(),
            };
        }
        return null;
    };
    
    const parseFullSchedule = (ocrBlocks) => {
        const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const TIME_REGEX = /\d{1,2}:\d{2}\s?(AM|PM)\s*-\s*\d{1,2}:\d{2}\s?(AM|PM)/i;

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

        const routine = {};
        DAYS.forEach(day => {
            routine[day] = {};
        });

        const timeSlots = allBlocks.filter(block => TIME_REGEX.test(block.text)).map(block => block.text);
        const uniqueTimeSlots = [...new Set(timeSlots)];

        uniqueTimeSlots.forEach(slot => {
            DAYS.forEach(day => {
                if (!routine[day][slot]) {
                    routine[day][slot] = "XXXX";
                }
            });
        });

        let currentDay = null;
        let slotIndex = 0;

        allBlocks.forEach(block => {
            if (DAYS.includes(block.text)) {
                currentDay = block.text;
                slotIndex = 0;
            } else if (TIME_REGEX.test(block.text)) {
                slotIndex = uniqueTimeSlots.indexOf(block.text);
            } else if (currentDay && slotIndex < uniqueTimeSlots.length) {
                const slot = uniqueTimeSlots[slotIndex];
                const courseInfo = extractCourseAndSection(block.text);
                if (courseInfo) {
                    routine[currentDay][slot] = courseInfo;
                } else {
                    routine[currentDay][slot] = "XXXX";
                }
                slotIndex++;
            }
        });

        return routine;
    };

    const performOcr = async (uri) => {
        setLoading(true);
        setRawText(null);
        // Do not reset scheduleData here
        
        try {
            const textResult = await TextRecognition.recognize(uri);
            const fullText = textResult.text;
            setRawText(fullText);

            const parsedSchedule = parseFullSchedule(textResult.blocks);
            const flatSchedule = Object.entries(parsedSchedule).flatMap(([day, times]) =>
                Object.entries(times).map(([time, courseInfo]) => ({
                    day,
                    time,
                    courseInfo,
                }))
            );

            const response = await fetch('https://usis-cdn.eniamza.com/connect.json');
            if (!response.ok) {
                throw new Error('Failed to fetch live data from server.');
            }
            const liveData = await response.json();
            const courseRoutines = liveData;

            let finalSchedule = [];

            flatSchedule.forEach(item => {
                if (item.courseInfo && item.courseInfo.courseCode && item.courseInfo.sectionName) {
                    const matchedCourse = courseRoutines.find(
                        (liveItem) =>
                            liveItem.courseCode?.toUpperCase() === item.courseInfo.courseCode.toUpperCase() &&
                            liveItem.sectionName === item.courseInfo.sectionName
                    );

                    if (matchedCourse) {
                        const theorySchedules = matchedCourse.sectionSchedule?.classSchedules || [];
                        const theorySchedulesFormatted = theorySchedules.map(schedule => 
                            `${schedule.day.substring(0, 3)}: ${schedule.startTime.substring(0, 5)}-${schedule.endTime.substring(0, 5)}`
                        ).join(' / ');

                        finalSchedule.push({
                            courseName: matchedCourse.courseCode,
                            section: matchedCourse.sectionName,
                            faculty: matchedCourse.faculties || 'N/A',
                            room: matchedCourse.roomName || 'N/A',
                            schedules: theorySchedulesFormatted,
                            finalExamDate: matchedCourse.sectionSchedule?.finalExamDate || 'N/A',
                            midExamDate: matchedCourse.sectionSchedule?.midExamDate || 'N/A',
                            
                            // To display on the home screen
                            classTimes: matchedCourse.sectionSchedule?.classSchedules || [],
                        });

                        if (matchedCourse.labSchedules && matchedCourse.labSchedules.length > 0) {
                            const labSchedulesFormatted = matchedCourse.labSchedules.map(schedule => 
                                `${schedule.day.substring(0, 3)}: ${schedule.startTime.substring(0, 5)}-${schedule.endTime.substring(0, 5)}`
                            ).join(' / ');

                            finalSchedule.push({
                                courseName: matchedCourse.labCourseCode,
                                section: matchedCourse.sectionName,
                                faculty: matchedCourse.labFaculties || 'N/A',
                                room: matchedCourse.labRoomName || 'N/A',
                                schedules: labSchedulesFormatted,
                                finalExamDate: matchedCourse.sectionSchedule?.finalExamDate || 'N/A',
                                midExamDate: matchedCourse.sectionSchedule?.midExamDate || 'N/A',

                                // To display on the home screen
                                classTimes: matchedCourse.labSchedules || [],
                            });
                        }
                    }
                }
            });

            // Pass the data back to the parent component
            onScheduleFound(finalSchedule);
            Alert.alert("Success", "Routine uploaded and saved!");
            onClose();

        } catch (error) {
            console.error('Error in OCR or data fetching:', error);
            Alert.alert('Processing Error', 'Failed to process your routine. Please try again.');
        } finally {
            setLoading(false);
        }
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
                    <Text style={localStyles.warningText}>
                        <Text style={{fontWeight: 'bold'}}>Warning: </Text>
                        The routine data relies on CONNECT's database. Errors may occur near the end of a semester before the new data is renewed. For best results, please upload your routine after a new semester begins.
                    </Text>
                    
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
                                Log in to Connect.
                            </Paragraph>
                            <Paragraph style={[styles.cardParagraph, { color: '#ffffff', textAlign: 'center' }]}>
                                Take a screenshot of class routine.
                            </Paragraph>
                            <Paragraph style={[styles.cardParagraph, { color: '#ffffff', textAlign: 'center' }]}>
                                Upload the screenshot!
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
                        </Card.Content>
                    </Card>
                </ScrollView>
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
    warningText: {
        fontSize: 14,
        color: 'white',
        backgroundColor: 'rgba(255, 165, 0, 0.7)',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'orange',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default OcrScannerModal;