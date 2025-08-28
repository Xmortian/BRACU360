import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, FlatList, Linking, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, TextInput, useTheme, List } from 'react-native-paper';
import { Plus, Trash, UploadCloud, Phone, ChevronDown, Edit3, Eye } from 'lucide-react-native';
import styles from '../styles/styles';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';

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

// --- Zoomable Image Viewer Modal Component ---
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

// --- Add Friend Modal Component ---
const AddFriendModal = ({ visible, onClose, onAddFriend }) => {
    const theme = useTheme();
    const [friendName, setFriendName] = useState('');
    const [friendContact, setFriendContact] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState('Summer 2025');
    const [isSemesterPickerVisible, setIsSemesterPickerVisible] = useState(false);

    const handleUploadRoutine = async () => {
        try {
            setIsUploading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                setSelectedImageUri(imageUri);
                Alert.alert('Image Selected', 'Routine image has been selected. It will be processed later.');
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to select the image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveFriend = () => {
        if (!friendName) {
            Alert.alert('Error', 'Please enter a friend\'s name.');
            return;
        }
        onAddFriend({
            id: Math.random().toString(),
            name: friendName,
            courses: 'Processing...',
            contact: friendContact || '',
            routineImageUri: selectedImageUri,
            semester: selectedSemester,
            status_data: { type: 'Processing...' }
        });
        setFriendName('');
        setFriendContact('');
        setSelectedImageUri(null);
        setSelectedSemester('Summer 2025');
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
                        <Text style={[uiStyles.modalTitle, { color: theme.colors.onSurface }]}>Add New Friend</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
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
                        
                        <TouchableOpacity
                            style={[uiStyles.uploadRoutineButton, { backgroundColor: theme.colors.primaryContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                            onPress={handleUploadRoutine}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator color={theme.colors.onPrimaryContainer} />
                            ) : (
                                <Text style={[uiStyles.uploadRoutineButtonText, { color: theme.colors.onPrimaryContainer }]}>
                                    {selectedImageUri ? 'Routine Selected' : 'Upload Routine'}
                                </Text>
                            )}
                        </TouchableOpacity>
                        
                        <PaperButton
                            mode="contained"
                            onPress={handleSaveFriend}
                            style={{ marginTop: 20 }}
                            labelStyle={{ color: theme.colors.onPrimary }}
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
        </Modal>
    );
};

// --- Edit Friend Modal Component ---
const EditFriendModal = ({ visible, onClose, friend, onSave }) => {
    const theme = useTheme();
    const [editedContact, setEditedContact] = useState(friend.contact);
    const [selectedSemester, setSelectedSemester] = useState(friend.semester);
    const [isSemesterPickerVisible, setIsSemesterPickerVisible] = useState(false);
    const [isReuploading, setIsReuploading] = useState(false);

    const handleReuploadRoutine = async () => {
        Alert.alert(
            'Reupload Routine',
            'Select a new routine image and semester.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async () => {
                         try {
                            setIsReuploading(true);
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                quality: 1,
                            });
                            if (!result.canceled) {
                                const newRoutineImageUri = result.assets[0].uri;
                                const newCourses = 'Processing...'; 
                                const newStatus = 'Processing...';
                                onSave({ ...friend, courses: newCourses, status: newStatus, routineImageUri: newRoutineImageUri, semester: selectedSemester });
                                Alert.alert('Success', 'New routine selected. It is being processed.');
                                onClose();
                            }
                        } catch (error) {
                            console.error('Error re-uploading image:', error);
                            Alert.alert('Error', 'Failed to re-upload routine.');
                        } finally {
                            setIsReuploading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleSave = () => {
        onSave({ ...friend, contact: editedContact, semester: selectedSemester });
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
        </Modal>
    );
};

// --- FriendsScreen Component ---
const FriendsScreen = () => {
    const theme = useTheme();
    const [friends, setFriends] = useState([
        { id: '1', name: 'Alice Smith', courses: 'MAT216, CSE230, PHY110', status: 'Off day', contact: '01234567890', semester: 'Summer 2025', routineImageUri: 'https://via.placeholder.com/300/00C853/FFFFFF?text=Routine+Alice' },
        { id: '2', name: 'Bob Johnson', courses: 'CSE470, EEE300', status: 'In a Class Gap(next class in 1 hour)', contact: '01234567891', semester: 'Fall 2024', routineImageUri: 'https://via.placeholder.com/300/FF5733/FFFFFF?text=Routine+Bob' },
        { id: '3', name: 'Charlie Brown', courses: 'CSE110, MAT120', status: 'First Class Begins at 2pm', contact: '01234567892', semester: 'Summer 2025', routineImageUri: '' },
        { id: '4', name: 'Diana Prince', courses: 'BBA101, ECO101', status: 'Last class finished at 5pm', contact: '', semester: 'Spring 2025', routineImageUri: '' },
        { id: '5', name: 'Emily White', courses: 'ENG101, LAW200', status: 'At Class in 9B-24L', contact: '', semester: 'Spring 2025', routineImageUri: '' },
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

    const renderFriendItem = ({ item }) => (
        <Card style={[uiStyles.friendCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={uiStyles.friendCardContent}>
                <View style={uiStyles.cardActionsTopRight}>
                    <TouchableOpacity onPress={() => handleEditFriend(item)} style={uiStyles.cardActionButton}>
                        <Edit3 size={24} color={theme.colors.onSurfaceVariant} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, marginRight: 60 }}>
                    <Title style={{ color: theme.colors.onSurface }}>{item.name}</Title>
                    <Paragraph style={{ color: '#00C853', fontWeight: 'bold' }}>
                        Semester Activated: {item.semester}
                    </Paragraph>
                    <Paragraph style={[styles.friendCourses, { color: theme.colors.onSurfaceVariant }]}>
                        Course this sem: {item.courses}
                    </Paragraph>
                    <Text style={[styles.friendStatus, { color: theme.colors.primary }]}>
                        Current Status: {item.status}
                    </Text>
                    {item.contact && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                            <Text style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
                                Contact: {item.contact}
                            </Text>
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)}>
                                <Phone size={20} color={theme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>
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
});

export default FriendsScreen;