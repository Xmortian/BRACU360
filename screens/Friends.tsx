import React from 'react';
import { View, Text } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import styles from '../styles/styles'; // Import the centralized styles

const FriendsScreen = () => {
    const theme = useTheme();

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Friend Finder" titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <View style={styles.paddingContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Friend Finder - Coming Soon!
                </Text>
                <Text style={[styles.cardParagraph, { color: theme.colors.onSurfaceVariant }]}>
                    This section is under active development.
                </Text>
            </View>
        </View>
    );
};

export default FriendsScreen;