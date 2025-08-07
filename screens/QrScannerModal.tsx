import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button } from 'react-native';
import { Camera } from 'expo-camera';

export default function TestModal({ visible, onClose }) {
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    if (visible && (!permission || permission.status !== 'granted')) {
      requestPermission();
    }
  }, [visible]);

  if (!permission?.granted) {
    return <View><Text>No camera permission</Text></View>;
  }

  return (
    <Modal visible={visible} animationType="slide">
      <Camera style={{ flex: 1 }} onBarCodeScanned={() => {}} />
      <Button title="Close" onPress={onClose} />
    </Modal>
  );
}
