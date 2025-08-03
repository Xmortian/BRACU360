import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, FlatList, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme, TextInput } from 'react-native-paper';
import { Camera, FileText, CalendarCheck, Calendar, ChevronDown } from 'lucide-react-native';
import styles from '../styles/styles';

// --- Deadline Modal Component ---
const DeadlineModal = ({ visible, onClose, courseName }) => {
    const theme = useTheme();
    
    // State for new fields
    const [deadlineName, setDeadlineName] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(new Date());
    const [reminderDays, setReminderDays] = useState(1);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const reminderOptions = [1, 2, 3, 4, 5, 6, 7];

    const handleSave = () => {
        if (!deadlineName) {
            Alert.alert("Error", "Please enter a name for the deadline.");
            return;
        }
        Alert.alert(
            "Deadline Saved!", 
            `Course: ${courseName}\nName: ${deadlineName}\nDate: ${deadlineDate.toDateString()}\nReminder: ${reminderDays} days before.`
        );
        onClose();
        setDeadlineName(''); // Reset state on close
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
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add Deadline</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                        {/* New: Deadline Name Input */}
                        <TextInput
                            label="Deadline Name (e.g. Quiz 1)"
                            value={deadlineName}
                            onChangeText={setDeadlineName}
                            style={styles.textInput}
                        />

                        {/* Date Picker Placeholder */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>Deadline Date</Text>
                        <TouchableOpacity onPress={() => Alert.alert('Date Picker', 'This is a placeholder for a date picker component.')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                <Calendar size={24} color={theme.colors.onSurfaceVariant} style={{ marginRight: 10 }} />
                                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>{deadlineDate.toDateString()}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Reminder Dropdown */}
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
                        style={{ marginTop: 20 }}
                        labelStyle={{ color: theme.colors.onPrimary }}
                    >
                        Save Deadline
                    </PaperButton>
                </View>
            </View>
        </Modal>
    );
};

// --- CoursesScreen Component ---
const CoursesScreen = () => {
    const theme = useTheme();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Dummy data for courses
    const courses = [
        { id: '1', courseName: 'Programming Language I', status: 'Deadline: 5 days left' },
        { id: '2', courseName: 'Introduction to Psychology', status: 'Completed' },
        { id: '3', courseName: 'Discrete Mathematics', status: 'Deadline: 14 days left' },
        { id: '4', courseName: 'Object-Oriented Programming', status: 'No deadline set' },
        { id: '5', courseName: 'Object-Oriented Programming', status: 'No deadline set' },
        
    ];

    const openDeadlineModal = (course) => {
        setSelectedCourse(course);
        setIsModalVisible(true);
    };

    const renderCourseItem = ({ item }) => (
        <Card style={[styles.courseCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 24 }]}>
            <Card.Content>
                <Title style={{ color: theme.colors.onSurface, marginBottom: 5 }}>{item.courseName}</Title>
                <Paragraph style={{ color: item.status.includes('Deadline') ? theme.colors.error : theme.colors.onSurfaceVariant, marginBottom: 15 }}>{item.status}</Paragraph>
                
                {/* The 3 buttons per course card */}
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => Alert.alert('OCR Coming Soon', `This will scan notes for ${item.courseName}.`)} style={styles.cardActionButton}>
                        <Camera size={20} color={theme.colors.primary} />
                        <Text style={[styles.menuText, { color: theme.colors.primary }]}>Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('View Notes Coming Soon', `This will show notes for ${item.courseName}.`)} style={styles.cardActionButton}>
                        <FileText size={20} color={theme.colors.primary} />
                        <Text style={[styles.menuText, { color: theme.colors.primary }]}>Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openDeadlineModal(item)} style={styles.cardActionButton}>
                        <CalendarCheck size={20} color={theme.colors.primary} />
                        <Text style={[styles.menuText, { color: theme.colors.primary }]}>Deadline</Text>
                    </TouchableOpacity>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Courses" titleStyle={styles.appBarTitle} />
            </Appbar.Header>

            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.paddingContainer,
        { paddingBottom: 100 } // <-- ADD THIS LINE
    ]}
            />

            {/* Deadline Modal */}
            <DeadlineModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                courseName={selectedCourse ? selectedCourse.courseName : ''}
            />
        </View>
    );
};

export default CoursesScreen;