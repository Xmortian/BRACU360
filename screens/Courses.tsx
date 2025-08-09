import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Image, Platform, Dimensions, StatusBar } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme, TextInput } from 'react-native-paper';
import { Camera as CameraIcon, FileText, CalendarCheck, Calendar, ChevronDown, Trash } from 'lucide-react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { Camera, CameraView } from 'expo-camera';

import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/styles';

// --- Custom Alert/Error Modal Component (Replaces Alert.alert) ---
const CustomAlertModal = ({ visible, onClose, title, message }) => {
    const theme = useTheme();
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: theme.colors.surface, borderColor: theme.colors.error }]}>
                    <Text style={[styles.modalTitle, { color: theme.colors.error }]}>{title}</Text>
                    <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>{message}</Text>
                    <PaperButton
                        mode="contained"
                        onPress={onClose}
                        style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                        labelStyle={[styles.modalButtonLabel, { color: theme.colors.onError }]}
                    >
                        <Text>OK</Text>
                    </PaperButton>
                </View>
            </View>
        </Modal>
    );
};


// --- Deadline Modal Component ---
const DeadlineModal = ({ visible, onClose, courseId, onAddDeadline }) => {
    const theme = useTheme();
    const [deadlineName, setDeadlineName] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(new Date());
    const [reminderDays, setReminderDays] = useState(0);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const reminderOptions = [0, 1, 2, 3, 4, 5, 6, 7];

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertModalVisible(true);
    };

    const handleSave = () => {
        if (!deadlineName) {
            showAlert("Error", "Please enter a name for the deadline.");
            return;
        }
        if (!deadlineDate) {
            showAlert("Error", "Please select a deadline date.");
            return;
        }
        onAddDeadline(courseId, { id: Math.random().toString(), name: deadlineName, date: deadlineDate.toISOString(), reminderDays });
        
        // Reset state on close
        setDeadlineName('');
        setDeadlineDate(new Date());
        setReminderDays(1);
        onClose();
    };

    const onDateConfirm = (params) => {
        setShowDatePicker(false);
        setDeadlineDate(params.date);
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setDeadlineDate(selectedTime);
        }
    };
    
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface, height: 'auto' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add New Deadline</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}><Text>Close</Text></PaperButton>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                        <TextInput
                            label="Deadline Name (e.g. Quiz 1)"
                            value={deadlineName}
                            onChangeText={setDeadlineName}
                            style={styles.textInput}
                            mode="outlined"
                        />

                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>Deadline Date & Time</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Calendar size={24} color={theme.colors.onSurfaceVariant} style={{ marginRight: 10 }} />
                                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>{deadlineDate ? deadlineDate.toDateString() : 'Select date'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>{deadlineDate ? deadlineDate.toLocaleTimeString() : 'Select time'}</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {showDatePicker && (
                            <DatePickerModal
                                locale="en"
                                mode="single"
                                visible={showDatePicker}
                                onDismiss={() => setShowDatePicker(false)}
                                date={deadlineDate}
                                onConfirm={onDateConfirm}
                            />
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                value={deadlineDate}
                                mode="time"
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}

                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>Remind Me</Text>
                        <TouchableOpacity onPress={() => setIsDropdownVisible(!isDropdownVisible)} style={[styles.dropdownButton, { borderColor: theme.colors.onSurfaceVariant }]}>
                            <Text style={{ color: theme.colors.onSurface }}>{reminderDays} day(s) before</Text>
                            <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                        
                        {isDropdownVisible && (
                            <View style={{ borderWidth: 1, borderColor: theme.colors.onSurfaceVariant, borderRadius: 8, marginTop: -15, marginBottom: 15 }}>
                                {reminderOptions.map(day => (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => { setReminderDays(day); setIsDropdownVisible(false); }}
                                        style={[styles.dropdownItem, { backgroundColor: reminderDays === day ? theme.colors.primaryContainer : 'transparent' }]}
                                    >
                                        <Text style={{ color: reminderDays === day ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>{day} day(s) before</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                    
                    <PaperButton
                        mode="contained"
                        onPress={handleSave}
                        style={{ marginTop: 20, backgroundColor: theme.colors.primary }}
                        labelStyle={{ color: theme.colors.onPrimary }}
                    >
                        <Text>Save Deadline</Text>
                    </PaperButton>
                </View>
            </View>
            <CustomAlertModal
                visible={alertModalVisible}
                onClose={() => setAlertModalVisible(false)}
                title={alertTitle}
                message={alertMessage}
            />
        </Modal>
    );
};

// --- Camera Modal Component ---
const CameraModal = ({ visible, onClose, onPictureSaved }) => {
    const cameraRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            const { status: microphoneStatus } = await Camera.requestMicrophonePermissionsAsync();
            setHasPermission(status === 'granted' && microphoneStatus === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            onPictureSaved(photo.uri);
            onClose();
        }
    };

    if (hasPermission === null) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No access to camera</Text>
            </View>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1 }}>
                <CameraView style={{ flex: 1 }} ref={cameraRef}>
                    <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row' }}>
                    </View>
                </CameraView>
                <View style={{ position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' }}>
                    <TouchableOpacity onPress={takePicture} style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: 'gray', backgroundColor: 'transparent' }} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 50, left: 20 }}>
                    <Text style={{ fontSize: 18, color: 'white' }}>✕</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

// --- Notes Modal Component ---
const NotesModal = ({ visible, onClose, notes, onRemoveNote }) => {
    const theme = useTheme();

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                <Appbar.Content title="Stored Notes" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.onPrimary }}><Text>Close</Text></PaperButton>
            </Appbar.Header>
            <FlatList
                data={notes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={{ margin: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' }}>
                        <Image source={{ uri: item }} style={{ width: '100%', height: 300 }} resizeMode="contain" />
                        <TouchableOpacity onPress={() => onRemoveNote(index)} style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'red', borderRadius: 20, padding: 5 }}>
                            <Trash size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>No notes saved for this course yet.</Text>
                    </View>
                )}
            />
        </Modal>
    );
};

