import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, FlatList, Linking } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, TextInput, useTheme } from 'react-native-paper';
import { Plus, Trash, UploadCloud, Bell, Phone } from 'lucide-react-native';
import styles from '../styles/styles';

// --- Add Friend Modal Component ---
const AddFriendModal = ({ visible, onClose, onAddFriend }) => {
    const theme = useTheme();
    const [friendName, setFriendName] = useState('');
    const [friendCourses, setFriendCourses] = useState('');
    const [friendStatus, setFriendStatus] = useState('');
    const [friendContact, setFriendContact] = useState(''); // New state for contact number

    const handleSaveFriend = () => {
        if (!friendName) {
            Alert.alert('Error', 'Please enter a friend\'s name.');
            return;
        }
        onAddFriend({
            id: Math.random().toString(),
            name: friendName,
            courses: friendCourses || 'Upload or Scan Friends Routine to see courses',
            status: friendStatus || 'Upload or Scan Friends Routine to check status',
            contact: friendContact || '', 
        });
        setFriendName('');
        setFriendCourses('');
        setFriendStatus('');
        setFriendContact(''); // Clear the contact state
        onClose();
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
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add New Friend</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView contentContainerStyle={styles.addFriendModalContent}>
                        <TextInput
                            label="Friend's Name"
                            value={friendName}
                            onChangeText={setFriendName}
                            style={styles.textInput}
                            mode="outlined"
                        />
                        <TextInput
                            label="Friend's Contact" // New TextInput for the contact number
                            value={friendContact}
                            onChangeText={setFriendContact}
                            style={styles.textInput}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        <TouchableOpacity
                            style={[styles.uploadRoutineButton, { backgroundColor: theme.colors.primaryContainer }]}
                            onPress={() => Alert.alert('Upload Routine', 'Placeholder for routine upload functionality (e.g., OCR).')}
                        >
                            <Text style={[styles.uploadRoutineButtonText, { color: theme.colors.onPrimaryContainer }]}>
                                Upload Routine
                            </Text>
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
        </Modal>
    );
};

// --- FriendsScreen Component ---
const FriendsScreen = () => {
    const theme = useTheme();
    const [friends, setFriends] = useState([
        { id: '1', name: 'Alice Smith', a: 'summer Routine Active', courses: 'PL1, DM, Psych', status: 'In Uni', contact: '01234567890' },
        { id: '2', name: 'Bob Johnson', courses: 'OOP, DM', status: 'At home', contact: '01234567891' },
        { id: '3', name: 'Charlie Brown', courses: 'PL1, Discrete Math', status: 'In class', contact: '01234567892' },
        { id: '4', name: 'Diana Prince', courses: 'OOP, Psych', status: 'Free', contact: '' },
    ]);
    const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);

    const handleAddFriend = (newFriend) => {
        setFriends(prevFriends => [...prevFriends, newFriend]);
    };

    const handleDeleteFriend = (id) => {
        Alert.alert(
            "Delete Friend",
            "Are you sure you want to delete this friend?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
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

    const handleReuploadRoutine = (friendName) => {
        Alert.alert(
            "Reupload Routine",
            `This feature will allow you to reupload the routine for ${friendName}.`
        );
        // This is where you would open a modal for reuploading
    };

    const renderFriendItem = ({ item }) => (
        <Card style={[styles.friendCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12 }]}>
            <Card.Content style={styles.friendCardActions}>
                <View style={{ flex: 1 }}>
                    <Title style={{ color: theme.colors.onSurface }}>{item.name}</Title>
                    <Paragraph style={[styles.friendCourses, { color: theme.colors.onSurfaceVariant }]}>
                        Courses: {item.courses}
                    </Paragraph>
                    <Text style={[styles.friendStatus, { color: theme.colors.primary }]}>
                        Status: {item.status}
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
                
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleReuploadRoutine(item.name)} style={styles.cardActionButton}>
                        <UploadCloud size={24} color={theme.colors.onSurfaceVariant} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteFriend(item.id)} style={styles.cardActionButton}>
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
        </View>
    );
};

export default FriendsScreen;