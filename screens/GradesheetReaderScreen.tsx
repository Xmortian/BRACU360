import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StatusBar, ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { ChevronLeft, FileText, CircleX } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import styles from '../styles/styles';

const GradesheetScannerModal = ({ visible, onClose, onScanComplete }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [rawText, setRawText] = useState(null);
    const [parsedGradesheet, setParsedGradesheet] = useState(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(20);
    const [coldStartMessage, setColdStartMessage] = useState('Waiting for server...');

    const API_ENDPOINT = "https://bracu360-backend-python.onrender.com/api/read_pdf";

    const showError = (message) => {
        setErrorMessage(message);
        setErrorModalVisible(true);
    };

    useEffect(() => {
        let timer;
        if (loading) {
            setCountdown(20);
            setColdStartMessage('Waiting for server...');
            timer = setInterval(() => {
                setCountdown(prevCount => {
                    if (prevCount === 1) {
                        clearInterval(timer);
                        setColdStartMessage('Analyzing Information.');
                        return 0;
                    }
                    return prevCount - 1;
                });
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [loading]);

    const handleScan = async () => {
        try {
            setRawText(null);
            setParsedGradesheet(null);
            setLoading(true);

            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pdfUri = result.assets[0].uri;
                const pdfName = result.assets[0].name;
                const pdfMimeType = result.assets[0].mimeType;

                const formData = new FormData();
                formData.append('file', {
                    uri: pdfUri,
                    name: pdfName,
                    type: pdfMimeType,
                });

                try {
                    const response = await fetch(API_ENDPOINT, {
                        method: 'POST',
                        body: formData,
                    });

                    const serverResponseText = await response.text();
                    
                    if (response.ok) {
                        let extractedText = serverResponseText;
                        try {
                            const data = JSON.parse(serverResponseText);
                            extractedText = data.text;
                        } catch (e) {
                            console.log("Response was not JSON, using raw text.");
                        }

                        if (!extractedText || extractedText.trim().length === 0) {
                            Alert.alert(
                                "Processing Error",
                                "The server returned an empty or unreadable response.",
                                [{ text: "OK" }]
                            );
                        } else {
                            setRawText(extractedText);
                            const parsedData = parseGradesheetData(extractedText);
                            setParsedGradesheet(parsedData);
                            if (onScanComplete) onScanComplete(parsedData); 

                            console.log("Parsed Gradesheet Data:", JSON.stringify(parsedData, null, 2));
                        }
                    } else {
                        showError(`Server Error: ${serverResponseText || 'An unexpected error occurred.'}`);
                    }
                    
                    setLoading(false);

                } catch (networkError) {
                    console.error('Network or server error:', networkError);
                    showError("Failed to connect to the server. Please check your internet connection.");
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error during document pick:', error);
            showError('Failed to select file. Please try again.');
            setLoading(false);
        }
    };

    const parseGradesheetData = (fullText) => {
        if (!fullText) return {};

        const data = {
            studentId: '',
            name: '',
            program: '',
            semesters: [],
        };

        const studentIdRegex = /Student ID\s*:\s*(\d+)/;
        const nameRegex = /Name\s*:\s*(.*)/;
        const programStartRegex = /PROGRAM:\s*(.*)/;
        const programEndRegex = /Course No|Course Title/; // Stop condition for program title
        
        // Extract basic info
        const studentIdMatch = fullText.match(studentIdRegex);
        if (studentIdMatch) data.studentId = studentIdMatch[1].trim();

        const nameMatch = fullText.match(nameRegex);
        if (nameMatch) data.name = nameMatch[1].trim();
        
        // --- NEW LOGIC FOR PROGRAM NAME ---
        const programStartIndex = fullText.search(programStartRegex);
        const programEndIndex = fullText.search(programEndRegex);

        if (programStartIndex !== -1 && programEndIndex !== -1) {
            const programBlock = fullText.substring(programStartIndex, programEndIndex);
            const programLines = programBlock.split('\n');
            let programName = '';
            for (const line of programLines) {
                if (line.match(programStartRegex)) {
                    programName += line.match(programStartRegex)[1].trim();
                } else if (line.trim().length > 0) {
                    programName += ' ' + line.trim();
                }
            }
            data.program = programName.trim();
        }

        const semesterBlocks = fullText.split(/SEMESTER:/g).slice(1);
        
        semesterBlocks.forEach(block => {
            const semesterRegex = /(FALL|SPRING|SUMMER)\s*(20\d{2})/;
            const semesterMatch = block.match(semesterRegex);
            
            if (semesterMatch) {
                const semesterName = semesterMatch[0].trim();
                const semester = {
                    name: semesterName,
                    courses: [],
                    gpa: '',
                    cumulativeCgpa: '',
                };
                
                const lines = block.split('\n');
                let courseCode = null, courseTitle = '', credits = null, grade = null, gradePoints = null;
                
                lines.forEach(line => {
                    const courseCodeRegex = /(CSE|ENG|MAT|PHY|BNG|EMB|HUM|BUS|STA|POL)\s?\d{3}/;
                    const creditRegex = /(\d+\.\d{2})/;
                    const gradeRegex = /([A-Z-][+]*\s*\(?.*?\)?)/;
                    
                    if (line.match(courseCodeRegex)) {
                        courseCode = line.match(courseCodeRegex)[0].replace(/\s/g, '');
                        courseTitle = '';
                        credits = null;
                        grade = null;
                        gradePoints = null;
                    } else if (courseCode && line.match(creditRegex) && credits === null) {
                        credits = parseFloat(line.match(creditRegex)[0]);
                    } else if (courseCode && line.match(gradeRegex) && grade === null) {
                        grade = line.match(gradeRegex)[0];
                    } else if (courseCode && line.match(creditRegex) && gradePoints === null) {
                        gradePoints = parseFloat(line.match(creditRegex)[0]);
                        
                        const isNonCredit = (credits === 0.00 || grade === 'P');
                        
                        semester.courses.push({
                            courseCode,
                            courseTitle,
                            credits,
                            grade,
                            gradePoints,
                            isNonCredit,
                        });
                        courseCode = null;
                    } else if (courseCode && !credits && !grade && !gradePoints) {
                        courseTitle += line.trim() + ' ';
                    }
                });

                const gpaRegex = /GPA\s+(\d+\.\d{2})/;
                const gpaMatch = block.match(gpaRegex);
                if (gpaMatch) semester.gpa = gpaMatch[1];
                
                const cgpaRegex = /CGPA\s+(\d+\.\d{2})/;
                const cgpaMatch = block.match(cgpaRegex);
                if (cgpaMatch) semester.cumulativeCgpa = cgpaMatch[1];

                data.semesters.push(semester);
            }
        });

        return data;
    };

    const renderSemester = ({ item }) => (
        <Card style={[modalStyles.semesterCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <Card.Content>
                <Title style={[modalStyles.semesterTitle, { color: theme.colors.onSurface }]}>{item.name}</Title>
                <View style={[modalStyles.tableHeader, { backgroundColor: theme.colors.background }]}>
                    <Text style={[modalStyles.courseColumn, modalStyles.tableHeaderText, { color: theme.colors.onSurface }]}>Course</Text>
                    <Text style={[modalStyles.gradeColumn, modalStyles.tableHeaderText, { color: theme.colors.onSurface }]}>Credit</Text>
                    <Text style={[modalStyles.gradeColumn, modalStyles.tableHeaderText, { color: theme.colors.onSurface }]}>GPA</Text>
                </View>
                {item.courses.map((course, index) => (
                    <View key={index} style={[modalStyles.tableRow, modalStyles.courseRow]}>
                        <Text style={[modalStyles.courseColumn, { color: theme.colors.onSurface }]}>{course.courseCode}</Text>
                        <Text style={[modalStyles.gradeColumn, { color: theme.colors.onSurface }]}>{course.credits.toFixed(2)}</Text>
                        <Text style={[modalStyles.gradeColumn, { color: theme.colors.onSurface }]}>{course.gradePoints.toFixed(2)}</Text>
                    </View>
                ))}
                <View style={modalStyles.summaryContainer}>
                    <Text style={[modalStyles.summaryText, { color: theme.colors.onSurface }]}>
                        Semester GPA: <Text style={{ fontWeight: 'bold' }}>{item.gpa}</Text>
                    </Text>
                    <Text style={[modalStyles.summaryText, { color: theme.colors.onSurface }]}>
                        Cumulative CGPA: <Text style={{ fontWeight: 'bold' }}>{item.cumulativeCgpa}</Text>
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    const renderHeader = () => (
        <View style={styles.resultsContainer}>
            <View style={styles.parsedSection}>
                <Title style={[styles.ocrSectionTitle, { color: theme.colors.onSurface }]}>Student Information</Title>
                <View style={[modalStyles.infoContainer, { borderColor: theme.colors.outlineVariant }]}>
                    <Text style={[modalStyles.infoText, { color: theme.colors.onSurface }]}>
                        <Text style={{ fontWeight: 'bold' }}>Name:</Text> {parsedGradesheet.name}
                    </Text>
                    <Text style={[modalStyles.infoText, { color: theme.colors.onSurface }]}>
                        <Text style={{ fontWeight: 'bold' }}>ID:</Text> {parsedGradesheet.studentId}
                    </Text>
                    <Text style={[modalStyles.infoText, { color: theme.colors.onSurface }]}>
                        <Text style={{ fontWeight: 'bold' }}>Program:</Text> {parsedGradesheet.program}
                    </Text>
                </View>
                <Title style={[styles.ocrSectionTitle, { color: theme.colors.onSurface }]}>Semester Results</Title>
            </View>
        </View>
    );

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

                <View style={styles.paddingContainer}>
                    <Card style={styles.mainCard}>
                        <Card.Content>
                            <View style={styles.scanContainer}>
                                <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Gradesheet Scanner</Title>
                                <Paragraph style={[styles.cardParagraph, { color: theme.colors.onSurfaceVariant }]}>
                                    Select your gradesheet PDF to extract the details.
                                </Paragraph>

                                <PaperButton
                                    mode="contained"
                                    onPress={handleScan}
                                    disabled={loading}
                                    style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                                    labelStyle={[styles.scanButtonLabel, { color: theme.colors.onPrimary }]}
                                    icon={() => <FileText size={20} color={theme.colors.onPrimary} />}
                                >
                                    Scan Gradesheet
                                </PaperButton>
                            </View>

                            {loading && (
                                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.outlineVariant }]}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                                        {countdown > 0 ? `Starting Server... Time remaining: ${countdown}s` : coldStartMessage}
                                    </Text>
                                </View>
                            )}

                            {!loading && parsedGradesheet && (
                                <FlatList
                                    data={parsedGradesheet.semesters}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={renderSemester}
                                    ListHeaderComponent={renderHeader}
                                />
                            )}

                            {!loading && !parsedGradesheet && rawText && (
                                <View style={styles.rawSection}>
                                    <Title style={[styles.ocrSectionTitle, { color: theme.colors.onSurface }]}>Raw PDF Text (Parsing Failed)</Title>
                                    <View style={[modalStyles.rawTextContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.outlineVariant }]}>
                                        <Text style={[modalStyles.rawTextOutput, { color: theme.colors.onSurface }]}>{rawText}</Text>
                                    </View>
                                    <View style={modalStyles.noResultsContainer}>
                                        <CircleX size={50} color={theme.colors.error} />
                                        <Text style={[modalStyles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
                                            No gradesheet data was found in the text.
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                </View>

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
    semesterCard: {
        marginBottom: 16,
    },
    semesterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#f5f5f5',
    },
    tableHeaderText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    courseColumn: {
        flex: 3,
        textAlign: 'left',
        paddingLeft: 10,
    },
    gradeColumn: {
        flex: 1,
        textAlign: 'center',
    },
    courseRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    summaryContainer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryText: {
        fontSize: 16,
    },
    infoContainer: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    infoText: {
        fontSize: 16,
    },
    rawSection: {
        marginTop: 20,
    },
    ocrSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    rawTextContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        height: 200,
    },
    rawTextOutput: {
        fontSize: 12,
        color: '#555',
    },
    noResultsContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    noResultsText: {
        marginTop: 10,
        textAlign: 'center',
    },
});

export default GradesheetScannerModal;