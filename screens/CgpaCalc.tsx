import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, FlatList, Modal, StyleSheet, TextInput } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { Plus, Edit, Trash } from 'lucide-react-native';
import styles from '../styles/styles';

const CgpaCalcModal = ({ visible, onClose }) => {
    const theme = useTheme();
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [gradeInput, setGradeInput] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Initial dummy data to simulate a gradesheet.
    // This state will be reset on modal close, fulfilling the requirement.
    const [grades, setGrades] = useState([
        { id: '1', courseName: 'CSE250', credits: 3, grade: 3.0, semester: 'Spring 2023' },
        { id: '2', courseName: 'CSE111', credits: 3, grade: 3.7, semester: 'Summer 2022' },
        { id: '3', courseName: 'CSE220', credits: 3, grade: 3.3, semester: 'Fall 2022' },
        { id: '4', courseName: 'MAT110', credits: 3, grade: 4.0, semester: 'Spring 2022' },
        { id: '5', courseName: 'ENG101', credits: 3, grade: 3.5, semester: 'Spring 2022' },
        { id: '6', courseName: 'CSE110', credits: 3, grade: 4.0, semester: 'Spring 2022' },
        { id: '7', courseName: 'EEE101', credits: 3, grade: 3.0, semester: 'Fall 2022' },
        { id: '8', courseName: 'HUM101', credits: 3, grade: 4.0, semester: 'Fall 2022' },
        { id: '9', courseName: 'CSE221', credits: 3, grade: 4.0, semester: 'Fall 2022' },
        { id: '10', courseName: 'PHY111', credits: 3, grade: 4.0, semester: 'Spring 2023' },
    ]);

    // Calculate CGPA based on the current 'grades' state
    const calculateCGPA = (currentGrades) => {
        if (currentGrades.length === 0) {
            return 0;
        }
        const totalCredits = currentGrades.reduce((sum, course) => sum + course.credits, 0);
        const totalGradePoints = currentGrades.reduce((sum, course) => sum + (course.credits * course.grade), 0);
        return (totalGradePoints / totalCredits).toFixed(2);
    };

    // Calculate what-if scenarios
    const calculateScenario = (gradeOverride) => {
        const scenarioGrades = grades.map(course => ({
            ...course,
            grade: gradeOverride(course),
        }));
        return calculateCGPA(scenarioGrades);
    };

    const calculateCurrentCGPA = () => calculateCGPA(grades);
    const calculateMaxCGPA = () => calculateScenario(() => 4.0);
    const calculateCGPAwithTenAs = () => calculateScenario((course) => (course.id === '1' || course.id === '2' || course.id === '3' || course.id === '4' || course.id === '5' || course.id === '6' || course.id === '7' || course.id === '8' || course.id === '9' || course.id === '10') ? 4.0 : course.grade);
    const calculateCGPAwithTenAMinus = () => calculateScenario((course) => (course.id === '1' || course.id === '2' || course.id === '3' || course.id === '4' || course.id === '5' || course.id === '6' || course.id === '7' || course.id === '8' || course.id === '9' || course.id === '10') ? 3.7 : course.grade);
    const calculateCGPAwithFiveAandFiveAMinus = () => calculateScenario((course) => {
        const aCourses = ['1', '2', '3', '4', '5'];
        const aMinusCourses = ['6', '7', '8', '9', '10'];
        if (aCourses.includes(course.id)) return 4.0;
        if (aMinusCourses.includes(course.id)) return 3.7;
        return course.grade;
    });

    const handleEditGrade = (course) => {
        // Set the course ID and current grade in state for the input
        setGradeInput({ [course.id]: course.grade.toString() });
        setIsEditing(true);
    };

    const handleSaveGrade = (courseId) => {
        const newGrade = parseFloat(gradeInput[courseId]);
        if (!isNaN(newGrade) && newGrade >= 0 && newGrade <= 4.0) {
            setGrades(prevGrades =>
                prevGrades.map(course =>
                    course.id === courseId ? { ...course, grade: newGrade } : course
                )
            );
        } else {
            Alert.alert("Invalid Grade", "Please enter a valid grade between 0.0 and 4.0.");
        }
        setIsEditing(false);
        setGradeInput({});
    };

    const handleRemoveCourse = (courseId) => {
        Alert.alert(
            "Remove Course",
            "Are you sure you want to remove this course?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    onPress: () => {
                        const newGrades = grades.filter(course => course.id !== courseId);
                        setGrades(newGrades);
                        Alert.alert("Success", "Course removed. CGPA updated.");
                    },
                    style: "destructive",
                },
            ]
        );
    };
    
    // Reset state when modal is closed to revert to default
    const handleCloseModal = () => {
        setGrades([
            { id: '1', courseName: 'CSE250', credits: 3, grade: 3.0, semester: 'Spring 2023' },
            { id: '2', courseName: 'CSE111', credits: 3, grade: 3.7, semester: 'Summer 2022' },
            { id: '3', courseName: 'CSE220', credits: 3, grade: 3.3, semester: 'Fall 2022' },
            { id: '4', courseName: 'MAT110', credits: 3, grade: 4.0, semester: 'Spring 2022' },
            { id: '5', courseName: 'ENG101', credits: 3, grade: 3.5, semester: 'Spring 2022' },
            { id: '6', courseName: 'CSE110', credits: 3, grade: 4.0, semester: 'Spring 2022' },
            { id: '7', courseName: 'EEE101', credits: 3, grade: 3.0, semester: 'Fall 2022' },
            { id: '8', courseName: 'HUM101', credits: 3, grade: 4.0, semester: 'Fall 2022' },
            { id: '9', courseName: 'CSE221', credits: 3, grade: 4.0, semester: 'Fall 2022' },
            { id: '10', courseName: 'PHY111', credits: 3, grade: 4.0, semester: 'Spring 2023' },
        ]);
        setShowAdvancedSettings(false);
        onClose();
    };

    const renderCourseCard = ({ item }) => (
        <Card style={[styles.courseCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12 }]}>
            <Card.Content style={modalStyles.courseCardContent}>
                <View style={modalStyles.courseDetails}>
                    <Title style={{ color: theme.colors.onSurface, marginBottom: 2 }}>{item.courseName}</Title>
                    <Text style={[styles.courseGrade, { color: theme.colors.onSurfaceVariant }]}>
                        Credits: {item.credits}
                    </Text>
                </View>
                <View style={modalStyles.gradeContainer}>
                    {isEditing && gradeInput[item.id] !== undefined ? (
                        <TextInput
                            style={[modalStyles.gradeInput, { color: theme.colors.onSurface, borderColor: theme.colors.primary }]}
                            onChangeText={(text) => setGradeInput({ [item.id]: text })}
                            value={gradeInput[item.id]}
                            keyboardType="numeric"
                            maxLength={4}
                            autoFocus={true}
                            onBlur={() => handleSaveGrade(item.id)}
                            onSubmitEditing={() => handleSaveGrade(item.id)}
                        />
                    ) : (
                        <Text style={[modalStyles.gradeValue, { color: theme.colors.primary }]}>
                            {item.grade.toFixed(2)}
                        </Text>
                    )}
                </View>
                <View style={modalStyles.courseActions}>
                    <TouchableOpacity onPress={() => handleEditGrade(item)} style={styles.courseActionButton}>
                        <Edit size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveCourse(item.id)} style={styles.courseActionButton}>
                        <Trash size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>
            </Card.Content>
        </Card>
    );

    const renderHeader = () => (
        <View>
            {/* Current and What-If CGPA Display */}
            <Card style={[styles.cgpaCard, { backgroundColor: theme.colors.surface, marginBottom: 20 }]}>
                <Card.Content style={styles.cgpaDetails}>
                    <Title style={{ color: theme.colors.onSurface }}>Current CGPA</Title>
                    <Text style={[styles.cgpaValueText, { color: theme.colors.primary }]}>{calculateCurrentCGPA()}</Text>
                </Card.Content>
            </Card>
            <Card style={[styles.cgpaCard, { backgroundColor: theme.colors.surface, marginBottom: 20 }]}>
                <Card.Content>
                    <Title style={{ color: theme.colors.onSurface }}>What-If Scenarios</Title>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Max Possible CGPA: <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{calculateMaxCGPA()}</Text></Paragraph>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>CGPA (10 A's): <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{calculateCGPAwithTenAs()}</Text></Paragraph>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>CGPA (10 A-'s): <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{calculateCGPAwithTenAMinus()}</Text></Paragraph>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>CGPA (5 A's & 5 A-'s): <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{calculateCGPAwithFiveAandFiveAMinus()}</Text></Paragraph>
                </Card.Content>
            </Card>

            {/* Advanced Settings Toggle */}
            <TouchableOpacity onPress={() => setShowAdvancedSettings(!showAdvancedSettings)} style={[styles.advancedToggle, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                <Text style={{ color: theme.colors.onSurface }}>{showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}</Text>
            </TouchableOpacity>

            {/* Advanced Recalculator Section */}
            {showAdvancedSettings && (
                <View style={modalStyles.courseListHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Recalculate Grades</Text>
                </View>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCloseModal}
        >
            <View style={[modalStyles.modalOverlay]}>
                <View style={[modalStyles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <Appbar.Header style={[styles.appBar, { backgroundColor: 'transparent', elevation: 0 }]}>
                        <Appbar.Content title="CGPA Calculator" titleStyle={styles.appBarTitle} />
                        <PaperButton 
                            icon="close" 
                            onPress={handleCloseModal} 
                            mode="text" 
                            labelStyle={{ color: theme.colors.primary }}
                        >
                            Close
                        </PaperButton>
                    </Appbar.Header>
                    <FlatList
                        data={showAdvancedSettings ? grades : []}
                        renderItem={renderCourseCard}
                        keyExtractor={item => item.id}
                        ListHeaderComponent={renderHeader}
                        contentContainerStyle={[styles.paddingContainer, { paddingBottom: 100 }]}
                    />
                </View>
            </View>
        </Modal>
    );
};

// New styles for the modal overlay and container
const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    courseCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    courseDetails: {
        flex: 1,
        marginRight: 10,
    },
    gradeContainer: {
        width: 60,
        alignItems: 'center',
    },
    gradeValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    gradeInput: {
        width: 60,
        height: 35,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 5,
        textAlign: 'center',
    },
    courseActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    courseActionButton: {
        marginLeft: 10,
    },
    courseListHeader: {
        marginTop: 20,
        marginBottom: 10,
    },
});

export default CgpaCalcModal;