import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Image, StyleSheet, Dimensions } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import StarBorder from './StarBorder';
import CgpaCalcModal from './CgpaCalc';
import GradesheetScannerModal from './GradesheetReaderScreen';
import { LineChart, BarChart } from 'react-native-chart-kit';

import styles from '../styles/styles';

const screenWidth = Dimensions.get('window').width;

// Dummy data (remains as a fallback)
const dummyGradesData = [
    {
        semester: 'Spring 2022',
        gpa: 3.50,
        credits: 12,
        courses: [
            { code: 'CSE110', name: 'Programming Language I', grade: 'A', points: 4.00, credits: 3 },
            { code: 'MAT110', name: 'Calculus I', grade: 'B+', points: 3.50, credits: 3 },
            { code: 'ENG101', name: 'English Fundamentals', grade: 'A-', points: 3.70, credits: 3 },
            { code: 'PHY101', name: 'Physics I', grade: 'A', points: 4.00, credits: 3 },
        ],
    },
    {
        semester: 'Summer 2022',
        gpa: 3.75,
        credits: 9,
        courses: [
            { code: 'CSE111', name: 'Programming Language II', grade: 'A', points: 4.00, credits: 3 },
            { code: 'MAT120', name: 'Calculus II', grade: 'A-', points: 3.70, credits: 3 },
            { code: 'ENG102', name: 'English II', grade: 'B+', points: 3.50, credits: 3 },
        ],
    },
];

