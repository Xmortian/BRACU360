import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Image, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Trash2, ChevronLeft, ChevronRight, Bell, MapPin, User, PlusCircle, Image as ImageIcon, QrCode } from 'lucide-react-native';

import OcrScannerModal from './OcrScanner';
import ShareRoutineModal from './ShareRoutineModal'; // New component import
import styles from '../styles/styles';

const { width, height } = Dimensions.get('window');
const imageDir = FileSystem.documentDirectory + 'user_images/';

// New component for full-screen GIF display
const NoRoutineOrRestDayGif = ({ gifSource, isRestDay }) => (
    <View style={localStyles.gifContainer}>
        <Image
            source={gifSource}
            style={localStyles.gifImage}
        />
        {isRestDay && (
            <Text style={localStyles.restDayText}>
                Rest Day
            </Text>
        )}
    </View>
);

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
                loadImages();
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

const convert24to12hr = (time) => {
    if (!time) return 'N/A';
    let [hours, minutes] = time.split(/[^0-9]/).filter(Boolean);
    
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}`;
};

const HomeScreen = () => { 
    const theme = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [isOcrModalVisible, setIsOcrModalVisible] = useState(false);
    const [isShareModalVisible, setIsShareModalVisible] = useState(false); // New state for QR code modal
    const [scheduleData, setScheduleData] = useState([]);
    const [dailyRoutine, setDailyRoutine] = useState([]);
    const [gifPath, setGifPath] = useState(null);
    const [isRestDay, setIsRestDay] = useState(false);

    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const colors = ['#A7F3D0', '#FDE68A', '#BFDBFE', '#D1FAE5'];
    
    const getClassColor = (index) => {
        return colors[index % colors.length];
    };

    useEffect(() => {
        const selectedDay = dayMap[selectedDate.getDay()].substring(0, 3);
        const filteredClasses = scheduleData.filter(classItem => {
            if (!classItem.schedules) return false;
            return classItem.schedules.includes(selectedDay);
        });

        const uniqueClasses = filteredClasses.filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.courseName === item.courseName &&
                t.section === item.section &&
                t.schedules === item.schedules
            ))
        );
        
        const sortedClasses = uniqueClasses.sort((a, b) => {
            const getStartTime = (scheduleString) => {
                if (!scheduleString) return '00:00';
                const timePart = scheduleString.split(': ')[1];
                if (!timePart) return '00:00';
                return timePart.split('-')[0];
            };
            const aStartTime = getStartTime(a.schedules.split(' / ').find(s => s.startsWith(selectedDay)));
            const bStartTime = getStartTime(b.schedules.split(' / ').find(s => s.startsWith(selectedDay)));
            
            return aStartTime.localeCompare(bStartTime);
        });
        
        setDailyRoutine(sortedClasses);

        // Logic to show GIF based on routine status, using require()
        if (scheduleData.length === 0) {
            setGifPath(require('../assets/upload routine.gif'));
            setIsRestDay(false);
        } else if (sortedClasses.length === 0) {
            const restGifs = [
                require('../assets/rest.gif'),
                require('../assets/rest2.gif'),
                require('../assets/rest3.gif'),
                require('../assets/rest4.gif'),
            ];
            const randomGif = restGifs[Math.floor(Math.random() * restGifs.length)];
            setGifPath(randomGif);
            setIsRestDay(true);
        } else {
            setGifPath(null); // No GIF if there's a routine
            setIsRestDay(false);
        }
    }, [selectedDate, scheduleData]);

    const handleScheduleFound = (data) => {
        setScheduleData(data);
    };

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + direction);
        setSelectedDate(newDate);
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
                <Appbar.Action
                    icon={() => <ImageIcon size={24} color={theme.colors.onPrimary} />}
                    onPress={() => setIsImageViewerVisible(true)}
                />
                <Appbar.Action
                    icon={() => <QrCode size={24} color={theme.colors.onPrimary} />}
                    onPress={() => setIsShareModalVisible(true)}
                />
                <Appbar.Content title="Schedule" titleStyle={styles.appBarTitle} />
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
                    {selectedDate.getDate()} {getDayOfWeek(selectedDate)}, {getMonth(selectedDate)} {selectedDate.getFullYear()}
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
            
            {gifPath ? (
                <NoRoutineOrRestDayGif gifSource={gifPath} isRestDay={isRestDay} />
            ) : (
                <FlatList
                    data={dailyRoutine}
                    keyExtractor={(item, index) => `${item.courseName}-${item.section}-${index}`}
                    contentContainerStyle={styles.paddingContainer}
                    renderItem={({ item, index }) => {
                        const dailySchedule = item.schedules.split(' / ').find(schedule => 
                            schedule.startsWith(dayMap[selectedDate.getDay()].substring(0, 3))
                        );
                        
                        let startTime = 'N/A';
                        let endTime = 'N/A';
                        if (dailySchedule) {
                            const timeRange = dailySchedule.split(': ')[1];
                            [startTime, endTime] = timeRange.split('-');
                        }
                        const cardColor = getClassColor(index);

                        return (
                            <Card key={index} style={[styles.classCard, { backgroundColor: cardColor }]}>
                                <View style={styles.classCardContent}>
                                    <View style={styles.classCardTime}>
                                        <Text style={styles.classTimeText}>{convert24to12hr(startTime)}</Text>
                                        <Text style={styles.classTimeText}>{convert24to12hr(endTime)}</Text>
                                    </View>
                                    <View style={styles.classCardDetails}>
                                        <Title style={styles.classCourseTitle}>{item.courseName} - {item.section}</Title>
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
                        );
                    }}
                    ListEmptyComponent={() => (
                        <Text style={[styles.noClassesText, {color: theme.colors.onSurfaceVariant}]}>
                            Rest Day.
                        </Text>
                    )}
                />
            )}

            <ImageUploaderModal
                visible={isImageViewerVisible}
                onClose={() => setIsImageViewerVisible(false)}
            />
            <OcrScannerModal
                visible={isOcrModalVisible}
                onClose={() => setIsOcrModalVisible(false)}
                onScheduleFound={handleScheduleFound}
            />
            <ShareRoutineModal
                visible={isShareModalVisible}
                onClose={() => setIsShareModalVisible(false)}
                scheduleData={scheduleData}
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
    },
    gifContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: Dimensions.get('window').height * 0.09,
    },
    gifImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2.5,
        resizeMode: 'cover',
        borderRadius: 20,
        borderWidth: 5,
        borderColor: '#50E3C2',
    },
    restDayText: {
        position: 'absolute',
        bottom: '18%',
        color: 'white', // Changed to white for better visibility on the GIF
        fontSize: 28,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
});

export default HomeScreen;