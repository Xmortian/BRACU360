import React, { useState } from 'react'; // Import useState
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, FlatList } from 'react-native'; // Import FlatList
import { Appbar, Card, Title, Paragraph, useTheme, Button as PaperButton } from 'react-native-paper';
import styles from '../styles/styles';
// No longer importing QrScannerModal here as it's not directly related to this specific request,
// but ensure it's imported if you use it elsewhere.

const AdditionalScreen = () => {
    const theme = useTheme();
    const [showClubs, setShowClubs] = useState(false); // New state to control club list visibility

    // Data for the main features list.
    const features = [
        { name: 'Hall of Fame', action: () => Alert.alert('Feature Coming Soon', 'Hall of Fame BracU') },
        { name: 'Faculty Finder', action: () => Alert.alert('Feature Coming Soon', 'Find Where is your Faculty') },
        { name: 'Faculty Email Archive', action: () => Alert.alert('Feature Coming Soon', 'Faculty Email Archive') },
        { name: 'Bus Schedule', action: () => Alert.alert('Feature Coming Soon', 'Bus Schedule') },
        { name: 'Bus Routes', action: () => Alert.alert('Feature Coming Soon', 'BracU Bus Routes') },
        { name: 'Important Mails', action: () => Alert.alert('Feature Coming Soon', 'Important mails (OCA, Registrar, etc)') },
        // Modified action for Club Showcase to toggle showClubs state
        { name: 'Club Showcase', action: () => setShowClubs(prev => !prev) },
        { name: 'Food Reviews', action: () => Alert.alert('Feature Coming Soon', 'Hangout spot and food item reviews') },
        { name: 'Course Reviews', action: () => Alert.alert('Feature Coming Soon', 'Courses Difficulty wise review and suggestions') },
        { name: 'Traffic Alert', action: () => Alert.alert('Feature Coming Soon', 'Alert when Heavy Traffic Near BracU') },
        { name: 'Nearby Mosques', action: () => Alert.alert('Feature Coming Soon', 'Mosque Location') },
        { name: 'Nearby Libraries', action: () => Alert.alert('Feature Coming Soon', 'Nearby Library') },
    ];

    // Data array for all the clubs, defined directly in this component
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
            onPress={() => Alert.alert('Club Info', `${item} details coming soon`)} // Action when a club is pressed
        >
            <Text style={[styles.clubListItemText, { color: theme.colors.onSurface }]}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                <Appbar.Content title="Additional" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                <TouchableOpacity
                    onPress={() => Alert.alert('Feature Coming Soon', 'QR Code Scanner')} // Keep QR Scanner action as is
                    style={[styles.appBarRightAction, { backgroundColor: theme.colors.primary }]}
                >
                    <Text style={[styles.appBarActionText, { color: theme.colors.onPrimary }]}>QR Scanner</Text>
                </TouchableOpacity>
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.paddingContainer}>
                {/* Feature Grid */}
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
                                    <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>Coming soon</Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Conditional rendering of Club List */}
                {showClubs && (
                    <View>
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                            BRAC University Clubs
                        </Text>
                        <FlatList
                            data={clubs}
                            renderItem={renderClubItem}
                            keyExtractor={(item) => item}
                            scrollEnabled={false} // Disable FlatList's own scrolling as it's inside a ScrollView
                            contentContainerStyle={styles.clubListContainer}
                        />
                    </View>
                )}

                {/* Feedback / Petition Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                    Feedback
                </Text>
                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.onSurface }}>Petition System</Title>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                            Offer some feedback to the authorities or sign a petition for important reforms.
                            This is a placeholder for an upcoming feature.
                        </Paragraph>
                        <PaperButton
                            mode="contained"
                            onPress={() => Alert.alert('Feature Coming Soon', 'Petition system is under development.')}
                            style={{ marginTop: 15, backgroundColor: theme.colors.primary }}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Start a Petition
                        </PaperButton>
                    </Card.Content>
                </Card>
            </ScrollView>
            {/* If QrScannerModal is used elsewhere, ensure it's still rendered here or in App.js */}
            {/* <QrScannerModal ... /> */}
        </View>
    );
};

export default AdditionalScreen;