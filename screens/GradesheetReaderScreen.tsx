import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, StatusBar, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { ChevronLeft, Bell, ScanText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import styles from '../styles/styles';

const GradesheetScannerScreen = ({ navigation }) => {
    const theme = useTheme();
    const [imageUris, setImageUris] = useState([]);
    const [rawText, setRawText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gradesheetData, setGradesheetData] = useState([]);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [croppingImageUri, setCroppingImageUri] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [croppedUris, setCroppedUris] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

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
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Reverted line
                allowsMultipleSelection: true,
                selectionLimit: 7,
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                // Store original assets to loop through for cropping
                setSelectedImages(result.assets);
                setCroppedUris([]);
                setCurrentPage(0);
                if (result.assets.length > 0) {
                    cropNextImage(result.assets, []);
                }
            }
        } catch (error) {
            console.error('Error picking images:', error);
            showError('Failed to pick images. Please try again.');
        }
    };

    const cropNextImage = async (imagesToCrop, uris) => {
        if (imagesToCrop.length === 0) {
            // All images are cropped, set the final URIs
            setImageUris(uris);
            setRawText(null);
            setGradesheetData([]);
            return;
        }

        const currentImage = imagesToCrop[0];
        try {
            const cropped = await ImageCropPicker.openCropper({
                path: currentImage.uri,
                width: 0,  // Setting width and height to 0 often defaults to the full image size.
                height: 0, // This allows the user to select the entire image if needed.
                cropping: true,
                freeStyleCropEnabled: true, // Enables a customizable crop box
                cropperToolbarTitle: `Page ${currentPage + 1} of ${selectedImages.length}`,
            });g

            const newUris = [...uris, cropped.path];
            setCroppedUris(newUris);
            setCurrentPage(currentPage + 1);

            // Recursively call for the next image in the queue
            cropNextImage(imagesToCrop.slice(1), newUris);

        } catch (error) {
            // User cancelled cropping, so we stop the process
            console.log('Cropping cancelled or failed:', error);
            setImageUris(uris); // Set images cropped so far
            setCroppedUris(uris);
            setRawText(null);
            setGradesheetData([]);
        }
    };

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
    
    /**
     * Parses the raw text to extract structured gradesheet data into a table format.
     * @param {string} fullText - The full text content from the OCR.
     */
    const parseGradesheetData = (fullText) => {
        if (!fullText) return [];
        const lines = fullText.split('\n');
        const data = [];
        let currentCourse = null;

        // Regex to find Course Title and Code
        const courseRegex = /(Course|Subject):?\s*(.*?)\s*\((.*?)\)/i;
        // Regex to find grades
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
                currentCourse = null; // Reset for the next course
            }
        });
        
        return data;
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                <Appbar.Action
                    icon={() => <ChevronLeft size={24} color={theme.colors.onPrimary} />}
                    onPress={() => navigation.goBack()}
                />
                <Appbar.Content title="Gradesheet Scanner" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                <Appbar.Action
                    icon={() => <Bell size={24} color={theme.colors.onPrimary} />}
                    onPress={() => console.log('Show notifications')}
                />
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
    );
};

export default GradesheetScannerScreen;