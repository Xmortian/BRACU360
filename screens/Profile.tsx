import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Image, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import { Bell } from 'lucide-react-native';
import StarBorder from './StarBorder'; // Assuming StarBorder is in the same directory

// --- Import the shared styles file ---
import styles from '../styles/styles';

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
            question: "Choose one of the following:",
            options: [
                { text: "Bunker Hill", house: "Danshiri" },
                { text: "Hand of the Shadows", house: "Chayaneer" },
                { text: "Mid Fortress", house: "Moyurpankhi" },
                { text: "Stargazer", house: "Drubotara" },
                { text: "High Tower", house: "Meghdut" },
            ],
        },
        {
            question: "If you could have any of the following power, which would you choose?",
            options: [
                { text: "Power to change your gradesheet", house: "Danshiri" },
                { text: "Power to Demolish BracU IT", house: "Chayaneer" },
                { text: "Power to make your crush fall in love with you", house: "Moyurpankhi" },
                { text: "Power to do nothing", house: "Meghdut" },
                { text: "Power to teleport", house: "Drubotara" },
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

        if (winners.length > 1) {
            const randomIndex = Math.floor(Math.random() * winners.length);
            const randomWinner = winners[randomIndex];
            setWinnerHouse(randomWinner);
            onQuizComplete(randomWinner);
        } else if (winners.length === 1) {
            setWinnerHouse(winners[0]);
            onQuizComplete(winners[0]);
        } else {
            setWinnerHouse('No winner determined');
            onQuizComplete(null);
        }

        setQuizCompleted(true);
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setHouseScores({
            Danshiri: 0,
            Chayaneer: 0,
            Moyurpankhi: 0,
            Drubotara: 0,
            Meghdut: 0,
        });
        setQuizCompleted(false);
        setWinnerHouse('');
        onClose();
    };

    useEffect(() => {
        if (!visible) {
            restartQuiz();
        }
    }, [visible]);

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>BracU House!</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView style={styles.modalContentScroll}>
                        {!quizCompleted ? (
                            <View>
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
                                    onPress={restartQuiz}
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

// --- ProfileScreen Component ---
const ProfileScreen = () => {
    const theme = useTheme();
    const [isQuizVisible, setIsQuizVisible] = useState(false); // State for quiz modal visibility
    const [winningHouse, setWinningHouse] = useState('Dhanshiri'); // State to store the winning house

    // House logo mapping
    const houseLogoMapping = {
        Danshiri: require('../assets/quiz_logo1.png'),
        Chayaneer: require('../assets/quiz_logo2.png'),
        Moyurpankhi: require('../assets/quiz_logo3.png'),
        Drubotara: require('../assets/quiz_logo4.png'),
        Meghdut: require('../assets/quiz_logo5.png'),
    };
    
    // Function to handle retaking the quiz
    const handleRetakeQuiz = () => {
        setWinningHouse(null); // Clear the previous winning house
        setIsQuizVisible(true); // Open the quiz modal again
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Profile" titleStyle={styles.appBarTitle} />
            </Appbar.Header>

            <ScrollView style={styles.paddingContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    User Information
                </Text>
                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.onSurface }}>Moutmayen Nafis</Title>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Student ID: 22201411</Paragraph>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Major: Computer Science</Paragraph>
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

            {/* Quiz Modal */}
            <QuizModal
                visible={isQuizVisible}
                onClose={() => setIsQuizVisible(false)}
                onQuizComplete={setWinningHouse}
            />
        </View>
    );
};

// Internal styles to customize the layout
const internalStyles = StyleSheet.create({
    houseInfoContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    houseNameBox: {
        marginTop: 10,
        alignItems: 'center',
        width: 'auto', // Adjust width to content size
    },
    starBorder: {
        paddingVertical: 10, // Adjust padding to make the box smaller vertically
        paddingHorizontal: 20, // Adjust padding to make the box smaller horizontally
    },
    houseNameText: {
        fontSize: 24, // You can adjust the font size to fit the smaller box
    },
});

export default ProfileScreen;