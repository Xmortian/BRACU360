import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, FlatList, Modal, StyleSheet, TextInput } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { Plus, Edit, Trash } from 'lucide-react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import styles from '../styles/styles';

// Program-to-credits mapping
const programCreditMap = {
    "BACHELOR OF SCIENCE IN APPLIED PHYSICS AND ELECTRONICS": 130,
    "BACHELOR OF SOCIAL SCIENCES IN ANTHROPOLOGY": 120,
    "BACHELOR OF ARCHITECTURE": 207,
    "BACHELOR OF SCIENCE IN BIOTECHNOLOGY": 136,
    "BACHELOR OF PHARMACY (HONS)": 164,
    "BACHELOR OF BUSINESS ADMINISTRATION": 130,
    "BACHELOR OF SOCIAL SCIENCE IN ECONOMICS": 120,
    "BACHELOR OF SCIENCE IN MICROBIOLOGY": 136,
    "BACHELOR OF SCIENCE IN MATHEMATICS": 127,
    "BACHELOR OF LAWS (LL.B. HONS.)": 135,
    "BACHELOR OF SCIENCE IN COMPUTER SCIENCE AND ENGINEERING": 136,
    "BACHELOR OF SCIENCE IN COMPUTER SCIENCE": 124,
    "BACHELOR OF SCIENCE IN ELECTRONIC AND COMMUNICATION ENGINEERING": 136,
    "BACHELOR OF ARTS IN ENGLISH": 120,
    "BACHELOR OF SCIENCE IN PHYSICS": 120,
    "BACHELOR OF SCIENCE IN ELECTRICAL AND ELECTRONIC ENGINEERING": 136,
};

// CGPA Wheel Component
const CGPAWheel = ({ cgpa, maxCgpa }) => {
    const theme = useTheme();
    const radius = 60;
    const strokeWidth = 10;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = (cgpa / maxCgpa) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View style={wheelStyles.wheelContainer}>
            <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                <G rotation="-90" origin={`${radius}, ${radius}`}>
                    <Circle
                        stroke={theme.colors.onSurfaceVariant}
                        fill="none"
                        cx={radius}
                        cy={radius}
                        r={normalizedRadius}
                        strokeWidth={strokeWidth}
                        opacity={0.3}
                    />
                    <Circle
                        stroke={theme.colors.primary}
                        fill="none"
                        cx={radius}
                        cy={radius}
                        r={normalizedRadius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </G>
                <SvgText
                    x={radius}
                    y={radius + 5}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontSize="24"
                    fontWeight="bold"
                    fill={theme.colors.onSurface}
                >
                    {cgpa.toFixed(2)}
                </SvgText>
            </Svg>
            <Text style={[wheelStyles.maxText, { color: theme.colors.onSurfaceVariant }]}>Max {maxCgpa.toFixed(2)}</Text>
        </View>
    );
};

