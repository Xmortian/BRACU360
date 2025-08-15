import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, FlatList, Modal, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { Plus, Edit, Trash } from 'lucide-react-native';
import styles from '../styles/styles';

const CgpaCalcModal = ({ visible, onClose }) => {
    const theme = useTheme();
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    // Dummy data to simulate gradesheet data
    const dummyGrades = [
        { id: '1', courseName: 'CSE250', credits: 3, grade: 3.0 },
        { id: '2', courseName: 'CSE111', credits: 3, grade: 3.7 },
        { id: '3', courseName: 'CSE220', credits: 3, grade: 3.3 },
        { id: '4', courseName: 'MAT110', credits: 3, grade: 4.0 },
        { id: '5', courseName: 'ENG101', credits: 3, grade: 3.5 },
    ];

    // Placeholder functions for CGPA calculation logic
    const calculateCurrentCGPA = () => {
        const totalCredits = dummyGrades.reduce((sum, course) => sum + course.credits, 0);
        const totalGradePoints = dummyGrades.reduce((sum, course) => sum + (course.credits * course.grade), 0);
        return (totalGradePoints / totalCredits).toFixed(2);
    };
    
    const calculateMaxCGPA = () => (4.0).toFixed(2);
    const calculateCGPAwithTenAs = () => (3.82).toFixed(2);

    const handleRecalculate = (course) => {
        Alert.alert(
            "Recalculate Grade",
            `This feature will allow you to change the grade for ${course.courseName} to recalculate your CGPA.`
        );
    };

    const handleRemoveCourse = (course) => {
        Alert.alert(
            "Remove Course",
            `This feature will allow you to remove ${course.courseName} and recalculate your CGPA.`
        );
    };

    const renderCourseCard = ({ item }) => (
        <Card style={[styles.courseCard, { backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12 }]}>
            <Card.Content style={styles.courseDetails}>
                <View style={{ flex: 1 }}>
                    <Title style={{ color: theme.colors.onSurface, marginBottom: 2 }}>{item.courseName}</Title>
                    <Text style={[styles.courseGrade, { color: theme.colors.onSurfaceVariant }]}>
                        Grade: {item.grade.toFixed(1)} / Credits: {item.credits}
                    </Text>
                </View>
                <View style={styles.courseActions}>
                    <TouchableOpacity onPress={() => handleRecalculate(item)} style={styles.courseActionButton}>
                        <Edit size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveCourse(item)} style={styles.courseActionButton}>
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
                    <Title style={{ color: theme.colors.onSurface }}>Scenarios</Title>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Max Possible CGPA: <Text style={{ fontWeight: 'bold' }}>{calculateMaxCGPA()}</Text></Paragraph>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>CGPA with 10 A's: <Text style={{ fontWeight: 'bold' }}>{calculateCGPAwithTenAs()}</Text></Paragraph>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>CGPA with 10 A-'s: <Text style={{ fontWeight: 'bold' }}>{calculateCGPAwithTenAs()}</Text></Paragraph>
                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>CGPA with 5 A's & 5 A-'s': <Text style={{ fontWeight: 'bold' }}>{calculateCGPAwithTenAs()}</Text></Paragraph>
                </Card.Content>
            </Card>

            {/* Advanced Settings Toggle */}
            <TouchableOpacity onPress={() => setShowAdvancedSettings(!showAdvancedSettings)} style={[styles.advancedToggle, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                <Text style={{ color: theme.colors.onSurface }}>{showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}</Text>
            </TouchableOpacity>

            {/* Advanced Recalculator Section */}
            {showAdvancedSettings && (
                <View style={styles.courseListContainer}>
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
            onRequestClose={onClose}
        >
            <View style={[modalStyles.modalOverlay]}>
                <View style={[modalStyles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <Appbar.Header style={[styles.appBar, { backgroundColor: 'transparent', elevation: 0 }]}>
                        <Appbar.Content title="CGPA Calculator" titleStyle={styles.appBarTitle} />
                        <PaperButton 
                            icon="close" 
                            onPress={onClose} 
                            mode="text" 
                            labelStyle={{ color: theme.colors.primary }}
                        >
                            Close
                        </PaperButton>
                    </Appbar.Header>
                    <FlatList
                        data={showAdvancedSettings ? dummyGrades : []}
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
});

export default CgpaCalcModal;