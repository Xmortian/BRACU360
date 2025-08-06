import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Linking, Modal, Dimensions, StatusBar } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Appbar, useTheme } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';
import styles from '../styles/styles'; // Ensure this points to your styles.js

const QrScannerModal = ({ visible, onClose, onScanSuccess }) => {
  const theme = useTheme();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  // Request permissions when the component mounts or visibility changes
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    if (visible) {
      requestPermissions();
      setScanned(false); // Reset scanned state when modal becomes visible
      setScannedData(null); // Clear previous scanned data
    }
  }, [visible]); // Re-run when 'visible' prop changes

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
    onScanSuccess(data); // Pass data back to parent
    // Do NOT call onClose() here immediately, let user see the data or choose to close/rescan
  };

  const renderScannerContent = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      );
    }
    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionErrorText}>No access to camera. Please grant permission in settings.</Text>
          <Button
            title="Open App Settings"
            onPress={() => Linking.openSettings()}
          />
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject} // Ensures scanner covers the full area
        />
        <Appbar.Header style={styles.modalAppbar}>
          <Appbar.Action
            icon={() => <ChevronLeft size={24} color={'white'} />}
            onPress={onClose} // Close button
          />
        </Appbar.Header>
        {/* Visual overlay for scanning area (does not block scanner) */}
        <View style={styles.scanOverlay}>
          <View style={styles.scanOverlayInner} />
        </View>
        {scanned && (
          <View style={styles.scannedDataOverlay}>
            <Text style={styles.scannedDataTitle}>Scanned Data:</Text>
            <Text style={styles.scannedDataText}>{scannedData}</Text>
            <View style={styles.scannedDataButtons}>
              <Button title="Scan Again" onPress={() => setScanned(false)} />
              <Button title="Close Scanner" onPress={onClose} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
        {renderScannerContent()}
      </View>
    </Modal>
  );
};

export default QrScannerModal;