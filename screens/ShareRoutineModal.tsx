import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from 'react-native-paper';

const ShareRoutineModal = ({ visible, onClose, scheduleData }) => {
    const theme = useTheme();

    if (!scheduleData || scheduleData.length === 0) {
        return (
            <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
                <View style={[modalStyles.container, { backgroundColor: theme.colors.background }]}>
                    <Text style={[modalStyles.title, { color: theme.colors.onSurface }]}>Share Routine</Text>
                    <Text style={[modalStyles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                        No routine data to share. Please upload your routine first.
                    </Text>
                    <TouchableOpacity onPress={onClose} style={[modalStyles.closeButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={modalStyles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
    const simplifiedData = scheduleData.map(item => ({
        courseName: item.courseName,
        section: item.section
    }));

    const qrData = JSON.stringify(simplifiedData);

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={[modalStyles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={[modalStyles.title, { color: theme.colors.onSurface }]}>Share Your Routine</Text>
                <Text style={[modalStyles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Scan this QR code to import this routine.
                </Text>
                <View style={modalStyles.qrCodeContainer}>
                    <QRCode
                        value={qrData}
                        size={250}
                        color={theme.colors.onSurface}
                        backgroundColor={theme.colors.surfaceVariant}
                    />
                </View>
                <TouchableOpacity onPress={onClose} style={[modalStyles.closeButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={modalStyles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    qrCodeContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    closeButton: {
        marginTop: 30,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ShareRoutineModal;