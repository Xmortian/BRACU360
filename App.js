import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Modal, Image, SafeAreaView } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { WebView } from 'react-native-webview'; // Import WebView

import {
    Globe,
    PlusCircle,
    Calculator,
    Calendar,
    BookOpen,
    Users,
    User, // For Profile tab icon
    Bell,
    MapPin,
    User2,
    ChevronLeft,
    ChevronRight,
    Home,
    BookText, // Icon for Year Planner
    ClipboardList, // Icon for Routine Overview
    ArrowLeft // Icon for back button in webview
} from 'lucide-react-native'; // Icons

// --- Navigation Setup ---
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Year Planner Modal Component ---
function YearPlannerModal({ visible, onClose }) {
    const theme = useTheme();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: '#000000aa',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10
            }}>
                <View style={{
                    width: '100%',
                    height: '90%',
                    backgroundColor: 'white',
                    borderRadius: 10,
                    overflow: 'hidden'
                }}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            alignSelf: 'flex-end',
                            padding: 10,
                            backgroundColor: '#eee',
                            borderBottomLeftRadius: 10
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>

                    {/* Zoomable Image Implementation */}
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1, // Ensures content can grow to fill the ScrollView
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 10
                        }}
                        maximumZoomScale={3} // Allows zooming in up to 3 times
                        minimumZoomScale={1} // Prevents zooming out smaller than original
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        centerContent={true} // Centers content when it's smaller than the scroll view
                    >
                        <Image
                            source={require('./assets/year_planner.png')} // Loads your image from the assets folder
                            style={{
                                width: '100%',
                                height: undefined, // Let height adjust based on aspectRatio
                                aspectRatio: 1, // Assuming your image is square; adjust if needed (e.g., 16/9 for landscape)
                            }}
                            resizeMode="contain" // Ensures the whole image is visible initially
                        />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// --- Routine Overview Modal Component ---
function RoutineOverviewModal({ visible, onClose }) {
    const theme = useTheme();
    const routineOverviewContent = `
    Your Daily Routine Overview:

    Morning:
    - 8:00 AM: Breakfast & Prep
    - 9:00 AM: Class 1
    - 10:30 AM: Study Session

    Afternoon:
    - 12:00 PM: Lunch Break
    - 1:00 PM: Class 2
    - 2:30 PM: Lab Session

    Evening:
    - 5:00 PM: Extracurriculars
    - 7:00 PM: Dinner
    - 8:00 PM: Homework/Assignments

    This is a quick summary. For detailed schedule, use the main Routine tab.
  `;

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
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Routine Overview</Text>
                        <PaperButton icon="close" onPress={onClose} mode="text" labelStyle={{ color: theme.colors.primary }}>Close</PaperButton>
                    </View>
                    <ScrollView style={styles.modalContentScroll}>
                        <Text style={[styles.yearPlannerText, { color: theme.colors.onSurfaceVariant }]}>
                            {routineOverviewContent}
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// --- Webview Detail Screen (opens a specific website) ---
function WebviewDetailScreen({ route }) {
    const { url, title } = route.params;
    const navigation = useNavigation();
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Action icon={() => <ArrowLeft size={24} color={theme.colors.onPrimary} />} onPress={() => navigation.goBack()} />
                <Appbar.Content title={title || "Webview"} titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading {title || 'website'}...</Text>
                    </View>
                )}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    Alert.alert("Webview Error", `Failed to load: ${nativeEvent.description}`);
                    navigation.goBack(); // Go back on error
                }}
            />
        </SafeAreaView>
    );
}

