import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Image, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import styles from '../styles/styles';
import ImageViewer from 'react-native-image-zoom-viewer';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Trash2 } from 'lucide-react-native';

import OcrScannerModal from './OcrScanner';
import {
    ChevronLeft,
    ChevronRight,
    BookText,
    ClipboardList,
    Bell,
    MapPin,
    User,
    PlusCircle,
    Image as ImageIcon,
} from 'lucide-react-native';

const imageDir = FileSystem.documentDirectory + 'user_images/';

// New modal component for image uploading and viewing
function ImageUploaderModal({ visible, onClose }) {
    const [images, setImages] = useState([]);
    const [isFullScreenViewerVisible, setIsFullScreenViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadImages = async () => {
        try {
            const dirInfo = await FileSystem.getInfoAsync(imageDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
            }
            const files = await FileSystem.readDirectoryAsync(imageDir);
            const imageUris = files.map(file => ({ url: imageDir + file, name: file }));
            setImages(imageUris);
        } catch (err) {
            console.error(err.message, err.code);
        }
    };

    const handleUpload = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please grant permission to access your photo library.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const sourceUri = result.assets[0].uri;
            const fileName = sourceUri.split('/').pop();
            const destinationPath = `${imageDir}${fileName}`;

            try {
                await FileSystem.copyAsync({
                    from: sourceUri,
                    to: destinationPath,
                });
                Alert.alert('Success', 'Image saved successfully!');
                loadImages(); // Reload images to include the new one
            } catch (err) {
                console.error('Error saving image: ', err.message);
                Alert.alert('Error', 'Failed to save image.');
            }
        }
    };
    
    const handleDeleteImage = async (fileName) => {
        const filePath = imageDir + fileName;
        try {
            await FileSystem.deleteAsync(filePath);
            Alert.alert('Success', 'Image deleted successfully!');
            loadImages();
        } catch (err) {
            console.error('Error deleting image: ', err.message);
            Alert.alert('Error', 'Failed to delete image.');
        }
    };

    useEffect(() => {
        if (visible) {
            loadImages();
        }
    }, [visible]);

    const renderThumbnail = ({ item, index }) => (
        <TouchableOpacity
            style={localStyles.thumbnailContainer}
            onPress={() => {
                setCurrentImageIndex(index);
                setIsFullScreenViewerVisible(true);
            }}
        >
            <Image source={{ uri: item.url }} style={localStyles.thumbnail} />
            <TouchableOpacity 
                style={localStyles.deleteIcon} 
                onPress={() => handleDeleteImage(item.name)}
            >
                <Trash2 size={18} color="red" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={localStyles.modalHeader}>
                    <Text style={localStyles.modalTitle}>Quick Access Gallery</Text>
                    <Text style={localStyles.modalSubtitle}>Store important images (eg. ID ).</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={localStyles.closeButton}
                    >
                        <Text style={localStyles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={images}
                    renderItem={renderThumbnail}
                    keyExtractor={(item) => item.name}
                    numColumns={3}
                    contentContainerStyle={localStyles.thumbnailList}
                />

                <TouchableOpacity
                    onPress={handleUpload}
                    style={localStyles.uploadButton}
                >
                    <Text style={localStyles.uploadButtonText}>Upload Image</Text>
                </TouchableOpacity>
            </View>

            {isFullScreenViewerVisible && (
                <Modal visible={true} transparent={true}>
                    <ImageViewer
                        imageUrls={images}
                        enableSwipeDown
                        onSwipeDown={() => setIsFullScreenViewerVisible(false)}
                        backgroundColor="black"
                        renderIndicator={() => null}
                        index={currentImageIndex}
                        onChange={(index) => setCurrentImageIndex(index)}
                    />
                </Modal>
            )}
        </Modal>
    );
}