// --- CoursesScreen Component ---
const CoursesScreen = () => {
    const theme = useTheme();
    const [isDeadlineModalVisible, setIsDeadlineModalVisible] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [courses, setCourses] = useState([
        { id: '1', courseName: 'Programming Language I', notes: [], deadlines: [{ id: 'd1', name: 'Assignment 2', date: '2025-08-08T18:00:00.000Z', reminderDays: 2 }] },
        { id: '2', courseName: 'Introduction to Psychology', notes: [], deadlines: [] },
        { id: '3', courseName: 'Discrete Mathematics', notes: [], deadlines: [{ id: 'd2', name: 'Quiz 3', date: '2025-08-17T12:00:00.000Z', reminderDays: 7 }] },
        { id: '4', courseName: 'Object-Oriented Programming', notes: [], deadlines: [] },
    ]);
    const [generalDeadlines, setGeneralDeadlines] = useState([]);
    const [isGeneralDeadlineModalVisible, setIsGeneralDeadlineModalVisible] = useState(false);

    const handleAddGeneralDeadline = (deadlineData) => {
        setGeneralDeadlines(prevDeadlines => [...prevDeadlines, deadlineData]);
    };
    
    const handleDeleteGeneralDeadline = (id) => {
        setGeneralDeadlines(prevDeadlines => prevDeadlines.filter(deadline => deadline.id !== id));
    };

    const handleAddDeadline = (courseId, deadlineData) => {
        setCourses(prevCourses => prevCourses.map(course =>
            course.id === courseId ? { ...course, deadlines: [...course.deadlines, deadlineData] } : course
        ));
    };

    const handlePictureSaved = (photoUri) => {
        setCourses(prevCourses => prevCourses.map(course =>
            course.id === selectedCourse.id ? { ...course, notes: [...course.notes, photoUri] } : course
        ));
    };

    const handleRemoveNote = (noteIndex) => {
        setCourses(prevCourses => prevCourses.map(course =>
            course.id === selectedCourse.id ? { ...course, notes: course.notes.filter((_, index) => index !== noteIndex) } : course
        ));
    };

    const openNotesModal = (course) => {
        setSelectedCourse(course);
        setIsNotesModalVisible(true);
    };

    const calculateTimeLeft = (deadlineDate) => {
        const now = new Date();
        const deadline = new Date(deadlineDate);
        const diffInMilliseconds = deadline.getTime() - now.getTime();
        const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
        if (diffInHours > 0) {
            return `${diffInHours} hours left`;
        }
        return 'Passed';
    };

    const renderCourseItem = ({ item }) => (
        <Card style={[styles.courseCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12 }]}>
            <Card.Content>
                <Title style={{ color: theme.colors.onSurface, marginBottom: 5 }}>{item.courseName}</Title>
                
                {item.deadlines.length > 0 ? (
                    item.deadlines.map(deadline => (
                        <View key={deadline.id} style={{ marginBottom: 10 }}>
                            <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                                {deadline.name}
                            </Paragraph>
                            <Paragraph style={{ color: calculateTimeLeft(deadline.date) === 'Passed' ? theme.colors.error : theme.colors.primary }}>
                                {calculateTimeLeft(deadline.date)}
                            </Paragraph>
                        </View>
                    ))
                ) : (
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant, marginBottom: 15 }}>No deadlines!</Paragraph>
                )}

                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => { setSelectedCourse(item); setIsCameraVisible(true); }} style={styles.cardActionButton}>
                        <CameraIcon size={20} color={theme.colors.primary} />
                        <Text style={[styles.menuText, { color: theme.colors.primary }]}>Take Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openNotesModal(item)} style={styles.cardActionButton}>
                        <FileText size={20} color={theme.colors.primary} />
                        <Text style={[styles.menuText, { color: theme.colors.primary }]}>Stored Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setSelectedCourse(item); setIsDeadlineModalVisible(true); }} style={styles.cardActionButton}>
                        <CalendarCheck size={20} color={theme.colors.primary} />
                        <Text style={[styles.menuText, { color: theme.colors.primary }]}>Add Deadline</Text>
                    </TouchableOpacity>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                <Appbar.Content title="Courses" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
            </Appbar.Header>

            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.paddingContainer, { paddingBottom: 100 }]} // Added paddingBottom
                ListHeaderComponent={() => (
                    <View>
                        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>General Deadlines</Text>
                            <TouchableOpacity onPress={() => setIsGeneralDeadlineModalVisible(true)}>
                                <Text style={[styles.addButton, { color: theme.colors.primary }]}>+ Add</Text>
                            </TouchableOpacity>
                        </View>
                        {generalDeadlines.length > 0 ? (
                            <FlatList
                                data={generalDeadlines}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <View style={[styles.deadlineItem, { backgroundColor: theme.colors.surface, marginBottom: 10 }]}>
                                        <View>
                                            <Paragraph style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>{item.name}</Paragraph>
                                            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>{new Date(item.date).toDateString()}</Paragraph>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteGeneralDeadline(item.id)}>
                                            <Trash size={24} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                scrollEnabled={false}
                            />
                        ) : (
                            <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>No general deadlines added.</Text>
                        )}
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>My Courses</Text>
                    </View>
                )}
            />

            {/* Modals */}
            <DeadlineModal
                visible={isDeadlineModalVisible}
                onClose={() => setIsDeadlineModalVisible(false)}
                courseId={selectedCourse?.id}
                onAddDeadline={handleAddDeadline}
            />
            <CameraModal
                visible={isCameraVisible}
                onClose={() => setIsCameraVisible(false)}
                onPictureSaved={handlePictureSaved}
            />
            <NotesModal
                visible={isNotesModalVisible}
                onClose={() => setIsNotesModalVisible(false)}
                notes={selectedCourse?.notes || []}
                onRemoveNote={handleRemoveNote}
            />

            {/* New General Deadline Modal (copied from DeadlineModal) */}
            <GeneralDeadlineModal
                visible={isGeneralDeadlineModalVisible}
                onClose={() => setIsGeneralDeadlineModalVisible(false)}
                onAddDeadline={handleAddGeneralDeadline}
            />
        </View>
    );
};

