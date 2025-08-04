import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Image, StyleSheet } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button as PaperButton, useTheme } from 'react-native-paper';
import styles from '../styles/styles';
import { Dimensions } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';


import {
    ChevronLeft,
    ChevronRight,
    BookText,
    ClipboardList,
    Bell,
    MapPin,
    User2,
} from 'lucide-react-native';


function YearPlannerModal({ visible, onClose }) {
    const images = [
        {
            url: '',
            width: 7240,
            o0height: 4640, 
            props: {
                source: require('../assets/year_planner.png'),
            },
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <ImageViewer
                imageUrls={images}
                enableSwipeDown
                onSwipeDown={onClose}
                backgroundColor="#000"
                renderIndicator={() => null}
                renderHeader={() => (
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            position: 'absolute',
                            top: 40,
                            right: 20,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            padding: 8,
                            borderRadius: 4,
                            zIndex: 99,
                        }}
                    >
                        <Text style={{ fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                )}
            />
        </Modal>
    );
}


function RoutineOverviewModal({ visible, onClose }) {
    const theme = useTheme();
    const routineOverviewContent = ` ADD Your Routine
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
        { id: '1', timeStart: '9:30', timeEnd: '11:00', course: 'Computer Science', room: '9G-32C', faculty: 'KSD', color: '#A7F3D0' },
        { id: '2', timeStart: '11:00', timeEnd: '12:30', course: 'Digital Marketing', room: '8F-12C', faculty: 'STV', color: '#FDE68A' },
        { id: '3', timeStart: '2:00', timeEnd: '3:30', course: 'Digital Marketing', room: '12H-36C', faculty: 'ANY', color: '#BFDBFE' },
        { id: '4', timeStart: '3:30', timeEnd: '5:00', course: 'Introduction to Psychology', room: '8G-19C', faculty: 'LLY', color: '#D1FAE5' },
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