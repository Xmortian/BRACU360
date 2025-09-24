import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Image,
  Platform, StatusBar, Alert, Dimensions
} from 'react-native';
import {
  Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme, TextInput
} from 'react-native-paper';
import { Camera as CameraIcon, FileText, CalendarCheck, Calendar, ChevronDown, Plus, Trash, Check, X } from 'lucide-react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { CameraView, useCameraPermissions } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ImageViewing from 'react-native-image-viewing';
import * as Notifications from 'expo-notifications';

import styles from '../styles/styles';

const { width, height } = Dimensions.get('window');

// ----------------------
// Helpers: saving photos
// ----------------------
const ensureCourseDirAsync = async (courseName) => {
  const courseDir = `${FileSystem.documentDirectory}${encodeURIComponent(courseName)}`;
  const info = await FileSystem.getInfoAsync(courseDir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(courseDir, { intermediates: true });
  }
  return courseDir;
};

const savePhotoForCourseAsync = async (tempUri, courseName) => {
  // 1) Move into app folder per course
  const courseDir = await ensureCourseDirAsync(courseName);
  const fileName = `${Date.now()}.jpg`;
  const newPath = `${courseDir}/${fileName}`;
  await FileSystem.moveAsync({ from: tempUri, to: newPath });

  // 2) Also add to device Photos app + album named after course
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status === 'granted') {
    const asset = await MediaLibrary.createAssetAsync(newPath);
    let album = await MediaLibrary.getAlbumAsync(courseName);
    if (!album) {
      await MediaLibrary.createAlbumAsync(courseName, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
  }

  return newPath;
};

const listCoursePhotosAsync = async (courseName) => {
  const courseDir = `${FileSystem.documentDirectory}${encodeURIComponent(courseName)}`;
  const info = await FileSystem.getInfoAsync(courseDir);
  if (!info.exists) return [];
  const files = await FileSystem.readDirectoryAsync(courseDir);
  // newest first
  const uris = files
    .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.heic'))
    .sort((a, b) => (b.localeCompare(a)))
    .map(f => `${courseDir}/${f}`);
  return uris;
};

const deleteCoursePhotoAsync = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (e) {
    // swallow
  }
};

