import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Card, Title, Paragraph, useTheme, Button as PaperButton } from 'react-native-paper';
import styles from '../styles/styles'; // Import the centralized styles

const AdditionalScreen = () => {
    const theme = useTheme();

    const features = [
        { name: 'Hall of Fame', action: () => Alert.alert('Feature Coming Soon', 'Hall of Fame BracU') },
        { name: 'QR Code Scanner', action: () => Alert.alert('Feature Coming Soon', 'QR Code Scanner') },
        { name: 'Faculty Finder', action: () => Alert.alert('Feature Coming Soon', 'Find Where is your Faculty') },
        { name: 'Faculty Email Archive', action: () => Alert.alert('Feature Coming Soon', 'Faculty Email Archive') },
        { name: 'Bus Schedule', action: () => Alert.alert('Feature Coming Soon', 'Bus Schedule') },
        { name: 'Bus Routes', action: () => Alert.alert('Feature Coming Soon', 'BracU Bus Routes') },
        { name: 'Important Mails', action: () => Alert.alert('Feature Coming Soon', 'Important mails (OCA, Registrar, etc)') },
        { name: 'Club Showcase', action: () => Alert.alert('Feature Coming Soon', 'Club Showcase') },
        { name: 'HeatMap of BracU', action: () => Alert.alert('Feature Coming Soon', 'HeatMap of Bracu') },
        // { name: 'Khabar Dabar', action: () => Alert.alert('Feature Coming Soon', 'Khabar Dabar full list of items') },
        { name: 'Food Reviews', action: () => Alert.alert('Feature Coming Soon', 'Hangout spot and food item reviews') },
        { name: 'Course Reviews', action: () => Alert.alert('Feature Coming Soon', 'Courses Difficulty wise review and suggestions') },
        { name: 'Traffic Alert', action: () => Alert.alert('Feature Coming Soon', 'Alert when Heavy Traffic Near BracU') },
        { name: 'Mosque Location', action: () => Alert.alert('Feature Coming Soon', 'Mosque Location') },
        { name: 'Nearby Library', action: () => Alert.alert('Feature Coming Soon', 'Nearby Library') },
    ];

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Additional" titleStyle={styles.appBarTitle} />
            </Appbar.Header>

            <ScrollView style={styles.paddingContainer}>
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
        </View>
    );
};

export default AdditionalScreen;