const GeneralDeadlineModal = ({ visible, onClose, onAddDeadline }) => {
    const theme = useTheme();
    const [deadlineName, setDeadlineName] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(new Date());
    const [reminderDays, setReminderDays] = useState(0);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const reminderOptions = [0, 1, 2, 3, 4, 5, 6, 7];

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertModalVisible(true);
    };

    const handleSave = () => {
        if (!deadlineName) {
            showAlert("Error", "Please enter a name for the deadline.");
            return;
        }
        if (!deadlineDate) {
            showAlert("Error", "Please select a deadline date.");
            return;
        }
        onAddDeadline({ id: Math.random().toString(), name: deadlineName, date: deadlineDate.toISOString(), reminderDays });
        
        setDeadlineName('');
        setDeadlineDate(new Date());
        setReminderDays(1);
        onClose();
    };

    const onDateConfirm = (params) => {
        setShowDatePicker(false);
        setDeadlineDate(params.date);
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setDeadlineDate(selectedTime);
        }
    };
    
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface, height: 'auto' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add General Deadline</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}><Text>Close</Text></PaperButton>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                        <TextInput
                            label="Deadline Name (e.g. Internship Application)"
                            value={deadlineName}
                            onChangeText={setDeadlineName}
                            style={styles.textInput}
                            mode="outlined"
                        />

                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>Deadline Date & Time</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Calendar size={24} color={theme.colors.onSurfaceVariant} style={{ marginRight: 10 }} />
                                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>{deadlineDate ? deadlineDate.toDateString() : 'Select date'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>{deadlineDate ? deadlineDate.toLocaleTimeString() : 'Select time'}</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {showDatePicker && (
                            <DatePickerModal
                                locale="en"
                                mode="single"
                                visible={showDatePicker}
                                onDismiss={() => setShowDatePicker(false)}
                                date={deadlineDate}
                                onConfirm={onDateConfirm}
                            />
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                value={deadlineDate}
                                mode="time"
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}

                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>Remind Me</Text>
                        <TouchableOpacity onPress={() => setIsDropdownVisible(!isDropdownVisible)} style={[styles.dropdownButton, { borderColor: theme.colors.onSurfaceVariant }]}>
                            <Text style={{ color: theme.colors.onSurface }}>{reminderDays} day(s) before</Text>
                            <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                        
                        {isDropdownVisible && (
                            <View style={{ borderWidth: 1, borderColor: theme.colors.onSurfaceVariant, borderRadius: 8, marginTop: -15, marginBottom: 15 }}>
                                {reminderOptions.map(day => (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => { setReminderDays(day); setIsDropdownVisible(false); }}
                                        style={[styles.dropdownItem, { backgroundColor: reminderDays === day ? theme.colors.primaryContainer : 'transparent' }]}
                                    >
                                        <Text style={{ color: reminderDays === day ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>{day} day(s) before</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                    
                    <PaperButton
                        mode="contained"
                        onPress={handleSave}
                        style={{ marginTop: 20, backgroundColor: theme.colors.primary }}
                        labelStyle={{ color: theme.colors.onPrimary }}
                    >
                        <Text>Save Deadline</Text>
                    </PaperButton>
                </View>
            </View>
            <CustomAlertModal
                visible={alertModalVisible}
                onClose={() => setAlertModalVisible(false)}
                title={alertTitle}
                message={alertMessage}
            />
        </Modal>
    );
};

export default CoursesScreen;