// ------------------------------------
// Custom Alert/Error Modal
// ------------------------------------
const CustomAlertModal = ({ visible, onClose, title, message }) => {
  const theme = useTheme();
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
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
            OK
          </PaperButton>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------
// Deadline Modal
// ----------------------
const DeadlineModal = ({ visible, onClose, courseId, onAddDeadline }) => {
  const theme = useTheme();
  const [deadlineName, setDeadlineName] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(new Date());
  const [reminderDays, setReminderDays] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const reminderOptions = [null, 0, 1, 2, 3, 4, 5, 6, 7];

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertModalVisible(true);
  };

  const scheduleDeadlineNotification = async (deadlineName, deadlineDate, reminderDays) => {
    if (reminderDays === null) return;
    const triggerDate = new Date(deadlineDate);
    if (reminderDays > 0) {
      triggerDate.setDate(triggerDate.getDate() - reminderDays);
    }

    if (triggerDate.getTime() > new Date().getTime()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Deadline Reminder!",
          body: `Your deadline for "${deadlineName}" is approaching on ${new Date(deadlineDate).toLocaleDateString()}.`,
        },
        trigger: {
          date: triggerDate,
        },
      });
      console.log(`Notification scheduled for ${deadlineName} on ${triggerDate.toDateString()}`);
    } else {
      console.log(`Notification for ${deadlineName} was not scheduled as the reminder date is in the past.`);
    }
  };

  const handleSave = async () => {
    if (!deadlineName) {
      showAlert('Error', 'Please enter a name for the deadline.');
      return;
    }
    if (!deadlineDate) {
      showAlert('Error', 'Please select a deadline date.');
      return;
    }
    await scheduleDeadlineNotification(deadlineName, deadlineDate, reminderDays);
    onAddDeadline(courseId, {
      id: Math.random().toString(),
      name: deadlineName,
      date: deadlineDate.toISOString(),
      reminderDays
    });
    setDeadlineName('');
    setDeadlineDate(new Date());
    setReminderDays(null);
    onClose();
  };

  const onDateConfirm = (params) => {
    setShowDatePicker(false);
    setDeadlineDate(params.date);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setDeadlineDate(selectedTime);
  };

  const getReminderText = (day) => {
    if (day === null) return 'No Reminder';
    if (day === 0) return 'Right at deadline';
    return `${day} day(s) before`;
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface, height: 'auto' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add New Deadline</Text>
            <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>
              Close
            </PaperButton>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
            <TextInput
              label="Deadline Name (e.g. Quiz 1)"
              value={deadlineName}
              onChangeText={setDeadlineName}
              style={styles.textInput}
              mode="outlined"
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>
              Deadline Date & Time
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={24} color={theme.colors.onSurfaceVariant} style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>
                  {deadlineDate ? deadlineDate.toDateString() : 'Select date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>
                  {deadlineDate ? deadlineDate.toLocaleTimeString() : 'Select time'}
                </Text>
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
              <DateTimePicker value={deadlineDate} mode="time" display="default" onChange={onTimeChange} />
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>
              Remind Me
            </Text>
            <TouchableOpacity
              onPress={() => setIsDropdownVisible(!isDropdownVisible)}
              style={[styles.dropdownButton, { borderColor: theme.colors.onSurfaceVariant }]}
            >
              <Text style={{ color: theme.colors.onSurface }}>{getReminderText(reminderDays)}</Text>
              <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {isDropdownVisible && (
              <View style={{ borderWidth: 1, borderColor: theme.colors.onSurfaceVariant, borderRadius: 8, marginTop: -15, marginBottom: 15 }}>
                {reminderOptions.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      setReminderDays(day);
                      setIsDropdownVisible(false);
                    }}
                    style={[styles.dropdownItem, { backgroundColor: reminderDays === day ? theme.colors.primaryContainer : 'transparent' }]}
                  >
                    <Text style={{ color: reminderDays === day ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>
                      {getReminderText(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <PaperButton mode="contained" onPress={handleSave} style={{ marginTop: 20, backgroundColor: theme.colors.primary }} labelStyle={{ color: theme.colors.onPrimary }}>
            Save Deadline
          </PaperButton>
        </View>
      </View>

      <CustomAlertModal visible={alertModalVisible} onClose={() => setAlertModalVisible(false)} title={alertTitle} message={alertMessage} />
    </Modal>
  );
};

// ----------------------
// Camera Modal w/ pinch
// ----------------------
const CameraModal = ({ visible, onClose, onCapture }) => {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [flash, setFlash] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    if (!permission) requestPermission();
    if (!mediaPermission) requestMediaPermission();
  }, [permission, mediaPermission]);

  const takePicture = async () => {
    try {
      if (cameraRef.current) {
        if (!mediaPermission?.granted) {
          Alert.alert("Permission Required", "To save photos to your device gallery, please grant media library permissions.");
          return;
        }

        const photo = await cameraRef.current.takePictureAsync();
        onCapture?.(photo.uri);
        setPhotoCount(prevCount => prevCount + 1);
      }
    } catch (e) {
      Alert.alert('Camera Error', e?.message ?? 'Failed to take picture');
    }
  };

const [baseZoom, setBaseZoom] = useState(0);

const pinchGesture = Gesture.Pinch()
  .onBegin(() => {
    setBaseZoom(zoom);
  })
  .onUpdate((event) => {
    const newZoom = baseZoom + (event.scale - 1) * 0.5;
    const clampedZoom = Math.max(0, Math.min(1, newZoom));
    setZoom(clampedZoom);
  });
  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={cameraStyles.centered}>
          <Text style={{ color: 'white', marginBottom: 8 }}>No camera access</Text>
          <TouchableOpacity onPress={requestPermission} style={cameraStyles.permissionButton}>
            <Text style={cameraStyles.permissionText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={[cameraStyles.permissionButton, { backgroundColor: '#444', marginTop: 10 }]}>
            <Text style={cameraStyles.permissionText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <GestureDetector gesture={pinchGesture}>
          <CameraView ref={cameraRef} style={{ flex: 1 }} flash={flash} zoom={zoom} />
        </GestureDetector>

        <View style={cameraStyles.topBar}>
          <TouchableOpacity onPress={onClose} style={[cameraStyles.iconButton, { backgroundColor: 'green', position: 'absolute', right: 16 }]}>
            <Ionicons name="checkmark" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFlash(flash === 'off' ? 'on' : 'off')} style={cameraStyles.iconButton}>
            <Ionicons name={flash === 'off' ? 'flash-off' : 'flash'} size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {photoCount > 0 && (
            <View style={{ position: 'absolute', top: 50, right: 100, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 }}>
                <Text style={{ color: 'white', fontSize: 16 }}>{photoCount} photo(s) taken</Text>
            </View>
        )}

        <View style={cameraStyles.bottomBar}>
<TouchableOpacity 
  onPress={() => setZoom((z) => Math.max(0, +(z - 0.1).toFixed(3)))} 
  onLongPress={() => {
    const interval = setInterval(() => {
      setZoom(z => Math.max(0, +(z - 0.05).toFixed(3)));
    }, 100);
    setTimeout(() => clearInterval(interval), 1000);
  }}
  style={cameraStyles.iconButton}
>
  <Ionicons name="remove" size={26} color="white" />
</TouchableOpacity>

{/* Add zoom level indicator */}
<View style={{ alignItems: 'center' }}>
  <TouchableOpacity onPress={takePicture} style={cameraStyles.captureOuter}>
    <View style={cameraStyles.captureInner} />
  </TouchableOpacity>
  <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
    {Math.round(zoom * 10)}x
  </Text>
</View>

<TouchableOpacity 
  onPress={() => setZoom((z) => Math.min(1, +(z + 0.1).toFixed(3)))} 
  onLongPress={() => {
    const interval = setInterval(() => {
      setZoom(z => Math.min(1, +(z + 0.05).toFixed(3)));
    }, 100);
    setTimeout(() => clearInterval(interval), 1000);
  }}
  style={cameraStyles.iconButton}
>
  <Ionicons name="add" size={26} color="white" />
</TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------
// Notes Modal (gallery)
// ----------------------
const NotesModal = ({ visible, onClose, courseName, onDeleteLocal }) => {
  const theme = useTheme();
  const [images, setImages] = useState([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const load = useCallback(async () => {
    if (!courseName) return;
    const uris = await listCoursePhotosAsync(courseName);
    setImages(uris);
  }, [courseName]);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const openViewerAt = (index) => {
    setCurrentIndex(index);
    setViewerVisible(true);
  };

  const removeAt = async (index) => {
    const uri = images[index];
    await deleteCoursePhotoAsync(uri);
    onDeleteLocal?.(uri);
    const uris = await listCoursePhotosAsync(courseName);
    setImages(uris);
  };

  const renderItem = ({ item, index }) => (
    <View style={{ margin: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' }}>
      <TouchableOpacity onPress={() => openViewerAt(index)}>
        <Image source={{ uri: item }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => removeAt(index)}
        style={{ position: 'absolute', top: 10, right: 10, backgroundColor: theme.colors.error, borderRadius: 20, padding: 6 }}
      >
        <Trash size={18} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
        <Appbar.Content title={`${courseName || 'Course'} Notes`} titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.onPrimary }}>
          Close
        </PaperButton>
      </Appbar.Header>

      {/* Conditionally render FlatList or ImageViewing */}
      {viewerVisible ? (
        <ImageViewing
          images={images.map((u) => ({ uri: u }))}
          imageIndex={currentIndex}
          visible={viewerVisible}
          onRequestClose={() => setViewerVisible(false)}
          doubleTapToZoomEnabled={true}
          swipeToCloseEnabled={true}
          onImageIndexChange={(index) => setCurrentIndex(index)}
        />
      ) : images.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>No notes saved for this course yet.</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </Modal>
  );
};

// ----------------------
// General Deadline Modal
// ----------------------
const GeneralDeadlineModal = ({ visible, onClose, onAddDeadline }) => {
  const theme = useTheme();
  const [deadlineName, setDeadlineName] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(new Date());
  const [reminderDays, setReminderDays] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const reminderOptions = [null, 0, 1, 2, 3, 4, 5, 6, 7];

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertModalVisible(true);
  };

  const scheduleDeadlineNotification = async (deadlineName, deadlineDate, reminderDays) => {
    if (reminderDays === null) return;
    const triggerDate = new Date(deadlineDate);
    if (reminderDays > 0) {
      triggerDate.setDate(triggerDate.getDate() - reminderDays);
    }
    if (triggerDate.getTime() > new Date().getTime()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming General Deadline!",
          body: `Your deadline for "${deadlineName}" is approaching on ${new Date(deadlineDate).toLocaleDateString()}.`,
        },
        trigger: {
          date: triggerDate,
        },
      });
      console.log(`General notification scheduled for ${deadlineName} on ${triggerDate.toDateString()}`);
    } else {
      console.log(`General notification for ${deadlineName} was not scheduled as the reminder date is in the past.`);
    }
  };

  const handleSave = async () => {
    if (!deadlineName) {
      showAlert('Error', 'Please enter a name for the deadline.');
      return;
    }
    if (!deadlineDate) {
      showAlert('Error', 'Please select a deadline date.');
      return;
    }
    await scheduleDeadlineNotification(deadlineName, deadlineDate, reminderDays);
    onAddDeadline({
      id: Math.random().toString(),
      name: deadlineName,
      date: deadlineDate.toISOString(),
      reminderDays
    });
    setDeadlineName('');
    setDeadlineDate(new Date());
    setReminderDays(null);
    onClose();
  };

  const onDateConfirm = (params) => {
    setShowDatePicker(false);
    setDeadlineDate(params.date);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setDeadlineDate(selectedTime);
  };

  const getReminderText = (day) => {
    if (day === null) return 'No Reminder';
    if (day === 0) return 'Right at deadline';
    return `${day} day(s) before`;
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface, height: 'auto' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add General Deadline</Text>
            <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>
              Close
            </PaperButton>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
            <TextInput
              label="Deadline Name (e.g. Internship Application)"
              value={deadlineName}
              onChangeText={setDeadlineName}
              style={styles.textInput}
              mode="outlined"
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>
              Deadline Date & Time
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={24} color={theme.colors.onSurfaceVariant} style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>{deadlineDate ? deadlineDate.toDateString() : 'Select date'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: theme.colors.onSurface }}>
                  {deadlineDate ? deadlineDate.toLocaleTimeString() : 'Select time'}
                </Text>
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
              <DateTimePicker value={deadlineDate} mode="time" display="default" onChange={onTimeChange} />
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, fontSize: 18, marginBottom: 10 }]}>Remind Me</Text>
            <TouchableOpacity
              onPress={() => setIsDropdownVisible(!isDropdownVisible)}
              style={[styles.dropdownButton, { borderColor: theme.colors.onSurfaceVariant }]}
            >
              <Text style={{ color: theme.colors.onSurface }}>{getReminderText(reminderDays)}</Text>
              <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {isDropdownVisible && (
              <View style={{ borderWidth: 1, borderColor: theme.colors.onSurfaceVariant, borderRadius: 8, marginTop: -15, marginBottom: 15 }}>
                {reminderOptions.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      setReminderDays(day);
                      setIsDropdownVisible(false);
                    }}
                    style={[styles.dropdownItem, { backgroundColor: reminderDays === day ? theme.colors.primaryContainer : 'transparent' }]}
                  >
                    <Text style={{ color: reminderDays === day ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>
                      {getReminderText(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <PaperButton mode="contained" onPress={handleSave} style={{ marginTop: 20, backgroundColor: theme.colors.primary }} labelStyle={{ color: theme.colors.onPrimary }}>
            Save Deadline
          </PaperButton>
        </View>
      </View>

      <CustomAlertModal visible={alertModalVisible} onClose={() => setAlertModalVisible(false)} title={alertTitle} message={alertMessage} />
    </Modal>
  );
};

// ----------------------
// Main Screen
// ----------------------
const CoursesScreen = ({ route }) => {
  const theme = useTheme();
  const [isDeadlineModalVisible, setIsDeadlineModalVisible] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allSemestersData, setAllSemestersData] = useState({
    'Dummy Semester': [
      { id: '1', courseName: 'Dummy Course 1', notes: [], deadlines: [] },
    ],
  });
  const [selectedSemester, setSelectedSemester] = useState('Dummy Semester');
  const [isSemesterDropdownVisible, setIsSemesterDropdownVisible] = useState(false);
  const [generalDeadlines, setGeneralDeadlines] = useState([]);
  const [isGeneralDeadlineModalVisible, setIsGeneralDeadlineModalVisible] = useState(false);

  // New function to process and merge courses
  const processCourses = (data) => {
    const uniqueCoursesMap = new Map();

    data.forEach(course => {
      const courseCodeWithoutL = course.courseName.toUpperCase().replace(/L$/, '');
      const courseId = courseCodeWithoutL + course.section;

      if (uniqueCoursesMap.has(courseId)) {
        // If the course already exists, merge it.
        // For simplicity, we'll keep the first one found but ensure the courseName is without 'L'
        const existingCourse = uniqueCoursesMap.get(courseId);
        existingCourse.courseName = courseCodeWithoutL;
      } else {
        // Add the new course, with the name simplified if needed
        const newCourse = {
          id: courseId,
          courseName: courseCodeWithoutL,
          notes: [],
          deadlines: [],
        };
        uniqueCoursesMap.set(courseId, newCourse);
      }
    });

    return Array.from(uniqueCoursesMap.values());
  };

  useEffect(() => {
    if (route.params?.scheduleData) {
      const processedCourses = processCourses(route.params.scheduleData);

      setAllSemestersData(prevData => ({
        ...prevData,
        'Current Semester': processedCourses,
      }));
      setSelectedSemester('Current Semester');
    }
  }, [route.params?.scheduleData]);

  const courses = allSemestersData[selectedSemester] || [];
  
  const handleAddGeneralDeadline = (deadlineData) => {
    setGeneralDeadlines((prev) => [...prev, deadlineData]);
  };

  const handleDeleteGeneralDeadline = (id) => {
    setGeneralDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddDeadline = (courseId, deadlineData) => {
    setAllSemestersData((prev) => ({
      ...prev,
      [selectedSemester]: prev[selectedSemester].map((c) => (c.id === courseId ? { ...c, deadlines: [...c.deadlines, deadlineData] } : c))
    }));
  };

  const handleCapture = async (tempUri) => {
    if (!selectedCourse?.courseName) return;
    const finalPath = await savePhotoForCourseAsync(tempUri, selectedCourse.courseName);
    setAllSemestersData((prev) => ({
      ...prev,
      [selectedSemester]: prev[selectedSemester].map((c) => (
        c.id === selectedCourse.id ? { ...c, notes: [finalPath, ...c.notes] } : c
      ))
    }));
  };

  const handleRemoveNote = async (uri) => {
    await deleteCoursePhotoAsync(uri);
    setAllSemestersData((prev) => ({
      ...prev,
      [selectedSemester]: prev[selectedSemester].map((c) => (
        c.id === selectedCourse.id ? { ...c, notes: c.notes.filter((u) => u !== uri) } : c
      )),
    }));
  };

  const openNotesModal = (course) => {
    setSelectedCourse(course);
    setIsNotesModalVisible(true);
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        Alert.alert('Permission Denied', 'You will not receive deadline notifications.');
        return;
    }
  };

  const calculateTimeLeft = (deadlineDate) => {
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diffInMs = deadline.getTime() - now.getTime();
    if (diffInMs <= 0) {
      return 'Passed';
    }

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    let timeLeftString = '';
    if (days > 0) {
      timeLeftString += `${days}d `;
    }
    if (hours > 0) {
      timeLeftString += `${hours}h `;
    }
    if (minutes > 0) {
      timeLeftString += `${minutes}m`;
    }

    return timeLeftString.trim() || 'Less than a minute';
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const handleMarkAsDone = (courseId, deadlineId) => {
    Notifications.cancelAllScheduledNotificationsAsync({ id: deadlineId });
    setAllSemestersData((prev) => ({
      ...prev,
      [selectedSemester]: prev[selectedSemester].map((c) => {
        if (c.id === courseId) {
          const updatedDeadlines = c.deadlines.map((d) =>
            d.id === deadlineId ? { ...d, status: 'Done' } : d
          );
          return { ...c, deadlines: updatedDeadlines };
        }
        return c;
      }),
    }));
  };

  const handleDeleteDeadline = (courseId, deadlineId) => {
    Notifications.cancelAllScheduledNotificationsAsync({ id: deadlineId });
    setAllSemestersData((prev) => ({
      ...prev,
      [selectedSemester]: prev[selectedSemester].map((c) => {
        if (c.id === courseId) {
          const updatedDeadlines = c.deadlines.filter((d) => d.id !== deadlineId);
          return { ...c, deadlines: updatedDeadlines };
        }
        return c;
      }),
    }));
  };
  
  const renderCourseItem = ({ item }) => (
    <Card style={[styles.courseCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12 }]}>
      <Card.Content>
        <Title style={{ color: theme.colors.onSurface, marginBottom: 5 }}>{item.courseName}</Title>

        {item.deadlines.length > 0 ? (
          item.deadlines.map((deadline) => (
            <View key={deadline.id} style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 10 }}>
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        fontWeight: 'bold',
                        textDecorationLine: deadline.status === 'Done' ? 'line-through' : 'none',
                      }}
                    >
                      {deadline.name}
                    </Text>
                  </ScrollView>
                  {deadline.status !== 'Done' && (
                    <Text style={{ color: calculateTimeLeft(deadline.date) === 'Passed' ? theme.colors.error : theme.colors.primary, marginLeft: 10, textDecorationLine: 'none' }}>
                      {calculateTimeLeft(deadline.date)}
                    </Text>
                  )}
                </View>
                <Text style={{ color: theme.colors.onSurfaceVariant, textDecorationLine: 'none' }}>
                  {new Date(deadline.date).toLocaleDateString()} {new Date(deadline.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                {deadline.status !== 'Done' && (
                  <TouchableOpacity onPress={() => handleMarkAsDone(item.id, deadline.id)} style={{ marginRight: 15 }}>
                    <Check size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDeleteDeadline(item.id, deadline.id)}>
                  <X size={24} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.paddingContainer, { paddingBottom: 100 }]}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity
              onPress={() => setIsSemesterDropdownVisible(true)}
              style={[
                styles.dropdownButton,
                { marginTop: 10, borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }
              ]}
            >
              <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>{selectedSemester}</Text>
              <ChevronDown size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>

            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>General Deadlines</Text>
              <TouchableOpacity onPress={() => setIsGeneralDeadlineModalVisible(true)}>
                <Plus size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {generalDeadlines.length > 0 ? (
              <Card style={[styles.courseCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12 }]}>
                <Card.Content>
                  {generalDeadlines.map((deadline) => (
                    <View key={deadline.id} style={{ marginBottom: 15 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 10 }}>
                          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text
                              style={{
                                color: theme.colors.onSurfaceVariant,
                                fontWeight: 'bold',
                                textDecorationLine: deadline.status === 'Done' ? 'line-through' : 'none',
                              }}
                            >
                              {deadline.name}
                            </Text>
                          </ScrollView>
                          {deadline.status !== 'Done' && (
                            <Text style={{ color: calculateTimeLeft(deadline.date) === 'Passed' ? theme.colors.error : theme.colors.primary, marginLeft: 10, textDecorationLine: 'none' }}>
                              {calculateTimeLeft(deadline.date)}
                            </Text>
                          )}
                        </View>
                        <Text style={{ color: theme.colors.onSurfaceVariant, textDecorationLine: 'none' }}>
                          {new Date(deadline.date).toLocaleDateString()} {new Date(deadline.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                        {deadline.status !== 'Done' && (
                          <TouchableOpacity onPress={() => setGeneralDeadlines(prev => prev.map(d => d.id === deadline.id ? { ...d, status: 'Done' } : d))} style={{ marginRight: 15 }}>
                            <Check size={24} color={theme.colors.primary} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleDeleteGeneralDeadline(deadline.id)}>
                          <X size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            ) : (
              <Card style={[styles.courseCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12 }]}>
                <Card.Content>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>No general deadlines added.</Text>
                </Card.Content>
              </Card>
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>My Courses</Text>
          </View>
        )}
      />

      <DeadlineModal
        visible={isDeadlineModalVisible}
        onClose={() => setIsDeadlineModalVisible(false)}
        courseId={selectedCourse?.id}
        onAddDeadline={handleAddDeadline}
      />

      <CameraModal
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onCapture={handleCapture}
      />

      <NotesModal
        visible={isNotesModalVisible}
        onClose={() => setIsNotesModalVisible(false)}
        courseName={selectedCourse?.courseName}
        onDeleteLocal={(uri) => handleRemoveNote(uri)}
      />

      <GeneralDeadlineModal
        visible={isGeneralDeadlineModalVisible}
        onClose={() => setIsGeneralDeadlineModalVisible(false)}
        onAddDeadline={handleAddGeneralDeadline}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isSemesterDropdownVisible}
        onRequestClose={() => setIsSemesterDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsSemesterDropdownVisible(false)}
        >
          <View style={[styles.semesterDropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
            {Object.keys(allSemestersData).map((semester) => (
              <TouchableOpacity
                key={semester}
                style={[
                  styles.dropdownItem,
                  { backgroundColor: selectedSemester === semester ? theme.colors.primaryContainer : 'transparent' }
                ]}
                onPress={() => {
                  setSelectedSemester(semester);
                  setIsSemesterDropdownVisible(false);
                }}
              >
                <Text style={{ color: selectedSemester === semester ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>
                  {semester}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CoursesScreen;

const cameraStyles = {
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'
  },
  permissionButton: {
    paddingVertical: 10, paddingHorizontal: 14, backgroundColor: 'dodgerblue', borderRadius: 8
  },
  permissionText: { color: 'white', fontSize: 16 },
  topBar: {
    position: 'absolute', top: 40, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  bottomBar: {
    position: 'absolute', bottom: 36, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'
  },
  iconButton: { padding: 10, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 28 },
  captureOuter: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'
  },
  captureInner: { width: 55, height: 55, borderRadius: 45, backgroundColor: '#0f0e0eff' },
};