// --- Webview List Screen (shows clickable boxes for websites) ---
function WebviewListScreen() {
    const navigation = useNavigation();
    const theme = useTheme();

    const websites = [
        { name: 'Pre-Reg', url: 'https://preprereg.vercel.app/' },
        { name: 'BRACU Official', url: 'https://www.bracu.ac.bd/' },
        { name: 'CSE SDS', url: 'https://cse.sds.bracu.ac.bd/' },
        { name: 'Thesis Supervising List', url: 'https://cse.sds.bracu.ac.bd/thesis/supervising/list' },
        { name: 'BRACU Library', url: 'https://library.bracu.ac.bd/' },
        { name: 'BRACU Express', url: 'https://bracuexpress.com/' },
    ];

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Web Links" titleStyle={styles.appBarTitle} />
                <Appbar.Action icon={() => <Bell size={24} color={theme.colors.onPrimary} />} onPress={() => Alert.alert('Notifications', 'Coming Soon!')} />
            </Appbar.Header>
            <ScrollView style={styles.paddingContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Quick Access Webviews
                </Text>
                <View style={styles.webviewGrid}>
                    {websites.map((site, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.webviewCardWrapper}
                            onPress={() => navigation.navigate('WebviewDetail', { url: site.url, title: site.name })}
                        >
                            <Card style={[styles.webviewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Card.Content>
                                    <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>{site.name}</Title>
                                    <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>{site.url.replace(/(^\w+:|^)\/\//, '').split('/')[0]}</Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

// --- Placeholder Screen for other tabs (moved definition to correct place) ---
function PlaceholderScreen({ title }) {
    const theme = useTheme();
    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title={title} titleStyle={styles.appBarTitle} />
            </Appbar.Header>
            <View style={styles.paddingContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    {title} - Coming Soon!
                </Text>
                <Text style={[styles.cardParagraph, { color: theme.colors.onSurfaceVariant }]}>
                    This section is under active development.
                </Text>
            </View>
        </View>
    );
}

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
        // onQuizComplete(null); // This is no longer needed since onClose() will trigger a reset
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
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>BRACU House Quiz!</Text>
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
                                <Text style={[styles.quizResultsTitle, { color: theme.colors.onSurface }]}>Quiz Completed!</Text>
                                <Text style={[styles.winnerText, { color: theme.colors.primary }]}>
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
                                    Retake Quiz
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
function ProfileScreen() {
    const theme = useTheme();
    const [isQuizVisible, setIsQuizVisible] = useState(false); // State for quiz modal visibility
    const [winningHouse, setWinningHouse] = useState(null); // State to store the winning house

    // House logo mapping
    const houseLogoMapping = {
        Danshiri: require('./assets/quiz_logo1.png'),
        Chayaneer: require('./assets/quiz_logo2.png'),
        Moyurpankhi: require('./assets/quiz_logo3.png'),
        Drubotara: require('./assets/quiz_logo4.png'),
        Meghdut: require('./assets/quiz_logo5.png'),
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
                <Appbar.Action icon={() => <Bell size={24} color={theme.colors.onPrimary} />} onPress={() => Alert.alert('Notifications', 'Coming Soon!')} />
            </Appbar.Header>

            <ScrollView style={styles.paddingContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    User Information
                </Text>
                <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Title style={{ color: theme.colors.onSurface }}>John Doe</Title>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Student ID: 12345678</Paragraph>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Major: Computer Science</Paragraph>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Email: john.doe@bracu.ac.bd</Paragraph>
                    </Card.Content>
                </Card>

                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                    Sorting Hat
                </Text>

                {winningHouse ? (
                    // Display sorted house if a winner exists
                    <Card style={[styles.houseDisplayCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.houseDisplayContent}>
                            <Image source={houseLogoMapping[winningHouse]} style={styles.houseDisplayLogo} />
                            <View style={styles.houseDisplayInfo}>
                                <Title style={{ color: theme.colors.onSurface }}>Your BRACU House:</Title>
                                <Text style={[styles.winnerDisplay, { color: theme.colors.primary }]}>
                                    {winningHouse}
                                </Text>
                            </View>
                        </View>
                        <PaperButton
                            mode="contained"
                            onPress={handleRetakeQuiz}
                            style={[styles.retryButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Retake Quiz
                        </PaperButton>
                    </Card>
                ) : (
                    // Display sorting hat button if no winner exists
                    <View style={styles.quizButtonContainer}>
                        <Image
                            source={houseLogoMapping['Danshiri']}
                            style={styles.floatingLogo}
                        />
                        <Image
                            source={houseLogoMapping['Chayaneer']}
                            style={styles.floatingLogo}
                        />
                        <TouchableOpacity
                            style={[styles.quizButton, { backgroundColor: '#423f66' }]}
                            onPress={() => setIsQuizVisible(true)}
                        >
                            <Text style={styles.quizButtonText}>
                                GET SORTED NOW
                            </Text>
                        </TouchableOpacity>
                        <Image
                            source={houseLogoMapping['Drubotara']}
                            style={styles.floatingLogo}
                        />
                        <Image
                            source={houseLogoMapping['Meghdut']}
                            style={styles.floatingLogo}
                        />
                    </View>
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
}

// --- Routine Finder (Home) Screen ---
function RoutineFinderScreen() {
    const theme = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize with current date
    const [isYearPlannerVisible, setIsYearPlannerVisible] = useState(false); // State for Year Planner modal
    const [isRoutineOverviewVisible, setIsRoutineOverviewVisible] = useState(false); // State for Routine Overview modal

    const routineData = [
        { id: '1', timeStart: '11:35', timeEnd: '13:05', course: 'Computer Science', lectureType: 'Lecture 2: Data management', room: 'UB02-0405', faculty: 'Ma\'am Safura Khalid', color: '#A7F3D0' },
        { id: '2', timeStart: '13:15', timeEnd: '14:45', course: 'Digital Marketing', lectureType: 'Lecture 3: Shopify Creation', room: 'UB02-0104', faculty: 'Ma\'am Mitra', color: '#FDE68A' },
        { id: '3', timeStart: '15:10', timeEnd: '16:40', course: 'Digital Marketing', lectureType: 'Lecture 4: SEO Basics', room: 'UB02-0104', faculty: 'Ma\'am Mitra', color: '#BFDBFE' },
        { id: '4', timeStart: '16:50', timeEnd: '18:20', course: 'Introduction to Psychology', lectureType: 'Lecture 1: Human Behavior', room: 'UB02-0601', faculty: 'Mr. Ahmed Khan', color: '#D1FAE5' },
    ];

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + direction);
        setSelectedDate(newDate);
        Alert.alert("Date Changed", `Now showing routine for ${newDate.toDateString()}`);
    };

    const getDayOfWeek = (date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };

    const getMonth = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[date.getMonth()];
    };

    const renderDaySelector = () => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        for (let i = -2; i <= 4; i++) { // Show 7 days: 2 before, current, 4 after
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const isSelected = date.toDateString() === selectedDate.toDateString();

            days.push(
                <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                        styles.daySelectorItem,
                        isSelected && styles.daySelectorItemSelected,
                        { backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
                    ]}
                    onPress={() => setSelectedDate(date)}
                >
                    <Text style={[styles.daySelectorText, isSelected && { color: theme.colors.onPrimaryContainer }]}>
                        {getDayOfWeek(date)}
                    </Text>
                    <Text style={[styles.daySelectorDate, isSelected && { color: theme.colors.onPrimaryContainer }]}>
                        {date.getDate()}
                    </Text>
                </TouchableOpacity>
            );
        }
        return days;
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={styles.appBar}>
                {/* Year Planner Button */}
                <Appbar.Action
                    icon={() => <BookText size={24} color={theme.colors.onPrimary} />}
                    onPress={() => setIsYearPlannerVisible(true)}
                />
                {/* Routine Overview Button */}
                <Appbar.Action
                    icon={() => <ClipboardList size={24} color={theme.colors.onPrimary} />}
                    onPress={() => setIsRoutineOverviewVisible(true)}
                />
                <Appbar.Content title="Schedule" titleStyle={styles.appBarTitle} />
                <Appbar.Action icon={() => <Bell size={24} color={theme.colors.onPrimary} />} onPress={() => Alert.alert('Notifications', 'Coming Soon!')} />
            </Appbar.Header>

            <View style={styles.routineHeader}>
                <TouchableOpacity onPress={() => navigateDate(-1)}>
                    <ChevronLeft size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.routineDateText, { color: theme.colors.onSurface }]}>
                    {selectedDate.getDate()} {getDayOfWeek(selectedDate)}, {getMonth(selectedDate)}{selectedDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => navigateDate(1)}>
                    <ChevronRight size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelectorScroll}>
                <View style={styles.daySelectorContainer}>
                    {renderDaySelector()}
                </View>
            </ScrollView>

            <ScrollView style={styles.routineListScroll}>
                <View style={styles.paddingContainer}>
                    {routineData.map((item) => (
                        <Card key={item.id} style={[styles.classCard, { backgroundColor: item.color }]}>
                            <View style={styles.classCardContent}>
                                <View style={styles.classCardTime}>
                                    <Text style={styles.classTimeText}>{item.timeStart}</Text>
                                    <Text style={styles.classTimeText}>{item.timeEnd}</Text>
                                </View>
                                <View style={styles.classCardDetails}>
                                    <Title style={styles.classCourseTitle}>{item.course}</Title>
                                    <Paragraph style={styles.classLectureType}>{item.lectureType}</Paragraph>
                                    <View style={styles.classInfoRow}>
                                        <MapPin size={16} color="#444" />
                                        <Text style={styles.classInfoText}>{item.room}</Text>
                                    </View>
                                    <View style={styles.classInfoRow}>
                                        <User2 size={16} color="#444" />
                                        <Text style={styles.classInfoText}>{item.faculty}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.classBellIcon}>
                                    <Bell size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))}
                </View>
            </ScrollView>

            {/* Modals */}
            <YearPlannerModal
                visible={isYearPlannerVisible}
                onClose={() => setIsYearPlannerVisible(false)}
            />
            <RoutineOverviewModal
                visible={isRoutineOverviewVisible}
                onClose={() => setIsRoutineOverviewVisible(false)}
            />
        </View>
    );
}


// --- Main App Component ---
export default function App() {
    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#4A90E2', // A vibrant blue
            primaryContainer: '#D0E0F8', // Lighter shade for selected items
            onPrimaryContainer: '#1A3A6B', // Darker text on primary container
            onPrimary: '#FFFFFF', // Text color on primary background
            accent: '#50E3C2', // A bright green/teal
            background: '#F8F9FA', // Light gray background
            surface: '#FFFFFF', // Card backgrounds
            onSurface: '#333333', // Dark text on surfaces
            onSurfaceVariant: '#666666', // Lighter text on surfaces
            backdrop: 'rgba(0, 0, 0, 0.5)',
        },
    };

    return (
        <NavigationContainer>
            <PaperProvider theme={theme}>
                <Tab.Navigator
                    initialRouteName="RoutineTab" // R is the default home
                    screenOptions={({ route }) => ({
                        headerShown: false, // Hide default header for tabs, use Appbar.Header in each screen
                        tabBarActiveTintColor: theme.colors.primary,
                        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                        tabBarStyle: {
                            height: Platform.OS === 'ios' ? 90 : 60, // Adjust height for iOS safe area
                            backgroundColor: theme.colors.surface,
                            borderTopWidth: 0, // Remove top border
                            elevation: 8, // Shadow for Android
                            shadowOffset: { width: 0, height: -2 }, // Shadow for iOS
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            borderRadius: 20, // Rounded corners for the tab bar
                            position: 'absolute',
                            bottom: 10,
                            left: 10,
                            right: 10,
                            paddingBottom: Platform.OS === 'ios' ? 25 : 5, // Adjust padding for iOS safe area
                            paddingTop: 5,
                        },
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '600',
                        },
                        tabBarIcon: ({ color, size }) => {
                            let iconComponent;
                            switch (route.name) {
                                case 'WebviewTab':
                                    iconComponent = <Globe color={color} size={size} />;
                                    break;
                                case 'AdditionalTab':
                                    iconComponent = <PlusCircle color={color} size={size} />;
                                    break;
                                case 'CGPATab':
                                    iconComponent = <Calculator color={color} size={size} />;
                                    break;
                                case 'RoutineTab': // R - Routine Finder (Home)
                                    iconComponent = <Calendar color={color} size={size} />;
                                    break;
                                case 'CoursesTab': // Co - Courses
                                    iconComponent = <BookOpen color={color} size={size} />;
                                    break;
                                case 'FriendFinderTab': // F - Friend Finder
                                    iconComponent = <Users color={color} size={size} />;
                                    break;
                                case 'ProfileTab': // P - Profile
                                    iconComponent = <User color={color} size={size} />;
                                    break;
                                default:
                                    iconComponent = <Home color={color} size={size} />;
                            }
                            return iconComponent;
                        },
                    })}
                >
                    {/* Nested Stack Navigator for WebviewTab */}
                    <Tab.Screen name="WebviewTab" options={{ tabBarLabel: 'Web' }}>
                        {() => (
                            <Stack.Navigator screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="WebviewList" component={WebviewListScreen} />
                                <Stack.Screen name="WebviewDetail" component={WebviewDetailScreen} />
                            </Stack.Navigator>
                        )}
                    </Tab.Screen>
                    <Tab.Screen name="AdditionalTab" options={{ tabBarLabel: 'Add' }}>
                        {() => <PlaceholderScreen title="Additional" />}
                    </Tab.Screen>
                    <Tab.Screen name="CGPATab" options={{ tabBarLabel: 'CGPA' }}>
                        {() => <PlaceholderScreen title="CGPA Calculator" />}
                    </Tab.Screen>
                    <Tab.Screen name="RoutineTab" component={RoutineFinderScreen} options={{ tabBarLabel: 'Routine' }} />
                    <Tab.Screen name="CoursesTab" options={{ tabBarLabel: 'Courses' }}>
                        {() => <PlaceholderScreen title="Courses" />}
                    </Tab.Screen>
                    <Tab.Screen name="FriendFinderTab" options={{ tabBarLabel: 'Friends' }}>
                        {() => <PlaceholderScreen title="Friend Finder" />}
                    </Tab.Screen>
                    {/* Use the new ProfileScreen component */}
                    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
                </Tab.Navigator>
            </PaperProvider>
        </NavigationContainer>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
    appBar: {
        backgroundColor: '#4A90E2', // Blue banner color
        elevation: 0, // Remove shadow for flat look
        shadowOpacity: 0, // Remove shadow for iOS
    },
    appBarTitle: {
        color: '#FFFFFF', // White text
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left', // Align title to left
        // Removed marginLeft as Appbar.Content handles spacing better
    },
    paddingContainer: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
        color: '#333',
    },
    routineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#E0F2F7', // Light blue background for header
        borderBottomWidth: 1,
        borderBottomColor: '#CFE8F0',
    },
    routineDateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    daySelectorScroll: {
        maxHeight: 80, // Fixed height for the horizontal scroll
        marginBottom: 10,
    },
    daySelectorContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    daySelectorItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    daySelectorItemSelected: {
        borderWidth: 2,
        borderColor: '#4A90E2', // Primary accent border
    },
    daySelectorText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    daySelectorDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    routineListScroll: {
        flex: 1,
    },
    classCard: {
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    classCardContent: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    classCardTime: {
        width: 70,
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    classTimeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#444',
    },
    classCardDetails: {
        flex: 1,
    },
    classCourseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#333',
    },
    classLectureType: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    classInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    classInfoText: {
        fontSize: 13,
        color: '#444',
        marginLeft: 5,
    },
    classBellIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
    },
    modalContainer: {
        width: '90%',
        height: '80%',
        borderRadius: 20,
        padding: 20,
        elevation: 10, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    modalContentScroll: {
        flex: 1,
    },
    yearPlannerText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'justify',
    },
    // STYLES FOR WEBVIEW SECTION
    webviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    webviewCardWrapper: {
        width: '45%', // Adjust as needed for spacing
        margin: '2.5%', // Provides spacing between cards
        aspectRatio: 1, // Makes the card square
        marginBottom: 15,
    },
    webviewCard: {
        flex: 1,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    webviewCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    webviewCardUrl: {
        fontSize: 12,
        textAlign: 'center',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
    },
    // --- UPDATED STYLES FOR PROFILE AND QUIZ BUTTON ---
    profileCard: {
        marginBottom: 20,
        borderRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    quizButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        marginBottom: 20,
    },
    floatingLogo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginHorizontal: -5,
    },
    quizButton: {
        backgroundColor: '#423f66', // Purple color from the image
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 50, // Rounded pill shape
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    quizButtonText: {
        color: '#FFFFFF', // White text on the button
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    houseDisplayCard: {
        marginTop: 25,
        padding: 20,
        borderRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        alignItems: 'center',
    },
    houseDisplayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    houseDisplayLogo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginRight: 20,
    },
    houseDisplayInfo: {
        flex: 1,
    },
    winnerDisplay: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 5,
        textAlign: 'left',
    },
    retryButton: {
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        width: '100%', // Make button full width
    },
    // REMOVED old quiz button styles and quiz logo grid styles, as they are replaced by the new layout
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    optionButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    optionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    quizResultsContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    quizResultsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    quizResultsText: {
        fontSize: 16,
        marginBottom: 5,
    },
    winnerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    houseDescriptionText: {
        marginTop: 10,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
});