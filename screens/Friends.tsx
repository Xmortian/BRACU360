import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, FlatList, Linking, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, TextInput, useTheme, List } from 'react-native-paper';
import { Plus, Trash, UploadCloud, Phone, ChevronDown, Edit3, Eye } from 'lucide-react-native';
import styles from '../styles/styles';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import QrScannerModal from './QrScannerModal';
import OcrScannerModal from './OcrScanner';

const { width, height } = Dimensions.get('window');

const generateSemesters = () => {
    const startYear = new Date().getFullYear() - 1;
    const endYear = 2035;
    const semesters = [];
    for (let year = startYear; year <= endYear; year++) {
        semesters.push(`Spring ${year}`, `Summer ${year}`, `Fall ${year}`);
    }
    return semesters;
};

const semesterOptions = generateSemesters();

const BlinkingDot = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(v => !v);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'red',
            opacity: visible ? 1 : 0.2,
            marginRight: 8
        }} />
    );
};

const ZoomableImageViewerModal = ({ visible, onClose, imageUri }) => {
    const images = imageUri ? [{ url: imageUri }] : [];

    return (
        <Modal 
            visible={visible} 
            transparent={true} 
            onRequestClose={onClose}
        >
            <ImageViewer 
                imageUrls={images} 
                onCancel={onClose} 
                onSwipeDown={onClose} 
                enableSwipeDown={true} 
                renderIndicator={() => null}
                renderHeader={() => (
                    <View style={uiStyles.imageViewerHeader}>
                        <TouchableOpacity onPress={onClose} style={uiStyles.closeButton}>
                            <Text style={uiStyles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </Modal>
    );
};

const AddFriendModal = ({ visible, onClose, onAddFriend }) => {
    const theme = useTheme();
    const [friendName, setFriendName] = useState('');
    const [friendContact, setFriendContact] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('Summer 2025');
    const [isSemesterPickerVisible, setIsSemesterPickerVisible] = useState(false);
    const [isQrScannerVisible, setIsQrScannerVisible] = useState(false);
    const [isOcrScannerVisible, setIsOcrScannerVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);

    const handleCloseModal = () => {
        setFriendName('');
        setFriendContact('');
        setSelectedImageUri(null);
        setSelectedSemester('Summer 2025');
        onClose();
    };

    const handleUploadRoutine = () => {
        Alert.alert(
            "Select Routine Source",
            "Do you want to upload a routine image or scan a QR code?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Upload Image", onPress: () => setIsOcrScannerVisible(true) },
                { text: "Scan QR Code", onPress: () => setIsQrScannerVisible(true) }
            ]
        );
    };

    const handleOcrComplete = (routineData) => {
        setIsOcrScannerVisible(false);
        setIsUploading(false);
        if (routineData && routineData.length > 0) {
            const courses = routineData.map(c => c.courseName).join(', ');
            onAddFriend({
                id: Math.random().toString(),
                name: friendName,
                courses: courses,
                contact: friendContact || '',
                routineData: routineData,
                semester: selectedSemester,
                routineImageUri: '',
            });
            handleCloseModal();
            Alert.alert('Success', `Routine uploaded for ${friendName}! Found courses: ${courses}`);
        } else {
            Alert.alert('No Courses Found', 'OCR could not detect any courses. Please try another image.');
        }
    };

    const handleQrCodeScanned = (scannedData) => {
        setIsQrScannerVisible(false);
        try {
            const routineData = JSON.parse(scannedData);
            if (Array.isArray(routineData) && routineData.length > 0) {
                const courses = routineData.map(c => c.courseName).join(', ');
                onAddFriend({
                    id: Math.random().toString(),
                    name: friendName,
                    courses: courses,
                    contact: friendContact || '',
                    routineData: routineData,
                    semester: selectedSemester,
                    routineImageUri: '',
                });
                handleCloseModal();
                Alert.alert('Success', `Routine uploaded for ${friendName} via QR! Found courses: ${courses}`);
            } else {
                Alert.alert('No Courses Found', 'QR code did not contain valid routine data.');
            }
        } catch (e) {
            Alert.alert('QR Code Error', 'Could not parse data from QR code. It may be in an invalid format.');
        }
    };

    const handleSaveFriend = () => {
        if (!friendName.trim()) {
            Alert.alert('Error', 'Please enter a friend\'s name.');
            return;
        }
        onAddFriend({
            id: Math.random().toString(),
            name: friendName,
            courses: '',
            contact: friendContact || '',
            routineData: [],
            semester: selectedSemester,
            routineImageUri: '',
        });
        handleCloseModal();
    };

    return (
        <Modal 
            animationType="slide" 
            transparent={true} 
            visible={visible} 
            onRequestClose={handleCloseModal}
        >
            <View style={uiStyles.modalOverlay}>
                <View style={[uiStyles.modalContainer, { backgroundColor: theme.colors.surface, height: 'auto' }]}>
                    <View style={uiStyles.modalHeader}>
                        <Text style={[uiStyles.modalTitle, { color: theme.colors.onSurface }]}>Add New Friend</Text>
                        <PaperButton icon="close" onPress={handleCloseModal} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView contentContainerStyle={uiStyles.addFriendModalContent}>
                        <TextInput
                            label="Friend's Name"
                            value={friendName}
                            onChangeText={setFriendName}
                            style={uiStyles.textInput}
                            mode="outlined"
                        />
                        <TextInput
                            label="Friend's Contact"
                            value={friendContact}
                            onChangeText={setFriendContact}
                            style={uiStyles.textInput}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        <View style={{ marginTop: 15 }}>
                            <TouchableOpacity
                                style={[uiStyles.textInput, uiStyles.dropdown, { paddingRight: 15 }]}
                                onPress={() => setIsSemesterPickerVisible(true)}
                            >
                                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
                                    Semester: {selectedSemester}
                                </Text>
                                <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>
                        
                        <PaperButton
                            mode="contained"
                            onPress={handleUploadRoutine}
                            style={{ marginTop: 20 }}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Upload Routine
                        </PaperButton>
                        <PaperButton
                            mode="outlined"
                            onPress={handleSaveFriend}
                            style={{ marginTop: 10, borderColor: theme.colors.primary }}
                            labelStyle={{ color: theme.colors.primary }}
                        >
                            Save Friend
                        </PaperButton>
                    </ScrollView>
                </View>
            </View>
            <Modal 
                animationType="fade"
                transparent={true}
                visible={isSemesterPickerVisible}
                onRequestClose={() => setIsSemesterPickerVisible(false)}
            >
                <View style={[uiStyles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[uiStyles.modalContainer, { width: '80%', maxHeight: '50%', backgroundColor: theme.colors.surface, paddingHorizontal: 15 }]}>
                        <List.Section>
                            <List.Subheader>Select Semester</List.Subheader>
                            <FlatList
                                data={semesterOptions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <List.Item
                                        title={item}
                                        onPress={() => {
                                            setSelectedSemester(item);
                                            setIsSemesterPickerVisible(false);
                                        }}
                                        style={{ backgroundColor: selectedSemester === item ? theme.colors.primaryContainer : 'transparent' }}
                                        titleStyle={{ color: selectedSemester === item ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
                                    />
                                )}
                            />
                        </List.Section>
                        <PaperButton onPress={() => setIsSemesterPickerVisible(false)}>
                            Cancel
                        </PaperButton>
                    </View>
                </View>
            </Modal>
            <QrScannerModal
                visible={isQrScannerVisible}
                onClose={() => setIsQrScannerVisible(false)}
                onQrCodeScanned={handleQrCodeScanned}
            />
            <OcrScannerModal
                visible={isOcrScannerVisible}
                onClose={() => setIsOcrScannerVisible(false)}
                onScheduleFound={handleOcrComplete}
            />
        </Modal>
    );
};

const EditFriendModal = ({ visible, onClose, friend, onSave }) => {
    const theme = useTheme();
    const [editedContact, setEditedContact] = useState(friend.contact);
    const [selectedSemester, setSelectedSemester] = useState(friend.semester);
    const [isSemesterPickerVisible, setIsSemesterPickerVisible] = useState(false);
    const [isQrScannerVisible, setIsQrScannerVisible] = useState(false);
    const [isOcrScannerVisible, setIsOcrScannerVisible] = useState(false);

    const handleReuploadRoutine = async () => {
        Alert.alert(
            'Re-upload Routine',
            'Select a new routine source.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upload Image', onPress: () => setIsOcrScannerVisible(true) },
                { text: 'Scan QR Code', onPress: () => setIsQrScannerVisible(true) }
            ]
        );
    };

    const handleOcrComplete = (routineData) => {
        setIsOcrScannerVisible(false);
        const newCourses = routineData.map(c => c.courseName).join(', ');
        const updatedFriend = {
            ...friend,
            courses: newCourses,
            routineData: routineData,
            semester: selectedSemester,
        };
        onSave(updatedFriend);
        Alert.alert('Success', 'New routine uploaded and processed.');
        onClose();
    };

    const handleQrCodeReupload = (scannedData) => {
        setIsQrScannerVisible(false);
        try {
            const routineData = JSON.parse(scannedData);
            if (Array.isArray(routineData) && routineData.length > 0) {
                const newCourses = routineData.map(c => c.courseName).join(', ');
                const updatedFriend = {
                    ...friend,
                    courses: newCourses,
                    routineData: routineData,
                    semester: selectedSemester,
                };
                onSave(updatedFriend);
                Alert.alert('Success', 'New routine uploaded and processed via QR.');
            } else {
                Alert.alert('No Courses Found', 'QR code did not contain valid routine data.');
            }
            onClose();
        } catch (e) {
            Alert.alert('QR Code Error', 'Could not parse data from QR code. It may be in an invalid format.');
            onClose();
        }
    };

    const handleSave = () => {
        const updatedFriend = {
            ...friend,
            contact: editedContact,
            semester: selectedSemester,
        };
        onSave(updatedFriend);
        onClose();
    };

    return (
        <Modal 
            animationType="slide" 
            transparent={true} 
            visible={visible} 
            onRequestClose={onClose}
        >
            <View style={uiStyles.modalOverlay}>
                <View style={[uiStyles.modalContainer, { backgroundColor: theme.colors.surface, height: 'auto' }]}>
                    <View style={uiStyles.modalHeader}>
                        <Text style={[uiStyles.modalTitle, { color: theme.colors.onSurface }]}>Edit {friend.name}</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView contentContainerStyle={uiStyles.addFriendModalContent}>
                        <TextInput
                            label="Contact Number"
                            value={editedContact}
                            onChangeText={setEditedContact}
                            style={uiStyles.textInput}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        <View style={{ marginTop: 15 }}>
                            <TouchableOpacity
                                style={[uiStyles.textInput, uiStyles.dropdown, { paddingRight: 15 }]}
                                onPress={() => setIsSemesterPickerVisible(true)}
                            >
                                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
                                    Semester: {selectedSemester}
                                </Text>
                                <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>
                        
                        <PaperButton
                            mode="contained"
                            onPress={handleReuploadRoutine}
                            style={{ marginTop: 20 }}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Re-upload Routine
                        </PaperButton>
                        
                        <PaperButton
                            mode="outlined"
                            onPress={handleSave}
                            style={{ marginTop: 10, borderColor: theme.colors.primary }}
                            labelStyle={{ color: theme.colors.primary }}
                        >
                            Save Changes
                        </PaperButton>
                    </ScrollView>
                </View>
            </View>
            <Modal 
                animationType="fade"
                transparent={true}
                visible={isSemesterPickerVisible}
                onRequestClose={() => setIsSemesterPickerVisible(false)}
            >
                <View style={[uiStyles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[uiStyles.modalContainer, { width: '80%', maxHeight: '50%', backgroundColor: theme.colors.surface, paddingHorizontal: 15 }]}>
                        <List.Section>
                            <List.Subheader>Select Semester</List.Subheader>
                            <FlatList
                                data={semesterOptions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <List.Item
                                        title={item}
                                        onPress={() => {
                                            setSelectedSemester(item);
                                            setIsSemesterPickerVisible(false);
                                        }}
                                        style={{ backgroundColor: selectedSemester === item ? theme.colors.primaryContainer : 'transparent' }}
                                        titleStyle={{ color: selectedSemester === item ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
                                    />
                                )}
                            />
                        </List.Section>
                        <PaperButton onPress={() => setIsSemesterPickerVisible(false)}>
                            Cancel
                        </PaperButton>
                    </View>
                </View>
            </Modal>
            <QrScannerModal
                visible={isQrScannerVisible}
                onClose={() => setIsQrScannerVisible(false)}
                onQrCodeScanned={handleQrCodeReupload}
            />
            <OcrScannerModal
                visible={isOcrScannerVisible}
                onClose={() => setIsOcrScannerVisible(false)}
                onScheduleFound={handleOcrComplete}
            />
        </Modal>
    );
};

const parseTimeToMinutes = (timeString) => {
    // Basic time parsing without regular expressions
    if (typeof timeString !== 'string' || !timeString.includes(':')) {
        return -1;
    }
    
    const parts = timeString.split(/[\s:]/);
    let hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    const period = (parts[2] || '').toUpperCase();

    if (period === 'PM' && hour !== 12) {
        hour += 12;
    }
    if (period === 'AM' && hour === 12) {
        hour = 0;
    }
    return hour * 60 + minute;
};

const getMinutesSinceLastClass = (endTime) => {
    const now = new Date();
    const nowInMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = parseTimeToMinutes(endTime);
    
    if (endMinutes === -1) return -1;

    // Check if the time has wrapped around to the next day
    if (nowInMinutes < endMinutes) {
        return (nowInMinutes + 24 * 60) - endMinutes;
    }

    return nowInMinutes - endMinutes;
};

const getMinutesUntilNextClass = (startTime) => {
    const now = new Date();
    const nowInMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseTimeToMinutes(startTime);

    if (startMinutes === -1) return -1;

    // Check if the next class is on the next day
    if (startMinutes < nowInMinutes) {
        return (startMinutes + 24 * 60) - nowInMinutes;
    }

    return startMinutes - nowInMinutes;
};

const formatTimeDifference = (minutes) => {
    if (minutes < 0) return 'in the past';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let result = '';
    if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (mins > 0) {
        if (result) result += ' ';
        result += `${mins} minute${mins > 1 ? 's' : ''}`;
    }
    return result || 'less than a minute';
};

const getFriendStatus = (routineData) => {
    if (!Array.isArray(routineData) || routineData.length === 0) {
        return 'No routine uploaded';
    }
    
    const now = new Date();
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now).toUpperCase();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const todaysClasses = routineData.flatMap(course => {
        if (!Array.isArray(course.classTimes)) {
            return [];
        }

        return course.classTimes
            .filter(c => c.day.toUpperCase() === today)
            .map(c => ({
                courseName: course.courseName,
                startTime: parseTimeToMinutes(c.startTime),
                endTime: parseTimeToMinutes(c.endTime),
                roomName: c.roomName || course.room
            }));
    });
    
    if (todaysClasses.length === 0) {
        return 'Off day';
    }
    
    todaysClasses.sort((a, b) => a.startTime - b.startTime);
    
    const firstClass = todaysClasses[0];
    const lastClass = todaysClasses[todaysClasses.length - 1];
    
    // Check if class times are valid after parsing
    if (firstClass.startTime === -1 || lastClass.endTime === -1) {
        return 'Routine data error';
    }

    // Currently in a class
    for (const cls of todaysClasses) {
        if (cls.startTime !== -1 && cls.endTime !== -1 && currentTimeInMinutes >= cls.startTime && currentTimeInMinutes < cls.endTime) {
            return `Classing in ${cls.roomName}`;
        }
    }
    
    // Before first class
    if (currentTimeInMinutes < firstClass.startTime) {
        const minutesUntil = getMinutesUntilNextClass(firstClass.startTime);
        const formattedTime = formatTimeDifference(minutesUntil);
        return `First Class Begins in ${formattedTime}`;
    }

    // After last class
    if (currentTimeInMinutes >= lastClass.endTime) {
        const minutesSince = getMinutesSinceLastClass(lastClass.endTime);
        const formattedTime = formatTimeDifference(minutesSince);
        return `Last class ended ${formattedTime} ago`;
    }
    
    // In a class gap
    for (let i = 0; i < todaysClasses.length - 1; i++) {
        const currentClassEnd = todaysClasses[i].endTime;
        const nextClassStart = todaysClasses[i + 1].startTime;
        if (currentClassEnd !== -1 && nextClassStart !== -1 && currentTimeInMinutes >= currentClassEnd && currentTimeInMinutes < nextClassStart) {
            const minutesFree = getMinutesUntilNextClass(todaysClasses[i + 1].startTime);
            const formattedTime = formatTimeDifference(minutesFree);
            return `Class Gap (Free for ${formattedTime})`;
        }
    }
    
    return 'Status not determined';
};

const getUniqueCourses = (routineData) => {
    // FIX: Check if routineData is a valid array before proceeding
    if (!Array.isArray(routineData)) {
        return [];
    }
    
    const uniqueCourses = new Set();
    return routineData.filter(course => {
        const baseCourseName = course.courseName.replace(/L$/, '');
        if (!uniqueCourses.has(baseCourseName)) {
            uniqueCourses.add(baseCourseName);
            return true;
        }
        return false;
    });
};

const FriendsScreen = () => {
    const theme = useTheme();

    const colorPalette = {
        semester: '#A7F3D0',
        courses: '#FDE68A',
        status: '#BFDBFE',
        contact: '#D1FAE5',
    };

    const [friends, setFriends] = useState([
        { 
            id: '1', 
            name: 'Alice Smith', 
            courses: 'MAT216, CSE230, PHY110', 
            status: 'Off day', 
            contact: '01234567890', 
            semester: 'Summer 2025', 
            routineImageUri: 'https://via.placeholder.com/300/00C853/FFFFFF?text=Routine+Alice', 
            routineData: [
                {
                    "courseName": "CSE421-14-09A-02C",
                    "classTimes": [
                        { "day": "Monday", "startTime": "11:00 AM", "endTime": "12:20 PM" },
                        { "day": "Monday", "startTime": "12:30 PM", "endTime": "01:50 PM" }
                    ]
                },
                {
                    "courseName": "CSE331-04-KKP-07H-27C",
                    "classTimes": [
                        { "day": "Monday", "startTime": "09:30 AM", "endTime": "10:50 AM" },
                        { "day": "Wednesday", "startTime": "09:30 AM", "endTime": "10:50 AM" }
                    ]
                },
                {
                    "courseName": "CSE423-02-TMD-09A-05C",
                    "classTimes": [
                        { "day": "Monday", "startTime": "03:30 PM", "endTime": "04:50 PM" },
                        { "day": "Wednesday", "startTime": "03:30 PM", "endTime": "04:50 PM" }
                    ]
                },
                {
                    "courseName": "CSE470-16-SOSB-07D-20C",
                    "classTimes": [
                        { "day": "Tuesday", "startTime": "02:00 PM", "endTime": "03:20 PM" },
                        { "day": "Sunday", "startTime": "02:00 PM", "endTime": "03:20 PM" }
                    ]
                },
                {
                    "courseName": "CSE423-02-TMD-10E-27L",
                    "classTimes": [
                        { "day": "Tuesday", "startTime": "08:00 AM", "endTime": "09:20 AM" },
                        { "day": "Tuesday", "startTime": "09:30 AM", "endTime": "10:50 AM" }
                    ]
                }
            ]
        },
        { id: '2', name: 'Bob Johnson', courses: 'CSE470, EEE300', status: 'Class Gap (Next class in 1 hour 20 minutes)', contact: '01234567891', semester: 'Fall 2024', routineImageUri: 'https://via.placeholder.com/300/FF5733/FFFFFF?text=Routine+Bob', routineData: [] },
        { id: '3', name: 'Charlie Brown', courses: 'CSE110, MAT120', status: 'First Class Begins in 2 hours', contact: '01234567892', semester: 'Summer 2025', routineImageUri: '', routineData: [] },
        { id: '4', name: 'Diana Prince', courses: 'BBA101, ECO101', status: 'Last class Ended in 30 minutes', contact: '', semester: 'Spring 2025', routineImageUri: '', routineData: [] },
        { id: '5', name: 'Emily White', courses: 'ENG101, LAW200', status: 'Classing in 9B-24L', contact: '', semester: 'Spring 2025', routineImageUri: '', routineData: [] },
    ]);
    const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);
    const [isEditFriendModalVisible, setIsEditFriendModalVisible] = useState(false);
    const [currentFriend, setCurrentFriend] = useState(null);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);

    const handleViewRoutine = (imageUri) => {
        if (!imageUri) {
            Alert.alert('No Routine Found', 'This friend has not uploaded a routine yet.');
            return;
        }
        setSelectedImageUri(imageUri);
        setIsImageViewerVisible(true);
    };

    const handleAddFriend = (newFriend) => {
        setFriends(prevFriends => [...prevFriends, newFriend]);
    };

    const handleEditFriend = (friend) => {
        setCurrentFriend(friend);
        setIsEditFriendModalVisible(true);
    };

    const handleSaveEditedFriend = (editedFriend) => {
        setFriends(prevFriends =>
            prevFriends.map(friend =>
                friend.id === editedFriend.id ? editedFriend : friend
            )
        );
        setIsEditFriendModalVisible(false);
    };

    const handleDeleteFriend = (id) => {
        Alert.alert(
            "Delete Friend",
            "Are you sure you want to delete this friend?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        setFriends(prevFriends => prevFriends.filter(friend => friend.id !== id));
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const renderFriendItem = ({ item }) => {
        const courses = getUniqueCourses(item.routineData).map((course, index) => ({ 
            key: `${item.id}-${course.courseName}-${index}`,
            courseName: course.courseName
        }));
        
        const dynamicStatus = getFriendStatus(item.routineData);

        return (
            <Card style={[uiStyles.friendCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={uiStyles.friendCardContent}>
                    <View style={uiStyles.cardActionsTopRight}>
                        <TouchableOpacity onPress={() => handleEditFriend(item)} style={uiStyles.cardActionButton}>
                            <Edit3 size={24} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginRight: 60 }}>
                        <Title style={{ color: theme.colors.onSurface }}>{item.name}</Title>
                        <View style={[uiStyles.smallBadge, { backgroundColor: colorPalette.semester, marginTop: 5 }]}>
                            <Text style={[uiStyles.badgeText, { color: 'black' }]}>
                                {item.semester}
                            </Text>
                        </View>
                        <View style={{ marginTop: 5 }}>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={courses}
                                renderItem={({ item: courseItem }) => (
                                    <View style={[uiStyles.courseBadge, { backgroundColor: colorPalette.courses, marginRight: 5 }]}>
                                        <Text style={[uiStyles.badgeText, { color: 'black' }]}>
                                            {courseItem.courseName}
                                        </Text>
                                    </View>
                                )}
                                keyExtractor={courseItem => courseItem.key}
                            />
                        </View>
                        <View style={[uiStyles.statusBadge, { backgroundColor: colorPalette.status, marginTop: 10 }]}>
                            <BlinkingDot />
                            <Text style={[uiStyles.badgeText, { color: 'black', flexShrink: 1 }]}>
                                {dynamicStatus}
                            </Text>
                        </View>
                        {item.contact && (
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)} style={[uiStyles.contactBadge, { backgroundColor: colorPalette.contact, marginTop: 15, flexDirection: 'row', alignItems: 'center' }]}>
                                <Text style={[uiStyles.badgeText, { color: 'black', marginRight: 8 }]}>
                                    {item.contact}
                                </Text>
                                <Phone size={20} color='black' />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={uiStyles.cardActionsRightCenter}>
                        {item.routineImageUri ? (
                            <TouchableOpacity onPress={() => handleViewRoutine(item.routineImageUri)} style={uiStyles.cardActionButton}>
                                <Eye size={24} color={theme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        ) : (
                            <Eye size={24} color={theme.colors.backdrop} />
                        )}
                    </View>
                    <View style={uiStyles.cardActionsBottomRight}>
                        <TouchableOpacity onPress={() => handleDeleteFriend(item.id)} style={uiStyles.cardActionButton}>
                            <Trash size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Friend Finder" titleStyle={styles.appBarTitle} />
                <Appbar.Action
                    icon={() => <Plus size={24} color={theme.colors.onPrimary} />}
                    onPress={() => setIsAddFriendModalVisible(true)}
                />
            </Appbar.Header>

            <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.paddingContainer,
                    { paddingBottom: 100 }
                ]}
                ListEmptyComponent={() => (
                    <View style={styles.emptyListContainer}>
                        <Text style={[styles.emptyListText, { color: theme.colors.onSurfaceVariant }]}>No friends added yet. Click '+' to add one!</Text>
                    </View>
                )}
            />

            <AddFriendModal
                visible={isAddFriendModalVisible}
                onClose={() => setIsAddFriendModalVisible(false)}
                onAddFriend={handleAddFriend}
            />
            {currentFriend && (
                <EditFriendModal
                    visible={isEditFriendModalVisible}
                    onClose={() => setIsEditFriendModalVisible(false)}
                    friend={currentFriend}
                    onSave={handleSaveEditedFriend}
                />
            )}
            <ZoomableImageViewerModal
                visible={isImageViewerVisible}
                onClose={() => setIsImageViewerVisible(false)}
                imageUri={selectedImageUri}
            />
        </View>
    );
};

const uiStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        borderRadius: 15,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    textInput: {
        marginBottom: 10,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    uploadRoutineButton: {
        borderRadius: 10,
        paddingVertical: 15,
    },
    uploadRoutineButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    friendCard: {
        marginBottom: 15,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    friendCardContent: {
        padding: 15,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardActionsTopRight: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
    },
    cardActionsRightCenter: {
        position: 'absolute',
        right: 15,
        top: '50%',
        transform: [{ translateY: -12 }],
        zIndex: 1,
    },
    cardActionsBottomRight: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        zIndex: 1,
    },
    cardActionButton: {
        marginLeft: 15,
    },
    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerHeader: {
        position: 'absolute',
        top: 0,
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 15,
        zIndex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeButton: {
        padding: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    smallBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 5,
    },
    courseBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10,
    },
    badgeText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default FriendsScreen;