function RoutineOverviewModal({ visible, onClose }) {
    const theme = useTheme();
    const routineOverviewContent = ` ADD Your Routine `;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Routine Overview</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView style={styles.modalContentScroll}>
                        <Text style={[styles.yearPlannerText, { color: theme.colors.onSurfaceVariant }]}>
                            {routineOverviewContent}
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// --- HomeScreen Component ---
const HomeScreen = () => { 
    const theme = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [isRoutineOverviewVisible, setIsRoutineOverviewVisible] = useState(false);
    const [isOcrModalVisible, setIsOcrModalVisible] = useState(false);

    const routineData = [
        { id: '1', timeStart: '9:30', timeEnd: '11:00', course: 'Computer Science', room: '9G-32C', faculty: 'KSD', color: '#A7F3D0' },
        { id: '2', timeStart: '11:00', timeEnd: '12:30', course: 'Digital Marketing', room: '8F-12C', faculty: 'STV', color: '#FDE68A' },
        { id: '3', timeStart: '2:00', timeEnd: '3:30', course: 'Digital Marketing', room: '12H-36C', faculty: 'ANY', color: '#BFDBFE' },
        { id: '4', timeStart: '3:30', timeEnd: '5:00', course: 'Introduction to Psychology', room: '8G-19C', faculty: 'LLY', color: '#D1FAE5' },
    ];

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + direction);
        setSelectedDate(newDate);
        Alert.alert("Date Changed", `Now showing routine for ${newDate.toDateString()}`);
    };

    const getDayOfWeek = (date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };

    const getMonth = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[date.getMonth()];
    };

    const renderDaySelector = () => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = -2; i <= 4; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const isSelected = date.toDateString() === selectedDate.toDateString();

            days.push(
                <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                        styles.daySelectorItem,
                        isSelected && styles.daySelectorItemSelected,
                        { backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
                    ]}
                    onPress={() => setSelectedDate(date)}
                >
                    <Text style={[styles.daySelectorText, isSelected && { color: theme.colors.onPrimaryContainer }]}>
                        {getDayOfWeek(date)}
                    </Text>
                    <Text style={[styles.daySelectorDate, isSelected && { color: theme.colors.onPrimaryContainer }]}>
                        {date.getDate()}
                    </Text>
                </TouchableOpacity>
            );
        }
        return days;
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                {/* Left side actions */}
                <Appbar.Action
                    icon={() => <ImageIcon size={24} color={theme.colors.onPrimary} />}
                    onPress={() => setIsImageViewerVisible(true)}
                />
                <Appbar.Action
                    icon={() => <ClipboardList size={24} color={theme.colors.onPrimary} />}
                    onPress={() => setIsRoutineOverviewVisible(true)}
                />

                <Appbar.Content title="Schedule" titleStyle={styles.appBarTitle} />

                {/* Right side actions */}
                <Appbar.Action
                    icon={() => <Bell size={24} color={theme.colors.onPrimary} />}
                    onPress={() => Alert.alert('Notifications', 'Coming Soon!')}
                />
                <Appbar.Action
                    icon={() => <PlusCircle size={24} color={'#50E3C2'} />}
                    onPress={() => setIsOcrModalVisible(true)}
                />

            </Appbar.Header>

            <View style={styles.routineHeader}>
                <TouchableOpacity onPress={() => navigateDate(-1)}>
                    <ChevronLeft size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.routineDateText, { color: theme.colors.onSurface }]}>
                    {selectedDate.getDate()} {getDayOfWeek(selectedDate)}, {getMonth(selectedDate)}{selectedDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => navigateDate(1)}>
                    <ChevronRight size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelectorScroll}>
                <View style={styles.daySelectorContainer}>
                    {renderDaySelector()}
                </View>
            </ScrollView>

            <ScrollView style={styles.routineListScroll}>
                <View style={styles.paddingContainer}>
                    {routineData.map((item) => (
                        <Card key={item.id} style={[styles.classCard, { backgroundColor: item.color }]}>
                            <View style={styles.classCardContent}>
                                <View style={styles.classCardTime}>
                                    <Text style={styles.classTimeText}>{item.timeStart}</Text>
                                    <Text style={styles.classTimeText}>{item.timeEnd}</Text>
                                </View>
                                <View style={styles.classCardDetails}>
                                    <Title style={styles.classCourseTitle}>{item.course}</Title>
                                    <View style={styles.classInfoRow}>
                                        <MapPin size={16} color="#444" />
                                        <Text style={styles.classInfoText}>{item.room}</Text>
                                    </View>
                                    <View style={styles.classInfoRow}>
                                        <User size={16} color="#444" />
                                        <Text style={styles.classInfoText}>{item.faculty}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.classBellIcon}>
                                    <Bell size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))}
                </View>
            </ScrollView>

            {/* Modals */}
            <ImageUploaderModal
                visible={isImageViewerVisible}
                onClose={() => setIsImageViewerVisible(false)}
            />
            <RoutineOverviewModal
                visible={isRoutineOverviewVisible}
                onClose={() => setIsRoutineOverviewVisible(false)}
            />
            <OcrScannerModal
                visible={isOcrModalVisible}
                onClose={() => setIsOcrModalVisible(false)}
            />

        </View>
    );
};

const localStyles = StyleSheet.create({
    modalHeader: {
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 8,
        borderRadius: 4,
        zIndex: 99,
    },
    closeButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    uploadButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: 'steelblue',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 3,
        zIndex: 99,
    },
    uploadButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    thumbnailList: {
        justifyContent: 'flex-start',
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    thumbnailContainer: {
        width: Dimensions.get('window').width / 2.2,
        height: Dimensions.get('window').width / 2.2,
        margin: 5,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    deleteIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 3,
        zIndex: 10,
    }
});

export default HomeScreen;