// --- Quiz Modal Component ---
function QuizModal({ visible, onClose, onQuizComplete }) {
    const theme = useTheme();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [houseScores, setHouseScores] = useState({
        Danshiri: 0,
        Chayaneer: 0,
        Moyurpankhi: 0,
        Drubotara: 0,
        Meghdut: 0,
    });
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [winnerHouse, setWinnerHouse] = useState('');

    const houseDescriptions = {
        Danshiri: "Nestled closest to the ground, Dhanshiri is the root of the dormitory tower—the house of resilience and quiet strength. Its students are known for their calm demeanor and unwavering loyalty, much like the slow yet unstoppable current of the river it’s named after. Their chambers echo with soft laughter, whispered stories, and the rustle of well-thumbed books. Dhanshiri folk are the foundation—steady, warm, and deeply grounded.",
        Chayaneer: "Bathed in golden morning light and eternally buzzing with life, Chayaneer is a sanctuary for the brave-hearted and fiercely loyal. Those who dwell here are known for their unshakable spirit, their quick wit, and a fire that never fades, even in the darkest night. Tales of their spontaneous midnight adventures and fearless standoffs at campus debates are already whispered across the dormitory. They’re not loud for attention, but their presence is impossible to ignore. You don’t choose Chayaneer—it chooses those bold enough to carry its legacy.",
        Moyurpankhi: "The house of dreamers and creators, Moyourponkhi flutters with the whimsy of colors and ideas yet to be born. Named after the mythical peacock-feathered boat, this house is for those who dance through life with imagination and a glint of mischief in their eyes. Its rooms are adorned with painters, poets, and the quiet hum of midnight guitars. You’ll find thinkers and artists here, turning ordinary evenings into moments of magic.",
        Drubotara: "High above the clouds, Dhrubotara is the house of visionaries—the ones who look to the stars and chart their own constellations. Its residents are defined by clarity of purpose and silent determination, often mistaken for aloofness. But behind those focused eyes lies the steel will of those destined to lead. Cool, collected, and always a step ahead, the students of Dhrubotara are the guiding lights for others, just like the North Star after which their house is named.",
        Meghdut: "Where the sky meets storm, Meghdoot roars with a wild, untamed spirit. The highest house in the tower, it is home to the fewest—but fiercest—voices. Don’t mistake their numbers for weakness; their impact is anything but small. These are the minds like lightning and hearts like thunder—restless, unpredictable, and endlessly fascinating. Their ideas strike hard and fast, leaving trails of inspiration in their wake. One thing is certain: when a Meghdoot speaks, the whole tower listens. And somewhere in their soaring heights, you may just stumble upon the meaning of life itself.",
    };

    const quizQuestions = [
        {
            question: "Out of all these emojis, choose the most appealing for you!",
            options: [
                { text: "🌾", house: "Danshiri" },
                { text: "🏡", house: "Chayaneer" },
                { text: "🦚", house: "Moyurpankhi" },
                { text: "🍯", house: "Drubotara" },
                { text: "🌥", house: "Meghdut" },
            ],
        },
        {
            question: "How do you wish to be perceived?",
            options: [
                { text: "Kind ", house: "Danshiri" },
                { text: "Resilient", house: "Chayaneer" },
                { text: "Original", house: "Moyurpankhi" },
                { text: "Intelligent", house: "Drubotara" },
                { text: "Imaginative", house: "Meghdut" },
            ],
        },
        {
            question: "If pets were allowed at TARC, which one of these would you take with you?",
            options: [
                { text: "Cat", house: "Danshiri" },
                { text: "Dog", house: "Chayaneer" },
                { text: "Turtle", house: "Moyurpankhi" },
                { text: "Owl", house: "Meghdut" },
                { text: "Snakes", house: "Drubotara" },
            ],
        },
        {
            question: "Choose a weekeed destination plan:",
            options: [
                { text: "Narnia", house: "Danshiri" },
                { text: "Skellige ", house: "Chayaneer" },
                { text: "Rivendell", house: "Moyurpankhi" },
                { text: "Winterfell", house: "Drubotara" },
                { text: "Azkaban", house: "Meghdut" },
            ],
        },
        {
            question: "If you could have any of the following gadget, which would you choose?",
            options: [
                { text: "An App that can change your gradesheet", house: "Danshiri" },
                { text: "A Backpack that makes assignments finish themselves overnight", house: "Moyurpankhi" },
                { text: "A group project charm that makes your teammates actually contribute", house: "Chayaneer" },
                { text: "A calendar that bends deadlines to your convenience", house: "Meghdut" },
                { text: "A campus map that always shows where free food is being served", house: "Drubotara" },
            ],
        },
        {
            question: "Choose a preferred condition",
            options: [
                { text: "Sunny with a gentle breeze", house: "Chayaneer" },
                { text: "Heavy rain and thunderstorms", house: "Meghdut" },
                { text: "Clear, starry night", house: "Drubotara" },
                { text: "A quiet, misty morning", house: "Danshiri" },
                { text: "A vibrant rainbow after a shower", house: "Moyurpankhi" },
            ],
        },
        {
            question: "Which magical item would you want?",
            options: [
                { text: "A Wand that reins supreme", house: "Drubotara" },
                { text: "A Compass that does not point North", house: "Chayaneer" },
                { text: "A Quill that writes the perfect story", house: "Moyurpankhi" },
                { text: "Ancient texts that bend time and reality", house: "Meghdut" },
                { text: "A magical map that reveals everything", house: "Danshiri" },
            ],
        },

    ];


    const handleAnswer = (selectedHouse) => {
        setHouseScores((prevScores) => ({
            ...prevScores,
            [selectedHouse]: prevScores[selectedHouse] + 1,
        }));

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            determineWinner();
        }
    };

    const determineWinner = () => {
        let maxScore = -1;
        let winners = [];

        for (const house in houseScores) {
            if (houseScores[house] > maxScore) {
                maxScore = houseScores[house];
                winners = [house];
            } else if (houseScores[house] === maxScore) {
                winners.push(house);
            }
        }

        if (winners.length > 0) {
            const randomIndex = Math.floor(Math.random() * winners.length);
            const randomWinner = winners[randomIndex];
            setWinnerHouse(randomWinner);
            onQuizComplete(randomWinner);
        } else {
            setWinnerHouse('No winner determined');
            onQuizComplete(null);
        }
        setQuizCompleted(true);
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setHouseScores({ Danshiri: 0, Chayaneer: 0, Moyurpankhi: 0, Drubotara: 0, Meghdut: 0 });
        setQuizCompleted(false);
        setWinnerHouse('');
    };

    useEffect(() => {
        if (!visible) {
            restartQuiz();
        }
    }, [visible]);

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>BracU House!</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView style={styles.modalContentScroll}>
                        {!quizCompleted ? (
                            <View>
                                {/* Corrected the logic to handle the state correctly */}
                                {currentQuestion ? (
                                    <>
                                        <Text style={[styles.questionText, { color: theme.colors.onSurface }]}>
                                            {currentQuestionIndex + 1}. {currentQuestion.question}
                                        </Text>
                                        {currentQuestion.options.map((option, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.optionButton, { backgroundColor: theme.colors.primaryContainer }]}
                                                onPress={() => handleAnswer(option.house)}
                                            >
                                                <Text style={[styles.optionButtonText, { color: theme.colors.onPrimaryContainer }]}>
                                                    {option.text}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                ) : (
                                    <Text>Quiz is loading...</Text>
                                )}
                            </View>
                        ) : (
                            <View style={styles.quizResultsContainer}>
                                <Text style={[styles.quizResultsTitle, { color: theme.colors.onSurface }]}>Sort Completed!</Text>
                                <Text style={[styles.winnerText, { color: theme.colors.primary, textAlign: 'center' }]}>
                                    You have been sorted into House {winnerHouse}!
                                </Text>
                                {winnerHouse && houseDescriptions[winnerHouse] && (
                                    <Text style={[styles.houseDescriptionText, { color: theme.colors.onSurfaceVariant }]}>
                                        {houseDescriptions[winnerHouse]}
                                    </Text>
                                )}
                                <PaperButton
                                    mode="contained"
                                    onPress={onClose}
                                    style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                                    labelStyle={{ color: theme.colors.onPrimary }}
                                >
                                    Enroll
                                </PaperButton>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// --- Profile Screen Component ---
const ProfileScreen = () => {
    const theme = useTheme();
    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [winningHouse, setWinningHouse] = useState('Danshiri');
    const [isCgpaModalVisible, setIsCgpaModalVisible] = useState(false);
    const [isGradesheetModalVisible, setIsGradesheetModalVisible] = useState(false);
    const [gradesheetData, setGradesheetData] = useState(null);

    const houseLogoMapping = {
        Danshiri: require('../assets/quiz_logo1.png'),
        Chayaneer: require('../assets/quiz_logo2.png'),
        Moyurpankhi: require('../assets/quiz_logo3.png'),
        Drubotara: require('../assets/quiz_logo4.png'),
        Meghdut: require('../assets/quiz_logo5.png'),
    };
    
    const handleGradesheetScanComplete = (data) => {
        if (data && data.semesters && data.semesters.length > 0) {
            setGradesheetData(data);
        }
        setIsGradesheetModalVisible(false);
    };

    const handleRetakeQuiz = () => {
        setWinningHouse(null);
        setIsQuizVisible(true);
    };

    const activeSemesters = gradesheetData?.semesters || dummyGradesData;

    const finalCgpa = gradesheetData?.semesters?.length > 0
        ? gradesheetData.semesters[gradesheetData.semesters.length - 1].cumulativeCgpa
        : '3.68';

    const totalCompletedCredits = gradesheetData
        ? gradesheetData.semesters.reduce((total, semester) => {
            return total + semester.courses
                .filter(course => !course.isNonCredit)
                .reduce((sum, course) => sum + course.credits, 0);
        }, 0)
        : 21;

    const chartConfig = {
        backgroundGradientFrom: theme.colors.surface,
        backgroundGradientTo: theme.colors.surface,
        color: (opacity = 1) => `rgba(80, 227, 194, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
        decimalPlaces: 2,
    };

    const gpaChartData = useMemo(() => ({
        labels: activeSemesters.map(data => 
            (data.name || data.semester).split(' ')[0].substring(0, 3)
        ),
        datasets: [{
            data: activeSemesters.map(data => parseFloat(data.gpa)),
            color: (opacity = 1) => `rgba(80, 227, 194, ${opacity})`,
            strokeWidth: 2
        }],
    }), [activeSemesters]);

    const getSemesterChartData = (courses) => {
        return {
            labels: courses.map(course => course.courseCode || course.code),
            datasets: [{
                data: courses.map(course => parseFloat(course.gradePoints || course.points)),
                colors: [
                    (opacity = 1) => `rgba(80, 227, 194, ${opacity})`,
                    (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
                    (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                    (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                    (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
                    (opacity = 1) => `rgba(255, 205, 86, ${opacity})`,
                ],
            }],
        };
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Profile" titleStyle={styles.appBarTitle} />
                <Appbar.Action
                    icon={() => <Plus size={24} color={'#50E3C2'} />}
                    onPress={() => setIsGradesheetModalVisible(true)}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.paddingContainer}>
                
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    User Information
                </Text>
                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.onSurface }}>
                            {gradesheetData?.name || 'Moutmayen Nafis'}
                        </Title>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                            Student ID: {gradesheetData?.studentId || '22201411'}
                        </Paragraph>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                            Major: {gradesheetData?.program || 'Computer Science'}
                        </Paragraph>
                    </Card.Content>
                </Card>

                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 10 }]}>
                    Grades & Performance
                </Text>

                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginBottom: 15 }]}>
                    <Card.Content>
                        <View style={internalStyles.gradesSummaryContainer}>
                            <View style={internalStyles.summaryBox}>
                                <Text style={[internalStyles.summaryValue, { color: theme.colors.primary }]}>{finalCgpa}</Text>
                                <Text style={[internalStyles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>CGPA</Text>
                            </View>
                            <View style={internalStyles.summaryBox}>
                                <Text style={[internalStyles.summaryValue, { color: theme.colors.primary }]}>{activeSemesters.length}</Text>
                                <Text style={[internalStyles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Semesters</Text>
                            </View>
                            <View style={internalStyles.summaryBox}>
                                <Text style={[internalStyles.summaryValue, { color: theme.colors.primary }]}>{totalCompletedCredits}</Text>
                                <Text style={[internalStyles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Credits</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginBottom: 15 }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.onSurface, marginBottom: 10 }}>GPA Trend</Title>
                        <LineChart
                            data={gpaChartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    </Card.Content>
                </Card>
                
                {activeSemesters.map((semesterData, index) => (
                    <Card key={index} style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginBottom: 15 }]}>
                        <Card.Content>
                            <Title style={{ color: theme.colors.onSurface }}>
                                {semesterData.name || semesterData.semester}
                            </Title>
                            <Paragraph style={{ color: theme.colors.onSurfaceVariant, marginBottom: 10 }}>
                                GPA: {parseFloat(semesterData.gpa).toFixed(2)}
                            </Paragraph>
                            
                            <BarChart
                                data={getSemesterChartData(semesterData.courses)}
                                width={screenWidth - 40}
                                height={220}
                                chartConfig={{ ...chartConfig, barPercentage: 0.8 }}
                                style={{ marginVertical: 8, borderRadius: 16 }}
                                fromZero
                                withInnerLines={true}
                                showValuesOnTopOfBars={true}
                            />
                        </Card.Content>
                    </Card>
                ))}

                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 10 }]}>
                    CGPA Calculator
                </Text>
                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginBottom: 20 }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.onSurface }}>CGPA Calculator</Title>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                            Recalculate your grades and see what-if scenarios.
                        </Paragraph>
                        <PaperButton
                            mode="contained"
                            onPress={() => setIsCgpaModalVisible(true)}
                            style={{ marginTop: 10, backgroundColor: theme.colors.primary }}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Open CGPA Calculator
                        </PaperButton>
                    </Card.Content>
                </Card>

                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 10 }]}>
                    Sorting Hat
                </Text>
                {!winningHouse ? (
                    <View style={styles.quizButtonContainer}>
                        <Image source={houseLogoMapping['Danshiri']} style={styles.floatingLogo} />
                        <Image source={houseLogoMapping['Chayaneer']} style={styles.floatingLogo} />
                        <Image source={houseLogoMapping['Moyurpankhi']} style={styles.floatingLogo} />
                        <Image source={houseLogoMapping['Drubotara']} style={styles.floatingLogo} />
                        <Image source={houseLogoMapping['Meghdut']} style={styles.floatingLogo} />
                        <TouchableOpacity
                            style={[styles.quizButton, { backgroundColor: '#423f66' }]}
                            onPress={() => setIsQuizVisible(true)}
                        >
                            <Text style={styles.quizButtonText}>
                                GET SORTED NOW
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Card style={[styles.houseDisplayCard, { backgroundColor: theme.colors.surface }]}>
                        <Card.Content>
                            <View style={internalStyles.houseInfoContainer}>
                                <Title style={{ color: theme.colors.onSurface, textAlign: 'center' }}>Your BracU House</Title>
                                <View style={internalStyles.houseNameBox}>
                                    <StarBorder as={View} speed="4s" color="cyan" style={internalStyles.starBorder}>
                                        <Text style={[styles.winnerDisplayName, internalStyles.houseNameText, { color: 'cyan' }]}>
                                            {winningHouse}
                                        </Text>
                                    </StarBorder>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.quizButton, { backgroundColor: '#423f66', marginTop: 20 }]}
                                onPress={handleRetakeQuiz}
                            >
                                <Text style={styles.quizButtonText}>
                                    GET sorted Again
                                </Text>
                            </TouchableOpacity>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>

            <QuizModal
                visible={isQuizVisible}
                onClose={() => setIsQuizVisible(false)}
                onQuizComplete={setWinningHouse}
            />
            <CgpaCalcModal
                visible={isCgpaModalVisible}
                onClose={() => setIsCgpaModalVisible(false)}
            />
            <GradesheetScannerModal
                visible={isGradesheetModalVisible}
                onClose={() => setIsGradesheetModalVisible(false)}
                onScanComplete={handleGradesheetScanComplete}
            />
        </View>
    );
};

const internalStyles = StyleSheet.create({
    houseInfoContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    houseNameBox: {
        marginTop: 10,
        alignItems: 'center',
        width: 'auto',
    },
    starBorder: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    houseNameText: {
        fontSize: 24,
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
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    summaryLabel: {
        fontSize: 14,
    },
    courseListContainer: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 15,
    },
    courseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    courseCode: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
    },
    courseName: {
        fontSize: 14,
        flex: 2,
        flexShrink: 1,
    },
    courseGrade: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 0.5,
        textAlign: 'right',
    },
});

export default ProfileScreen;