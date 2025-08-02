import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Image, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import styles from '../styles/styles';
import {
    ChevronLeft,
    ChevronRight,
    BookText,
    ClipboardList,
    Bell,
    MapPin,
    User2,
} from 'lucide-react-native';


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
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 10
                        }}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        centerContent={true}
                    >
                        <Image
                            source={require('../assets/year_planner.png')}
                            style={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: 1,
                            }}
                            resizeMode="contain"
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

// --- HomeScreen Component ---
const HomeScreen = () => {
    const theme = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isYearPlannerVisible, setIsYearPlannerVisible] = useState(false);
    const [isRoutineOverviewVisible, setIsRoutineOverviewVisible] = useState(false);

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
        today.setHours(0, 0, 0, 0);

        for (let i = -2; i <= 4; i++) {
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
};

export default HomeScreen;