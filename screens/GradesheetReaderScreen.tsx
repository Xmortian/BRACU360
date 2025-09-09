import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, StatusBar, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { ChevronLeft, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system'; // Expo FileSystem is crucial for reading local files
import styles from '../styles/styles';

const GradesheetScannerModal = ({ visible, onClose }) => {
    const theme = useTheme();
    const [pdfUri, setPdfUri] = useState(null);
    const [rawText, setRawText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gradesheetData, setGradesheetData] = useState([]);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const showError = (message) => {
        setErrorMessage(message);
        setErrorModalVisible(true);
    };

    const pickPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true, // This is important for accessing the file later
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedPdf = result.assets[0];
                setPdfUri(selectedPdf.uri);
                setRawText(null);
                setGradesheetData([]);
                
                // Immediately start processing the PDF
                await processPdf(selectedPdf.uri);
            }
        } catch (error) {
            console.error('Error picking PDF:', error);
            showError('Failed to pick PDF. Please try again.');
        }
    };
    
    // This is the core logic change.
    const processPdf = async (uri) => {
        setLoading(true);
        setRawText(null);
        setGradesheetData([]);

        try {
            // Read the content of the PDF file as a string.
            // This is possible for machine-readable PDFs.
            const fileContent = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            
            setRawText(fileContent);
            
            // Now, parse the text to extract gradesheet data.
            const parsedData = parseGradesheetData(fileContent);
            setGradesheetData(parsedData);

        } catch (error) {
            console.error('Error processing PDF:', error);
            showError(`Failed to process PDF: ${error.message}. Is the PDF machine-readable?`);
            setRawText(`Failed to read PDF with error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // The parsing logic remains the same, as it's just processing the text.
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
                </Appbar.Header>

                <ScrollView contentContainerStyle={styles.paddingContainer}>
                    <Card style={styles.mainCard}>
                        <Card.Content>
                            <View style={styles.scanContainer}>
                                <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                                    Gradesheet Scanner
                                </Title>
                                <Paragraph style={[styles.cardParagraph, { color: theme.colors.onSurfaceVariant }]}>
                                    Select a machine-readable PDF gradesheet to extract the details.
                                </Paragraph>

                                <PaperButton
                                    mode="contained"
                                    onPress={pickPdf}
                                    disabled={loading}
                                    style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                                    labelStyle={[styles.scanButtonLabel, { color: theme.colors.onPrimary }]}
                                    icon={() => <FileText size={20} color={theme.colors.onPrimary} />}
                                >
                                    Pick PDF
                                </PaperButton>
                            </View>

                            {/* PDF preview section (optional) */}
                            {pdfUri && (
                                <View style={modalStyles.pdfPreviewContainer}>
                                    <Text style={[modalStyles.pdfNameText, { color: theme.colors.onSurface }]}>
                                        Selected PDF: {pdfUri.split('/').pop()}
                                    </Text>
                                    {/* You could add a PDF viewer component here, but this is sufficient for now */}
                                </View>
                            )}

                            {loading && (
                                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.outlineVariant }]}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>Reading PDF...</Text>
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
                                            <Title style={[styles.ocrSectionTitle, { color: theme.colors.onSurface }]}>Raw PDF Text</Title>
                                            <View style={[styles.rawTextContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.outlineVariant }]}>
                                                <Text style={[styles.rawTextOutput, { color: theme.colors.onSurface }]}>{rawText}</Text>
                                            </View>
                                        </View>
                                    )}
                                    {pdfUri && gradesheetData.length === 0 && rawText && (
                                        <Text style={[styles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
                                            No gradesheet data was found in the PDF. The file may not match the expected format.
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

const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    pdfPreviewContainer: {
        marginTop: 16,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    pdfNameText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default GradesheetScannerModal;