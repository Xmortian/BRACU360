import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, StatusBar, ActivityIndicator, Image, TouchableOpacity, Alert, FlatList, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { Plus, Edit, Trash, Bell, ChevronLeft, ScanText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import styles from '../styles/styles';

const GradesheetScannerModal = ({ visible, onClose }) => {
    const theme = useTheme();
    const [imageUris, setImageUris] = useState([]);
    const [rawText, setRawText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gradesheetData, setGradesheetData] = useState([]);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState([]); // This state is now the source of truth for total images
    
    // showError function remains the same
    const showError = (message) => {
        setErrorMessage(message);
        setErrorModalVisible(true);
    };

    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showError('Permission to access media library is required to pick images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: 7,
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                // Set selectedImages and then immediately start the cropping process
                setSelectedImages(result.assets);
                setImageUris([]);
                if (result.assets.length > 0) {
                    cropNextImage(result.assets, 0, result.assets.length, []);
                }
            }
        } catch (error) {
            console.error('Error picking images:', error);
            showError('Failed to pick images. Please try again.');
        }
    };

    // Updated cropNextImage to pass index and total count
    const cropNextImage = async (imagesToCrop, currentImageIndex, totalImages, uris) => {
        if (imagesToCrop.length === 0) {
            setImageUris(uris);
            setRawText(null);
            setGradesheetData([]);
            return;
        }

        const currentImage = imagesToCrop[0];
        try {
            const cropped = await ImageCropPicker.openCropper({
                path: currentImage.uri,
                width: 0,
                height: 0,
                cropping: true,
                freeStyleCropEnabled: true,
                cropperToolbarTitle: `Page ${currentImageIndex + 1} of ${totalImages}`, // 👈 Fixed counter logic
            });

            const newUris = [...uris, cropped.path];
            cropNextImage(imagesToCrop.slice(1), currentImageIndex + 1, totalImages, newUris);
        } catch (error) {
            console.log('Cropping cancelled or failed:', error);
            setImageUris(uris);
            setRawText(null);
            setGradesheetData([]);
        }
    };
    
    // performOcrOnImages and handleDone remain the same
    const performOcrOnImages = async (uris) => {
        setLoading(true);
        setRawText(null);
        setGradesheetData([]);

        try {
            const allExtractedText = [];
            for (const uri of uris) {
                const textResult = await TextRecognition.recognize(uri);
                allExtractedText.push(textResult.text);
            }
            
            const combinedText = allExtractedText.join('\n\n');
            setRawText(combinedText);
            
            const parsedData = parseGradesheetData(combinedText);
            setGradesheetData(parsedData);

        } catch (error) {
            console.error('Error performing OCR:', error);
            showError(`Failed to perform OCR on images: ${error.message}`);
            setRawText(`OCR failed with error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDone = async () => {
        if (imageUris.length === 0) {
            showError('Please select and crop at least one image.');
            return;
        }
        await performOcrOnImages(imageUris);
    };
    
    // parseGradesheetData remains the same
    const parseGradesheetData = (fullText) => {
        if (!fullText) return [];
        const lines = fullText.split('\n');
        const data = [];
        let currentCourse = null;

        const courseRegex = /(Course|Subject):?\s*(.*?)\s*\((.*?)\)/i;
        const gradeRegex = /Midterm:\s*(\d+(\.\d+)?)\s*Final:\s*(\d+(\.\d+)?)\s*Grade:\s*([A-Z-][+])?/i;
        
        lines.forEach(line => {
            const courseMatch = line.match(courseRegex);
            const gradeMatch = line.match(gradeRegex);
            
            if (courseMatch) {
                currentCourse = {
                    courseTitle: courseMatch[2].trim(),
                    courseCode: courseMatch[3].trim(),
                    midterm: '-',
                    final: '-',
                    grade: '-',
                };
            } else if (gradeMatch && currentCourse) {
                currentCourse.midterm = gradeMatch[1] || '-';
                currentCourse.final = gradeMatch[3] || '-';
                currentCourse.grade = gradeMatch[5] || '-';
                data.push(currentCourse);
                currentCourse = null;
            }
        });
        
        return data;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[modalStyles.modalContainer, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
                <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                    <Appbar.Action
                        icon={() => <ChevronLeft size={24} color={theme.colors.onPrimary} />}
                        onPress={onClose}
                    />
                    <Appbar.Content title="Gradesheet Scanner" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                    {/* The notification icon has been removed as requested. */}
                </Appbar.Header>

                <ScrollView contentContainerStyle={styles.paddingContainer}>
                    <Card style={styles.mainCard}>
                        <Card.Content>
                            <View style={styles.scanContainer}>
                                <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                                    Gradesheet Scanner
                                </Title>
                                <Paragraph style={[styles.cardParagraph, { color: theme.colors.onSurfaceVariant }]}>
                                    Pick up to 7 photos of your gradesheet to extract the details.
                                </Paragraph>

                                <PaperButton
                                    mode="contained"
                                    onPress={pickImages}
                                    disabled={loading}
                                    style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                                    labelStyle={[styles.scanButtonLabel, { color: theme.colors.onPrimary }]}
                                    icon={() => <ScanText size={20} color={theme.colors.onPrimary} />}
                                >
                                    Pick Images from Gallery
                                </PaperButton>
                            </View>

                            {imageUris.length > 0 && (
                                <View style={[styles.imagePreviewContainer, { borderColor: theme.colors.outlineVariant }]}>
                                    <ScrollView horizontal contentContainerStyle={styles.imagePreviewScroll} showsHorizontalScrollIndicator={false}>
                                        {imageUris.map((uri, index) => (
                                            <Image key={index} source={{ uri }} style={styles.imagePreview} resizeMode="cover" />
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                            
                            {imageUris.length > 0 && (
                                <PaperButton
                                    mode="contained"
                                    onPress={handleDone}
                                    disabled={loading}
                                    style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                                    labelStyle={[styles.scanButtonLabel, { color: theme.colors.onPrimary }]}
                                >
                                    {loading ? "Scanning..." : "Done"}
                                </PaperButton>
                            )}

                            {loading && (
                                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.outlineVariant }]}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>Scanning {imageUris.length} images...</Text>
                                </View>
                            )}

                            {!loading && (
                                <View style={styles.resultsContainer}>
                                    {gradesheetData.length > 0 && (
                                        <View style={styles.parsedSection}>
                                            <Title style={[styles.ocrSectionTitle, { color: theme.colors.onSurface }]}>Parsed Gradesheet Data</Title>
                                            <View style={[styles.tableContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                                                <View style={[styles.tableHeader, { backgroundColor: theme.colors.background }]}>
                                                    <Text style={[styles.courseColumn, styles.tableHeaderText, { color: theme.colors.onSurface }]}>Course</Text>
                                                    <Text style={[styles.gradeColumn, styles.tableHeaderText, { color: theme.colors.onSurface }]}>Midterm</Text>
                                                    <Text style={[styles.gradeColumn, styles.tableHeaderText, { color: theme.colors.onSurface }]}>Final</Text>
                                                    <Text style={[styles.gradeColumn, styles.tableHeaderText, { color: theme.colors.onSurface }]}>Grade</Text>
                                                </View>
                                                <ScrollView>
                                                    {gradesheetData.map((item, index) => (
                                                        <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                                                            <Text style={[styles.courseColumn, { color: theme.colors.onSurface }]}>{item.courseTitle} ({item.courseCode})</Text>
                                                            <Text style={[styles.gradeColumn, { color: theme.colors.onSurface }]}>{item.midterm}</Text>
                                                            <Text style={[styles.gradeColumn, { color: theme.colors.onSurface }]}>{item.final}</Text>
                                                            <Text style={[styles.gradeColumn, { color: theme.colors.onSurface }]}>{item.grade}</Text>
                                                        </View>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        </View>
                                    )}
                                    {rawText && (
                                        <View style={styles.rawSection}>
                                            <Title style={[styles.ocrSectionTitle, { color: theme.colors.onSurface }]}>Raw OCR Text</Title>
                                            <View style={[styles.rawTextContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.outlineVariant }]}>
                                                <Text style={[styles.rawTextOutput, { color: theme.colors.onSurface }]}>{rawText}</Text>
                                            </View>
                                        </View>
                                    )}
                                    {imageUris.length > 0 && gradesheetData.length === 0 && rawText && (
                                        <Text style={[styles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
                                            No gradesheet data was found in the images.
                                        </Text>
                                    )}
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                </ScrollView>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={errorModalVisible}
                    onRequestClose={() => setErrorModalVisible(false)}
                >
                    <View style={styles.centeredView}>
                        <View style={[styles.modalView, { backgroundColor: theme.colors.surface, borderColor: theme.colors.error }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.error }]}>Error</Text>
                            <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>{errorMessage}</Text>
                            <PaperButton
                                mode="contained"
                                onPress={() => setErrorModalVisible(false)}
                                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                                labelStyle={[styles.modalButtonLabel, { color: theme.colors.onError }]}
                            >
                                Close
                            </PaperButton>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

// New styles for the modal overlay and container
const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
});

export default GradesheetScannerModal;