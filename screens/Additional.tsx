import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, FlatList, TextInput } from 'react-native';
import { Appbar, Card, Title, Paragraph, useTheme, Button as PaperButton } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import styles from '../styles/styles';
// You need to import the QrScannerModal component
import QrScannerModal from './QrScannerModal';

const AdditionalScreen = () => {
    const theme = useTheme();
    const [showClubs, setShowClubs] = useState(false);
    const [showBusSchedule, setShowBusSchedule] = useState(false);
    const [isQrModalVisible, setIsQrModalVisible] = useState(false); // Add state for QR modal

    // Feedback form state
    const [feedbackName, setFeedbackName] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const features = [
        { name: 'Hall of Fame', action: () => Alert.alert('Feature Coming Soon', 'Hall of Fame BracU') },
        { name: 'Faculty Finder', action: () => Alert.alert('Feature Coming Soon', 'Find Where is your Faculty') },
        { name: 'Faculty Email Archive', action: () => Alert.alert('Feature Coming Soon', 'Faculty Email Archive') },
        { name: 'Bus Schedule', action: () => setShowBusSchedule(true) },
        { name: 'Important Mails', action: () => Alert.alert('Feature Coming Soon', 'Important mails (OCA, Registrar, etc)') },
        { name: 'Club Showcase', action: () => setShowClubs(prev => !prev) },
        { name: 'Food Reviews 👏👏', action: () => Alert.alert('Feature Coming Soon', 'Hangout spot and food item reviews') },
        { name: 'Course Reviews 👏👏', action: () => Alert.alert('Feature Coming Soon', 'Courses Difficulty wise review and suggestions') },
        { name: 'Traffic Alert', action: () => Alert.alert('Feature Coming Soon', 'Alert when Heavy Traffic Near BracU') },
        { name: 'Nearby Mosques', action: () => Alert.alert('Feature Coming Soon', 'Mosque Location') },
        { name: 'Nearby Libraries', action: () => Alert.alert('Feature Coming Soon', 'Nearby Library') },
    ];

    const clubs = [
        'Chess Club (BUCHC)', 'Community Service Club (BUCSC)', 'Adventure Club (BUAC)',
        'Art & Photography Society (BUAPS)', 'Cultural Club (BUCuC)', 'Debating Club (BUDC)',
        'Drama and Theater Forum (BUDTF)', 'Entrepreneurship Forum (BUEDF)', 'Film Club (BUFC)',
        'Response Team (BURT)', 'Association of Business Communicators (IABC)', 'MONON',
        'Leadership Development Forum (BULDF)', 'Communication & Language (BUCLC)',
        'BRAC University Research for Development Club (BURed)', 'Peace Café BRAC University (PCBU)',
        'Multicultural Club (BUMC)', 'Business & Economics Forum (BUBeF)',
        'Business Club (BIZBEE)', 'Finance and Accounting Club (FINACT)',
        'Computer Club (BUCC)', 'Economics Club (BUEC)', 'Electrical & Electronic Club (BUEEC)',
        'Law Society (BULC)', 'Marketing Association (BUMA)', 'Natural Science (BUNSC)',
        'Pharmacy Society (BUPS)', 'Robotics Club (ROBU)', 'Cricket Club (CBU)',
        'Football Club (FCBU)', 'Indoor Games Club (BUIGC)', 'Brac University History Club (BUHC)',
        'BRAC University Esports Club (BUESC)',
    ];

    const renderClubItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.clubListItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => Alert.alert('Club Info', `${item} details coming soon`)}
        >
            <Text style={[styles.clubListItemText, { color: theme.colors.onSurface }]}>
                {item}
            </Text>
        </TouchableOpacity>
    );
    
    // Function to handle QR code data
    const handleQrCodeScanned = (data) => {
        setIsQrModalVisible(false); // Close the modal after scanning
        Alert.alert('QR Code Scanned', `Data: ${data}`);
    };

    // Handle feedback form submission
    const handleFeedbackSubmit = async () => {
        if (!feedbackName.trim() || !feedbackMessage.trim()) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        setIsSubmitting(true);

        const formUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSedDi2tr4POY_PocTWMDbQcw9-Fd40AIBWlP5EeFmSi8ipskw/formResponse';
        const formData = new FormData();
        formData.append('entry.1258041428', feedbackName);
        formData.append('entry.1511754014', feedbackMessage);

        try {
            await fetch(formUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors',
            });
            Alert.alert('Thank you!', 'Your feedback has been submitted.');
            setFeedbackName('');
            setFeedbackMessage('');
        } catch (error) {
            Alert.alert('Error', 'There was a problem submitting your feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showBusSchedule) {
        return (
            <View style={{ flex: 1 }}>
                <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                    <Appbar.BackAction onPress={() => setShowBusSchedule(false)} color={theme.colors.onPrimary} />
                    <Appbar.Content title="Bus Schedule" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                </Appbar.Header>
                <WebView
                    source={{ uri: 'https://www.bracu.ac.bd/students-transport-service' }}
                    style={{ flex: 1 }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                <Appbar.Content title="Additional" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                <TouchableOpacity
                    onPress={() => setIsQrModalVisible(true)} // Open the QR scanner modal
                    style={[styles.appBarRightAction, { backgroundColor: theme.colors.primary }]}
                >
                    <Text style={[styles.appBarActionText, { color: theme.colors.onPrimary }]}>QR Scanner</Text>
                </TouchableOpacity>
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.paddingContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    All Features
                </Text>
                <View style={styles.webviewGrid}>
                    {features.map((feature, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.webviewCardWrapper}
                            onPress={feature.action}
                        >
                            <Card style={[styles.webviewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Card.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>{feature.name}</Title>
                                    <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>{feature.name === 'Bus Schedule' ? 'View website' : 'Coming soon'}</Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                {showClubs && (
                    <View>
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                            BRAC University Clubs
                        </Text>
                        <FlatList
                            data={clubs}
                            renderItem={renderClubItem}
                            keyExtractor={(item) => item}
                            scrollEnabled={false}
                            contentContainerStyle={styles.clubListContainer}
                        />
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                    Feedback
                </Text>
                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.onSurface }}>We value your feedback</Title>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant, marginBottom: 10 }}>
                            Share your thoughts or suggestions with us.
                        </Paragraph>

                        <TextInput
                            placeholder="ID (Optional)"
                            value={feedbackName}
                            onChangeText={setFeedbackName}
                            style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10 }}
                        />
                        <TextInput
                            placeholder="Feedback"
                            value={feedbackMessage}
                            onChangeText={setFeedbackMessage}
                            multiline
                            style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, height: 100 }}
                        />

                        <PaperButton
                            mode="contained"
                            onPress={handleFeedbackSubmit}
                            loading={isSubmitting}
                            style={{ marginTop: 15, backgroundColor: theme.colors.primary }}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Submit
                        </PaperButton>
                    </Card.Content>
                </Card>
            </ScrollView>
            
            {/* The QR Scanner Modal must be inside the main View */}
            <QrScannerModal
                visible={isQrModalVisible}
                onClose={() => setIsQrModalVisible(false)}
                onQrCodeScanned={handleQrCodeScanned}
            />
        </View>
    );
};

export default AdditionalScreen;