// Add Course Form Component
const AddCourseForm = ({ onAddCourse, theme }) => {
    const [courseName, setCourseName] = useState('');
    const [credits, setCredits] = useState('');
    const [grade, setGrade] = useState('');

    const handleAdd = () => {
        if (!courseName || !credits || !grade) {
            Alert.alert("Missing Information", "Please fill out all fields to add a new course.");
            return;
        }

        const newCourse = {
            id: `custom-${Date.now()}`,
            courseName: courseName.toUpperCase(),
            credits: parseFloat(credits),
            grade: parseFloat(grade),
            semester: 'Custom',
            isNonCredit: parseFloat(grade) < 1.0,
        };

        if (isNaN(newCourse.credits) || isNaN(newCourse.grade) || newCourse.credits <= 0 || newCourse.grade < 0 || newCourse.grade > 4.0) {
            Alert.alert("Invalid Input", "Credits must be a positive number, and grade must be between 0.0 and 4.0.");
            return;
        }

        onAddCourse(newCourse);
        setCourseName('');
        setCredits('');
        setGrade('');
    };

    return (
        <View style={[formStyles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
            <Title style={{ color: theme.colors.onSurface, marginBottom: 15 }}>Add a New Course ➕</Title>
            <TextInput
                style={[formStyles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                onChangeText={setCourseName}
                value={courseName}
                placeholder="Course Code (e.g., CSE101)"
                placeholderTextColor={theme.colors.onSurfaceVariant}
            />
            <TextInput
                style={[formStyles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                onChangeText={setCredits}
                value={credits}
                placeholder="Credits"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="numeric"
            />
            <TextInput
                style={[formStyles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                onChangeText={setGrade}
                value={grade}
                placeholder="Grade (0.0 - 4.0)"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="numeric"
            />
            <PaperButton
                mode="contained"
                onPress={handleAdd}
                style={formStyles.addButton}
                labelStyle={formStyles.addButtonLabel}
            >
                Add Course
            </PaperButton>
        </View>
    );
};

const CgpaCalcModal = ({ visible, onClose, gradesheetData }) => {
    const theme = useTheme();
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [gradeInput, setGradeInput] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        if (visible && gradesheetData && gradesheetData.semesters) {
            const allCourses = [];
            gradesheetData.semesters.forEach(semester => {
                semester.courses.forEach(course => {
                    allCourses.push({
                        id: `${course.courseCode}-${Math.random()}`,
                        courseName: course.courseCode,
                        credits: course.credits,
                        grade: parseFloat(course.gradePoints),
                        semester: semester.name,
                        isNonCredit: course.isNonCredit,
                    });
                });
            });
            setGrades(allCourses);
        }
    }, [visible, gradesheetData]);

    const calculateCGPA = (currentGrades) => {
        const bestGrades = Object.values(
            currentGrades.reduce((acc, c) => {
                if (c.isNonCredit || c.grade < 1.0) return acc;
                if (!acc[c.courseName]) {
                    acc[c.courseName] = { ...c };
                } else if (c.grade > acc[c.courseName].grade) {
                    acc[c.courseName] = { ...c };
                }
                return acc;
            }, {})
        );

        if (bestGrades.length === 0) return 0.00;

        const totalCredits = bestGrades.reduce((sum, c) => sum + c.credits, 0);
        const totalGradePoints = bestGrades.reduce(
            (sum, c) => sum + (c.credits * c.grade), 0
        );

        return totalGradePoints / totalCredits;
    };

    const calculateHypotheticalCGPA = (hypotheticalGradePoint) => {
        const bestGrades = Object.values(
            grades.reduce((acc, c) => {
                if (c.credits === 0 || c.grade < 1.0) return acc;
                if (!acc[c.courseName] || c.grade > acc[c.courseName].grade) {
                    acc[c.courseName] = { ...c };
                }
                return acc;
            }, {})
        );

        const totalCompletedCredits = bestGrades.reduce((sum, c) => sum + c.credits, 0);
        const totalGradePoints = bestGrades.reduce((sum, c) => sum + (c.credits * c.grade), 0);
        const currentCGPA = totalGradePoints / totalCompletedCredits;

        const programName = gradesheetData?.program?.toUpperCase();
        const totalProgramCredits = programCreditMap[programName] || 0;
        const remainingCredits = totalProgramCredits - totalCompletedCredits;

        if (remainingCredits <= 0 || totalProgramCredits === 0) {
            return currentCGPA.toFixed(2);
        }

        const newTotalGradePoints = totalGradePoints + (remainingCredits * hypotheticalGradePoint);
        const newCgpa = newTotalGradePoints / totalProgramCredits;
        return newCgpa.toFixed(2);
    };

    const currentCGPA = calculateCGPA(grades);

    const totalCompletedCredits = useMemo(() => {
        if (!gradesheetData || !gradesheetData.semesters) {
            return 0;
        }

        const uniqueCourses = {};
        gradesheetData.semesters.forEach(semester => {
            semester.courses.forEach(course => {
                const isPassing = parseFloat(course.gradePoints) >= 1.0 && parseFloat(course.credits) > 0;
                if (isPassing) {
                    if (!uniqueCourses[course.courseCode] || parseFloat(course.gradePoints) > parseFloat(uniqueCourses[course.courseCode].gradePoints)) {
                        uniqueCourses[course.courseCode] = { ...course };
                    }
                }
            });
        });
        return Object.values(uniqueCourses).reduce((total, course) => total + course.credits, 0);
    }, [gradesheetData]);

    const totalProgramCredits = useMemo(() => {
        const programName = gradesheetData?.program?.toUpperCase();
        return programCreditMap[programName] || 'N/A';
    }, [gradesheetData]);

    const remainingCredits = useMemo(() => {
        if (totalProgramCredits === 'N/A' || totalCompletedCredits === 'N/A') {
            return 'N/A';
        }
        return totalProgramCredits - totalCompletedCredits;
    }, [totalProgramCredits, totalCompletedCredits]);

    const handleCloseModal = () => {
        setGrades([]);
        setShowAdvancedSettings(false);
        onClose();
    };

    const handleEditGrade = (course) => {
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
    
    // Handle add course
    const handleAddCourse = (newCourse) => {
        setGrades(prevGrades => [...prevGrades, newCourse]);
        Alert.alert("Course Added", `${newCourse.courseName} has been added and the CGPA has been recalculated.`);
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
        <View style={modalStyles.headerContainer}>
            <View style={modalStyles.cgpaSummary}>
                <View style={modalStyles.cgpaCurrent}>
                    <Title style={{ color: theme.colors.onSurface, fontSize: 16, textAlign: 'left' }}>Current CGPA</Title>
                    <Text style={[modalStyles.cgpaCurrentValue, { color: theme.colors.primary }]}>{currentCGPA.toFixed(2)}</Text>
                </View>
                <CGPAWheel cgpa={currentCGPA} maxCgpa={4.0} />
            </View>
            <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginBottom: 15 }]}>
                <Card.Content>
                    <View style={modalStyles.gradesSummaryContainer}>
                        <View style={modalStyles.summaryBox}>
                            <Text style={[modalStyles.summaryValue, { color: theme.colors.primary }]}>{totalCompletedCredits}</Text>
                            <Text style={[modalStyles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Completed</Text>
                        </View>
                        <View style={modalStyles.summaryBox}>
                            <Text style={[modalStyles.summaryValue, { color: theme.colors.primary }]}>{totalProgramCredits}</Text>
                            <Text style={[modalStyles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Total Required</Text>
                        </View>
                        <View style={modalStyles.summaryBox}>
                            <Text style={[modalStyles.summaryValue, { color: theme.colors.primary }]}>{remainingCredits}</Text>
                            <Text style={[modalStyles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Remaining</Text>
                        </View>
                    </View>
                </Card.Content>
            </View>
            <View style={modalStyles.scenarioContainer}>
                <Card style={[styles.cgpaCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                            <Text>Max Possible CGPA: </Text>
                            <Text style={{ color: theme.colors.primary }}>{calculateHypotheticalCGPA(4.0)}</Text>
                        </Paragraph>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                            <Text>CGPA with all A-'s: </Text>
                            <Text style={{ color: theme.colors.primary }}>{calculateHypotheticalCGPA(3.7)}</Text>
                        </Paragraph>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                            <Text>CGPA with all B+'s: </Text>
                            <Text style={{ color: theme.colors.primary }}>{calculateHypotheticalCGPA(3.3)}</Text>
                        </Paragraph>
                        {!gradesheetData && (
                            <Text style={modalStyles.warningText}>
                                <Text style={{fontWeight: 'bold'}}> </Text>
                                Upload Routine To Work On Actual GradeSheet
                            </Text>
                        )}
                    </Card.Content>
                </Card>
            </View>
            <TouchableOpacity onPress={() => setShowAdvancedSettings(!showAdvancedSettings)} style={[styles.advancedToggle, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                <Text style={{ color: theme.colors.onSurface }}>{showAdvancedSettings ? 'Hide Recalculate Grades' : 'Recalculate Grades'}</Text>
            </TouchableOpacity>
            {showAdvancedSettings && (
                <View style={modalStyles.courseListHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Your Courses</Text>
                </View>
            )}
        </View>
    );

    const renderFooter = () => (
        <AddCourseForm onAddCourse={handleAddCourse} theme={theme} />
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
                        ListFooterComponent={showAdvancedSettings ? renderFooter : null}
                        contentContainerStyle={[styles.paddingContainer, { paddingBottom: 100 }]}
                    />
                </View>
            </View>
        </Modal>
    );
};

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
    headerContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    cgpaSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    cgpaCurrent: {
        flex: 1,
        alignItems: 'flex-start',
    },
    cgpaCurrentValue: {
        fontSize: 48,
        fontWeight: 'bold',
        marginTop: 5,
    },
    scenarioContainer: {
        width: '100%',
        marginBottom: 20,
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
        width: '100%',
    },
    warningText: {
        fontSize: 8,
        color: 'white',
        backgroundColor: 'rgba(255, 165, 0, 0.7)',
        padding: 10,
        borderRadius: 5,
        textAlign: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'orange',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    gradesSummaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
summaryBox: {
    alignItems: 'center',
    paddingHorizontal: 5, // Add some padding to prevent text from touching
},
summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
},
summaryLabel: {
    fontSize: 14,
    textAlign: 'center',
},
});

const wheelStyles = StyleSheet.create({
    wheelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    maxText: {
        fontSize: 12,
        marginTop: 5,
        fontWeight: 'bold',
    },
});

const formStyles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 15,
        borderWidth: 1,
        marginTop: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    addButton: {
        marginTop: 10,
        borderRadius: 10,
    },
    addButtonLabel: {
        fontSize: 16,
    },
});

export default CgpaCalcModal;