import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useTheme } from 'react-native-paper';
import { QrCode, X } from 'lucide-react-native';
import { Linking, Alert } from 'react-native';

const QrScannerModal = ({ visible, onClose, onQrCodeScanned }) => {
    const theme = useTheme();
    const [hasPermission, setHasPermission] = useState(null);
    const [scannedData, setScannedData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const cameraStatus = await Camera.getCameraPermissionsAsync();
            setHasPermission(cameraStatus.status === 'granted');
        };

        if (visible) {
            getCameraPermissions();
            setScannedData(null); // Reset scanned data each time modal opens
            setIsScanning(true); // Start scanning when modal is visible
        }
    }, [visible]);

    const requestPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const handleBarCodeScanned = ({ type, data }) => {
        if (isScanning) {
            setIsScanning(false);
            setScannedData(data);

            // A simple check to see if the data looks like a URL
            const isUrl = data.startsWith('http://') || data.startsWith('https://');

            if (isUrl) {
                // If it's a URL, open it in the device's browser
                Linking.openURL(data).catch(err => {
                    Alert.alert('Error', `Could not open the link: ${err.message}`);
                });
            } else {
                // If it's not a URL, just display the text
                Alert.alert('QR Code Scanned', `The scanned data is: ${data}`);
            }

            // You can still call the parent's handler if needed
            onQrCodeScanned(data);
        }
    };

    const handleClose = () => {
        setIsScanning(false);
        setScannedData(null);
        onClose();
    };

    // UI based on permission state
    if (hasPermission === null) {
        return (
            <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
                <View style={[styles.permissionContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.permissionText, { color: theme.colors.onSurface }]}>
                        Requesting camera permission...
                    </Text>
                </View>
            </Modal>
        );
    }
    
    if (hasPermission === false) {
        return (
            <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
                <View style={[styles.permissionContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.permissionText, { color: theme.colors.onSurface }]}>
                        We need your permission to show the camera
                    </Text>
                    <TouchableOpacity onPress={requestPermission} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <X size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <View style={styles.container}>
                <CameraView
                    style={styles.camera}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
                >
                    <View style={styles.overlay}>
                        <View style={styles.qrCodeFrame} />
                        <Text style={styles.scanText}>Scan QR Code</Text>
                        {scannedData && (
                            <View style={[styles.dataContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text style={[styles.dataTitle, { color: theme.colors.primary }]}>QR Code Scanned!</Text>
                                <Text style={[styles.dataText, { color: theme.colors.onSurfaceVariant }]}>{scannedData}</Text>
                            </View>
                        )}
                    </View>
                </CameraView>
                <TouchableOpacity onPress={handleClose} style={[styles.closeModalButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.closeModalButtonText, { color: theme.colors.onPrimary }]}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(104, 6, 31, 0.22)',
        width: '100%',
        height: '100%',
    },
    qrCodeFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        backgroundColor: 'rgba(1, 235, 79, 0.11)',

        borderColor: 'white',
        borderRadius: 10,
    },
    scanText: {
        fontSize: 18,
        color: 'white',
        marginTop: 20,
    },
    dataContainer: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    dataTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dataText: {
        fontSize: 16,
        textAlign: 'center',
    },
    closeModalButton: {
        position: 'absolute',
        bottom: 20,
        padding: 15,
        borderRadius: 10,
    },
    closeModalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default QrScannerModal;