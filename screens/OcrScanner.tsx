import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, StatusBar, ActivityIndicator, Alert, Image, Dimensions, StyleSheet, TextInput } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { ChevronLeft, ScanText, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import styles from '../styles/styles';

const { width } = Dimensions.get('window');

const OcrScannerModal = ({ visible, onClose, onScheduleFound }) => {
    const theme = useTheme();
    const [imageUri, setImageUri] = useState(null);
    const [rawText, setRawText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
    const [courseCode, setCourseCode] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [manualCourses, setManualCourses] = useState([]);

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
                            console.log('📷 Image picked, URI:', uri);

                setImageUri(uri);
                await performOcr(uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    const extractCourseAndSection = (text) => {
        // Updated regex to handle different cases and formats:
        // - [A-Z]{3,4} -> 3 or 4 uppercase letters for the course prefix (e.g., CSE, EEE, PHY)
        // - \d{3}L? -> 3 digits, with an optional 'L' for labs
        // - \s*? -> zero or more spaces, non-greedy
        // - (-|—)\s*? -> a hyphen or em dash with optional spaces
        // - (\d{1,2}) -> captures 1 or 2 digits for the section
        // - The entire regex is case-insensitive (i).
        const regex = /([A-Z]{3,4}\s*\d{3}L?)\s*?(-|—)?\s*?(\d{1,2})/i;
        const match = text.match(regex);

        if (match && match.length > 3) {
            // Trim, convert to uppercase, and remove spaces from the course code
            const courseCode = match[1].trim().replace(/\s/g, '').toUpperCase();
            // Pad the section name with a leading zero if it's a single digit
            const sectionName = match[3].padStart(2, '0').trim();

            return {
                courseCode: courseCode,
                sectionName: sectionName,
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

const fetchScheduleAndSave = async (coursesToFetch, imageUriParam = null) => {
    setLoading(true);
    try {
        const response = await fetch('https://usis-cdn.eniamza.com/connect.json');
        if (!response.ok) {
            throw new Error('Failed to fetch live data from server.');
        }
        const courseRoutines = await response.json();
        
        const semesterSessionId = courseRoutines[0]?.semesterSessionId;
        let currentSemester = 'N/A';

        if (semesterSessionId) {
            const year = Math.floor(semesterSessionId / 10);
            const semesterCode = semesterSessionId % 10;
            const semesterName = semesterCode === 1 ? "Spring" : semesterCode === 2 ? "Summer" : "Fall";
            currentSemester = `${semesterName} ${year}`;
        }

        let finalSchedule = [];
        let notFoundCourses = [];

        coursesToFetch.forEach(item => {
            if (item.courseCode && item.sectionName) {
                const matchedCourse = courseRoutines.find(
                    (liveItem) =>
                        liveItem.courseCode?.toUpperCase() === item.courseCode.toUpperCase() &&
                        liveItem.sectionName.padStart(2, '0') === item.sectionName.padStart(2, '0')
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
                        classTimes: matchedCourse.sectionSchedule?.classSchedules || [],
                        semester: currentSemester,
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
                            classTimes: matchedCourse.labSchedules || [],
                            semester: currentSemester,
                        });
                    }
                } else {
                    notFoundCourses.push(`${item.courseCode}-${item.sectionName}`);
                }
            }
        });

        // Pass both finalSchedule and imageUri to the callback
        console.log('📷 OCR imageUri being passed:', imageUri);

        const finalImageUri = activeTab === 'upload' ? imageUriParam : null;
        console.log('About to pass imageUri:', finalImageUri);
        
        onScheduleFound(finalSchedule, finalImageUri);

        let alertMessage = "Routine uploaded and saved!";
        if (notFoundCourses.length > 0) {
            alertMessage += `\n\nCould not find the following courses:\n${notFoundCourses.join(', ')}`;
        }
        Alert.alert("Success", alertMessage);
        onClose();

    } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Processing Error', 'Failed to process your routine. Please try again.');
    } finally {
        setLoading(false);
        setManualCourses([]);
        setCourseCode('');
        setSectionName('');
    }
};


    const performOcr = async (uri) => {
        setLoading(true);
        setRawText(null);
        try {
            const textResult = await TextRecognition.recognize(uri);
            const fullText = textResult.text;
            setRawText(fullText);

            const parsedSchedule = parseFullSchedule(textResult.blocks);
            const coursesToFetch = Object.entries(parsedSchedule).flatMap(([day, times]) =>
                Object.values(times).filter(courseInfo => courseInfo !== "XXXX")
            );
        await fetchScheduleAndSave(coursesToFetch, uri);  // Pass uri as parameter
        } catch (error) {
            console.error('Error in OCR or data fetching:', error);
            Alert.alert('Processing Error', 'Failed to process your routine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = () => {
        // Pre-process inputs for robustness
        const cleanedCourseCode = courseCode.trim().replace(/\s/g, '').toUpperCase();
        const cleanedSectionName = sectionName.trim().padStart(2, '0');

        if (cleanedCourseCode && cleanedSectionName) {
            // Check for duplicate entry before adding
            const isDuplicate = manualCourses.some(
                (item) => item.courseCode === cleanedCourseCode && item.sectionName === cleanedSectionName
            );

            if (!isDuplicate) {
                setManualCourses([...manualCourses, { courseCode: cleanedCourseCode, sectionName: cleanedSectionName }]);
                setCourseCode('');
                setSectionName('');
            } else {
                Alert.alert('Duplicate Entry', 'This course and section combination has already been added.');
            }
        } else {
            Alert.alert('Invalid Input', 'Please enter both a Course Code and a Section.');
        }
    };

const handleSaveManual = () => {
    if (manualCourses.length > 0) {
        fetchScheduleAndSave(manualCourses, null);  // No image for manual
    } else {
        Alert.alert('No Courses Added', 'Please add at least one course before saving.');
    }
};
    const handleRemoveCourse = (indexToRemove) => {
        setManualCourses(manualCourses.filter((_, index) => index !== indexToRemove));
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
                    <Appbar.Content title="Routine" titleStyle={styles.appBarTitle} />
                </Appbar.Header>

                <ScrollView contentContainerStyle={styles.paddingContainer}>
                    <View style={localStyles.tabContainer}>
                        <PaperButton
                            mode={activeTab === 'upload' ? 'contained' : 'outlined'}
                            onPress={() => setActiveTab('upload')}
                            style={{ flex: 1, marginRight: 5, borderColor: theme.colors.primary }}
                            labelStyle={{ color: activeTab === 'upload' ? theme.colors.onPrimary : theme.colors.primary }}
                        >
                            <Text>Upload</Text>
                        </PaperButton>
                        <PaperButton
                            mode={activeTab === 'manual' ? 'contained' : 'outlined'}
                            onPress={() => setActiveTab('manual')}
                            style={{ flex: 1, marginLeft: 5, borderColor: theme.colors.primary }}
                            labelStyle={{ color: activeTab === 'manual' ? theme.colors.onPrimary : theme.colors.primary }}
                        >
                            <Text>Manual</Text>
                        </PaperButton>
                    </View>
                    
                    <Text style={localStyles.warningText}>
                        <Text style={{fontWeight: 'bold'}}>Warning: </Text>
Avoid uploading your routine near the end of the semester, after Connect’s database has been synced with the next semester’s routine.</Text>

                    {activeTab === 'upload' ? (
                        <View>
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
                                        Log in to Connect. Take a screenshot of your class routine. Upload the screenshot!
                                    </Paragraph>
                                </Card.Content>
                            </Card>

                            <Card style={styles.mainCard}>
                                <Card.Content>
                                    <PaperButton
                                        mode="contained"
                                        onPress={pickImage}
                                        disabled={loading}
                                        style={{ backgroundColor: theme.colors.primary }}
                                        labelStyle={styles.scanButtonLabel}
                                        icon={() => <ScanText size={20} color={theme.colors.onPrimary} />}
                                    >
                                        <Text>{loading ? "Recognizing..." : "Upload Screenshot"}</Text>
                                    </PaperButton>

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
                        </View>
                    ) : (
                        <Card style={styles.mainCard}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>Add Course Manually</Title>
                                <View style={localStyles.inputRow}>
                                    <TextInput
                                        style={[localStyles.input, { borderColor: theme.colors.primary, color: theme.colors.onSurface }]}
                                        placeholder="Course Code (e.g., CSE220)"
                                        placeholderTextColor={theme.colors.onSurfaceDisabled}
                                        value={courseCode}
                                        onChangeText={setCourseCode}
                                        autoCapitalize="characters"
                                    />
                                    <TextInput
                                        style={[localStyles.input, { borderColor: theme.colors.primary, color: theme.colors.onSurface }]}
                                        placeholder="Section (e.g., 05 or 5)"
                                        placeholderTextColor={theme.colors.onSurfaceDisabled}
                                        value={sectionName}
                                        onChangeText={setSectionName}
                                        keyboardType="numeric"
                                    />
                                    <PaperButton
                                        mode="contained"
                                        onPress={handleAddCourse}
                                        style={localStyles.addButton}
                                        labelStyle={styles.scanButtonLabel}
                                        icon={() => <Plus size={20} color={theme.colors.onPrimary} />}
                                    />
                                </View>
                                <View style={localStyles.courseList}>
                                    {manualCourses.length > 0 ? (
                                        manualCourses.map((item, index) => (
                                            <View key={index} style={[localStyles.courseItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                                                <Text style={[localStyles.courseText, { color: theme.colors.onSurface }]}>{item.courseCode} - {item.sectionName.padStart(2, '0')}</Text>
                                                <PaperButton
                                                    onPress={() => handleRemoveCourse(index)}
                                                    mode="text"
                                                    compact
                                                    labelStyle={{ color: theme.colors.error }}
                                                >
                                                    Remove
                                                </PaperButton>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={[localStyles.emptyText, { color: theme.colors.onSurfaceDisabled }]}>No courses added yet.</Text>
                                    )}
                                </View>
                                <PaperButton
                                    mode="contained"
                                    onPress={handleSaveManual}
                                    disabled={manualCourses.length === 0 || loading}
                                    style={[localStyles.saveButton, { backgroundColor: theme.colors.primary }]}
                                    labelStyle={styles.scanButtonLabel}
                                >
                                    <Text>{loading ? "Saving..." : "Save Routine"}</Text>
                                </PaperButton>
                            </Card.Content>
                        </Card>
                    )}
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    addButton: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
    },
    courseList: {
        marginTop: 15,
        marginBottom: 15,
    },
    courseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        marginBottom: 8,
    },
    courseText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
    },
    saveButton: {
        marginTop: 10,
    }
});

export default OcrScannerModal;