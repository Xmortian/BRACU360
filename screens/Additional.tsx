import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Image, StyleSheet, Modal } from 'react-native';
import { Appbar, Card, Title, Paragraph, useTheme, Button as PaperButton, List, Searchbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import styles from '../styles/styles';
import QrScannerModal from './QrScannerModal';
import { QrCode, Phone, Mail, Clock } from 'lucide-react-native';
import { Linking } from 'react-native';
import CircularText from '../UI/CirculatText';

// Import all faculty data from your single file
import { faculty } from '../Data/Faculty'; 

const AdditionalScreen = () => {
    const theme = useTheme();
    const [showClubs, setShowClubs] = useState(false);
    const [showBusSchedule, setShowBusSchedule] = useState(false);
    const [showImportantMails, setShowImportantMails] = useState(false);
    const [isQrModalVisible, setIsQrModalVisible] = useState(false);
    const [showFacultyArchive, setShowFacultyArchive] = useState(false);
    const cardColors = ['#cce5cc', '#ffe0b3', '#b3d9ff', '#b3ffe0'];

    
    // State for the CSE WebView and "Others" faculty list
    const [showOthersFaculty, setShowOthersFaculty] = useState(false);
    const [showCseFacultyWebview, setShowCseFacultyWebview] = useState(false);
    const [othersFacultySearch, setOthersFacultySearch] = useState('');

    const [feedbackName, setFeedbackName] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [clubSearchQuery, setClubSearchQuery] = useState('');
    const searchbarRef = useRef(null);

    const [isBusLoading, setIsBusLoading] = useState(true);
    const [isCseLoading, setIsCseLoading] = useState(true);

    const features = [
        // { name: 'Hall of Fame', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Hall of Fame BracU')) },
        { name: 'Faculty Finder', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Find Where is your Faculty')) },
        { name: 'Faculty Email Archive', action: () => handleFeatureAction(() => setShowFacultyArchive(true)) },
        { name: 'Bus Schedule', action: () => handleFeatureAction(() => setShowBusSchedule(true)) },
        { name: 'Important Mails', action: () => handleFeatureAction(() => setShowImportantMails(true)) },
        { name: 'Club Showcase', action: () => handleFeatureAction(() => setShowClubs(true)) },
        { name: 'Food Reviews 👏👏', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Hangout spot and food item reviews')) },
        { name: 'Course Reviews 👏👏', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Courses Difficulty wise review and suggestions')) },
        { name: 'Traffic Alert', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Alert when Heavy Traffic Near BracU')) },
        { name: 'Nearby Mosques', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Mosque Location')) },
        { name: 'Nearby Libraries', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Nearby Library')) },
    ];

    const Clubs = [
        { name: 'Chess Club (BUCHC)', image: require('../assets/Clubs/CHESS.jpg') },
        { name: 'Community Service Club (BUCSC)', image: require('../assets/Clubs/Community.jpg') },
        { name: 'Adventure Club (BUAC)', image: require('../assets/Clubs/Adventure.jpg') },
        { name: 'Art & Photography Society (BUAPS)', image: require('../assets/Clubs/Arts and Photography.jpg') },
        { name: 'Cultural Club (BUCuC)', image: require('../assets/Clubs/Culture.jpg') },
        { name: 'Debating Club (BUDC)', image: require('../assets/Clubs/Debate.jpg') },
        { name: 'Drama and Theater Forum (BUDTF)', image: require('../assets/Clubs/Drama.jpg') },
        { name: 'Entrepreneurship Forum (BUEDF)', image: require('../assets/Clubs/BUEDF.jpg') },
        { name: 'Film Club (BUFC)', image: require('../assets/Clubs/Film.jpg') },
        { name: 'Response Team (BURT)', image: require('../assets/Clubs/Response team.jpg') },
        { name: 'Association of Business Communicators (IABC)', image: require('../assets/Clubs/IABC.jpg') },
        { name: 'MONON', image: require('../assets/Clubs/Monon.jpg') },
        { name: 'Leadership Development Forum (BULDF)', image: require('../assets/Clubs/Leadership and Development.jpg') },
        { name: 'Communication & Language (BUCLC)', image: require('../assets/Clubs/Communication and language.jpg') },
        { name: 'BRAC University Research for Development Club (BURed)', image: require('../assets/Clubs/Research and development.jpg') },
        { name: 'Peace Café BRAC University (PCBU)', image: require('../assets/Clubs/Peace Cafe.jpg') },
        { name: 'Multicultural Club (BUMC)', image: require('../assets/Clubs/Multi Culture club.jpg') },
        { name: 'Business & Economics Forum (BUBeF)', image: require('../assets/Clubs/Businees and economics.jpg') },
        { name: 'Business Club (BIZBEE)', image: require('../assets/Clubs/BizBee.jpg') },
        { name: 'Finance and Accounting Club (FINACT)', image: require('../assets/Clubs/Finance Finact.jpg') },
        { name: 'Computer Club (BUCC)', image: require('../assets/Clubs/Computer.jpg') },
        { name: 'Economics Club (BUEC)', image: require('../assets/Clubs/Economics.jpg') },
        { name: 'Electrical & Electronic Club (BUEEC)', image: require('../assets/Clubs/Electrical.jpg') },
        { name: 'Law Society (BULC)', image: require('../assets/Clubs/Law.jpeg') },
        { name: 'Marketing Association (BUMA)', image: require('../assets/Clubs/Marketing.jpg') },
        { name: 'Natural Science (BUNSC)', image: require('../assets/Clubs/Natural science.jpg') },
        { name: 'Pharmacy Society (BUPS)', image: require('../assets/Clubs/Pharma.jpg') },
        { name: 'Robotics Club (ROBU)', image: require('../assets/Clubs/Robotics.jpg') },
        { name: 'Cricket Club (CBU)', image: require('../assets/Clubs/Cricket.jpg') },
        { name: 'Football Club (FCBU)', image: require('../assets/Clubs/Football.jpg') },
        { name: 'Indoor Games Club (BUIGC)', image: require('../assets/Clubs/indoor games.jpg') },
        { name: 'Brac University History Club (BUHC)', image: require('../assets/Clubs/History.jpg') },
        { name: 'BRAC University Esports Club (BUESC)', image: require('../assets/Clubs/E sports.jpg') },
    ];

    const importantContacts = [
        {
            title: 'General Information',
            address: 'Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh',
            tel: '+88 09638464646 (Ext.1001 for operator)',
            email: 'info@bracu.ac.bd',
        },
        {
            title: 'Student Information Centre (SIC)',
            services: 'Student Information, Registry, Exam Controller, Admissions',
            ivr: '+8809638464646 (press 2)',
            email: 'sic@bracu.ac.bd',
            hours: '9:00 AM to 4:30 PM',
        },
        {
            title: 'Office of the Proctor',
            services: 'Student Discipline and Safety',
            phone: '+8801313049111, +8801313049105, +8801729071209',
            email: 'proctor@bracu.ac.bd',
            hours: '9:00 AM to 5:30 PM',
        },
        {
            title: 'University Medical Centre',
            services: 'Medical Assistance',
            phone: '+8801322821534',
            email: 'medicalcenter@bracu.ac.bd',
            hours: '8:30 AM to 8:30 PM',
        },
        {
            title: 'Counseling and Wellness Centre',
            services: 'Counseling and Wellness Support',
            phone: '+8801322917314, +8801322917315',
            email: 'counseling@bracu.ac.bd',
            hours: '9:00 AM to 9:00 PM',
        },
    ];

    const generalContacts = [
        { title: 'Office of the Registrar', email: 'registrar@bracu.ac.bd' },
        { title: 'Office of the Proctor', email: 'proctor@bracu.ac.bd' },
        { title: 'Office of the Controller of Examinations', email: 'academic.records@bracu.ac.bd' },
        { title: 'Medical Centre', email: 'doctor@bracu.ac.bd' },
        { title: 'Student Information Centre (SIC)', email: 'sic@bracu.ac.bd' },
        { title: 'Student Life', email: 'studentlife@bracu.ac.bd' },
        { title: 'Office of Career Services and Alumni Relations (OCSAR)', email: 'csoadmin@bracu.ac.bd (Career Services)\nalumnisupport@bracu.ac.bd (Alumni Relations)' },
        { title: 'Office of Academic Advising (OAA)', email: 'bracu-oaa@bracu.ac.bd' },
        { title: 'Office of Co-curricular Activities (OCA)', email: 'student_org@bracu.ac.bd' },
        { title: 'Admissions office', email: 'admissions@bracu.ac.bd' },
        { title: 'Ayesha Abed Library', email: 'librarian@bracu.ac.bd' },
        { title: 'Institutional Quality Assurance Cell (IQAC)', email: 'iqac@bracu.ac.bd' },
        { title: 'Office of Communication', email: 'communications@bracu.ac.bd' },
        { title: 'Operations Office', email: 'operations@bracu.ac.bd' },
        { title: 'Accounts and Finance', email: 'queries-accounts@bracu.ac.bd' },
        { title: 'Human Resources Department', email: 'hrd@bracu.ac.bd' },
        { title: 'IT Systems Office', email: 'support@bracu.ac.bd' },
        { title: 'General Information', email: 'info@bracu.ac.bd' },
        { title: 'Counseling and Wellness Centre', email: 'counseling@bracu.ac.bd' },
        { title: 'International and Scholarship Office', email: 'international-office@bracu.ac.bd (International Office)\n scholarship@bracu.ac.bd (Scholarship Office)' },
    ];

    const handleCall = (phoneNumber) => {
        const cleanedNumber = phoneNumber.replace(/ /g, '');
        Linking.openURL(`tel:${cleanedNumber}`).catch(err => console.error('Failed to open phone app', err));
    };

    const handleEmail = (emailAddress) => {
        Linking.openURL(`mailto:${emailAddress}`).catch(err => console.error('Failed to open email app', err));
    };

    const renderClubItem = ({ item }) => (
        <TouchableOpacity
            style={[localStyles.clubListItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
                Alert.alert('Club Info', `${item.name} details coming soon`);
            }}
        >
            <Image source={item.image} style={localStyles.clubLogo} />
            <Text style={[styles.clubListItemText, { color: theme.colors.onSurface, flex: 1 }]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const handleQrCodeScanned = (data) => {
        setIsQrModalVisible(false);
        Alert.alert('QR Code Scanned', `Data: ${data}`);
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackMessage.trim()) {
            Alert.alert('Error', 'Please fill out feedback field.');
            return;
        }
        setIsSubmitting(true);
        const formUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSedDi2tr4POY_PocTWMDbQcw9-Fd40AIBWlP5EeFmSi8ipskw/formResponse';
        const formData = new FormData();
        formData.append('entry.1258041428', feedbackName);
        formData.append('entry.1511754014', feedbackMessage);
        try {
            await fetch(formUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors',
            });
            Alert.alert('Thank you!', 'Your feedback has been submitted.');
            setFeedbackName('');
            setFeedbackMessage('');
        } catch (error) {
            Alert.alert('Error', 'There was a problem submitting your feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Filtering logic for the main screen features
    const filteredFeatures = features.filter(feature =>
        feature.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredImportantContacts = importantContacts.filter(contact =>
        contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.services && contact.services.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredGeneralContacts = generalContacts.filter(contact =>
        contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClubs = Clubs.filter(club =>
        club.name.toLowerCase().includes(clubSearchQuery.toLowerCase())
    );

    const handleFeatureAction = (action) => {
        Keyboard.dismiss();
        setSearchQuery('');
        action();
    };

    // Separate CSE and other faculty members
    const otherFacultyMembers = faculty.filter(f => 
        (f.Department || f.department) !== 'Department of Computer Science and Engineering'
    );
    
    // Updated search logic to filter by word
    const filteredOthersFaculty = otherFacultyMembers.filter(f => {
        const facultyText = (
            (f["Professor Name"] || f.Name || f.name || f["Faculty Name"] || '') + ' ' +
            (f.Title || f.Designation || f.title || '') + ' ' +
            (f.Department || f.department || '') + ' ' +
            (f.Email || f.email || '')
        ).toLowerCase();
    
        const searchWords = othersFacultySearch.toLowerCase().split(' ').filter(word => word.length > 0);
    
        return searchWords.every(word => facultyText.includes(word));
    });

    // --- RENDER LOGIC ---

    if (showBusSchedule) {
        return (
            <View style={{ flex: 1 }}>
                <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                    <Appbar.BackAction onPress={() => { setShowBusSchedule(false); setIsBusLoading(true); }} color={theme.colors.onPrimary} />
                    <Appbar.Content title="Bus Schedule" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                </Appbar.Header>
                {isBusLoading && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 1 }}>
                        <CircularText />
                    </View>
                )}
                <WebView
                    source={{ uri: 'https://www.bracu.ac.bd/students-transport-service' }}
                    style={{ flex: 1 }}
                    onLoadEnd={() => setIsBusLoading(false)}
                />
            </View>
        );
    }
    
    if (showImportantMails) {
        return (
            <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
                <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                    <Appbar.BackAction onPress={() => { setShowImportantMails(false); setSearchQuery(''); }} color={theme.colors.onPrimary} />
                    <Appbar.Content title="Important Mails" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                </Appbar.Header>
                <Searchbar
                    placeholder="Search contacts"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ marginHorizontal: 16, marginVertical: 8 }}
                    ref={searchbarRef}
                />
                <ScrollView contentContainerStyle={[styles.paddingContainer, { paddingBottom: 80 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                        Emergency Contacts
                    </Text>
                    {filteredImportantContacts.map((contact, index) => (
                        <Card key={index} style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginBottom: 15 }]}>
                            <Card.Content>
                                <Title style={{ color: theme.colors.onSurface }}>{contact.title}</Title>
                                {contact.address && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                        <Text style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>{contact.address}</Text>
                                    </View>
                                )}
                                {contact.services && (
                                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                        Services: {contact.services}
                                    </Paragraph>
                                )}
                                {contact.tel && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleCall(contact.tel); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Phone size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>{contact.tel}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.phone && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleCall(contact.phone.split(',')[0]); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Phone size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>{contact.phone}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.ivr && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleCall(contact.ivr); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Phone size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>IVR: {contact.ivr}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.email && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleEmail(contact.email.split(' ')[0]); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Mail size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>{contact.email}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.hours && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                        <Clock size={18} color={theme.colors.onSurfaceVariant} />
                                        <Paragraph style={{ color: theme.colors.onSurfaceVariant, marginLeft: 10 }}>Hours: {contact.hours}</Paragraph>
                                    </View>
                                )}
                            </Card.Content>
                        </Card>
                    ))}
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                        General Contacts
                    </Text>
                    <List.Section>
                        {filteredGeneralContacts.map((contact, index) => (
                            <List.Item
                                key={index}
                                title={contact.title}
                                description={contact.email}
                                left={() => <List.Icon icon="email-outline" />}
                                onPress={() => { Keyboard.dismiss(); handleEmail(contact.email.split(' ')[0]); }}
                                style={{ backgroundColor: theme.colors.surface, marginBottom: 5, borderRadius: 8 }}
                                titleStyle={{ color: theme.colors.onSurface }}
                                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                            />
                        ))}
                    </List.Section>
                </ScrollView>
            </View>
        );
    }
    
    if (showFacultyArchive) {
        if (showOthersFaculty) {
            return (
                <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                    <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                        <Appbar.BackAction onPress={() => setShowOthersFaculty(false)} color={theme.colors.onPrimary} />
                        <Appbar.Content title="Other Faculty" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                    </Appbar.Header>
                    <Searchbar
                        placeholder="Search all faculty"
                        onChangeText={setOthersFacultySearch}
                        value={othersFacultySearch}
                        style={{ marginHorizontal: 16, marginVertical: 8 }}
                    />
                    <FlatList
                        data={filteredOthersFaculty}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginHorizontal: 16, marginVertical: 8 }]}>
                                <Card.Content>
                                    <Title style={{ color: theme.colors.onSurface }}>
                                        {item["Professor Name"] || item.Name || item.name || item["Faculty Name"]}
                                    </Title>
                                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                        {item.Department || item.department}
                                    </Paragraph>
                                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                        {item.Title || item.Designation || item.title}
                                    </Paragraph>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                                            {item["Office Location"] || item["Office Level"] || item.Office || item.office || item.office_address}
                                        </Text>
                                    </View>
                                    {(item.CoursesTaught || item.courses_taught) && (
                                        <View style={{ marginTop: 10 }}>
                                            <Text style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Courses Taught:</Text>
                                            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                                {item.CoursesTaught || item.courses_taught}
                                            </Paragraph>
                                        </View>
                                    )}
                                    <TouchableOpacity onPress={() => handleEmail(item.Email || item.email)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                            <Mail size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>
                                                {item.Email || item.email}
                                            </Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                </Card.Content>
                            </Card>
                        )}
                        contentContainerStyle={{ paddingBottom: 50 }}
                    />
                </View>
            );
        }
        
        if (showCseFacultyWebview) {
            return (
                <View style={{ flex: 1 }}>
                    <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                        <Appbar.BackAction onPress={() => { setShowCseFacultyWebview(false); setIsCseLoading(true); }} color={theme.colors.onPrimary} />
                        <Appbar.Content title="CSE Faculty Emails" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                    </Appbar.Header>
                    {isCseLoading && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 1 }}>
                            <CircularText />
                        </View>
                    )}
                    <WebView
                        source={{ uri: 'https://cse.sds.bracu.ac.bd/faculty_list' }}
                        style={{ flex: 1 }}
                        onLoadEnd={() => setIsCseLoading(false)}
                    />
                </View>
            );
        }

        return (
    <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
            <Appbar.BackAction onPress={() => { setShowFacultyArchive(false); }} color={theme.colors.onPrimary} />
            <Appbar.Content title="Faculty Email Archive" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.paddingContainer}>
            <Card style={[styles.webviewCard, { backgroundColor: cardColors[0], marginBottom: 15, height: 120 }]}>
                <TouchableOpacity onPress={() => setShowCseFacultyWebview(true)}>
                    <Card.Content style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>CSE</Title>
                        <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>View CSE faculty emails</Paragraph>
                    </Card.Content>
                </TouchableOpacity>
            </Card>
            <Card style={[styles.webviewCard, { backgroundColor: cardColors[1], marginBottom: 15, height: 120 }]}>
                <TouchableOpacity onPress={() => setShowOthersFaculty(true)}>
                    <Card.Content style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>Others</Title>
                        <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>View other faculty emails</Paragraph>
                    </Card.Content>
                </TouchableOpacity>
            </Card>
        </ScrollView>
    </View>
);
    }
    
    // The main screen remains the same
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                    <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
                    <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                        <Appbar.Content title="Additional" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                        <Appbar.Action
                            icon={() => <QrCode size={24} color={theme.colors.onPrimary} />}
                            onPress={() => setIsQrModalVisible(true)}
                        />
                    </Appbar.Header>

                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={showClubs}
                        onRequestClose={() => {
                            setShowClubs(false);
                            setClubSearchQuery('');
                        }}
                    >
                        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                                <Appbar.BackAction onPress={() => setShowClubs(false)} color={theme.colors.onPrimary} />
                                <Appbar.Content title="BRACU Clubs" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                            </Appbar.Header>

                            <Searchbar
                                placeholder="Search clubs"
                                onChangeText={setClubSearchQuery}
                                value={clubSearchQuery}
                                style={{ margin: 16 }}
                            />

                            <FlatList
                                data={filteredClubs}
                                renderItem={renderClubItem}
                                keyExtractor={(item) => item.name}
                                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                            />
                        </View>
                    </Modal>

<ScrollView contentContainerStyle={[styles.paddingContainer, { paddingBottom: 80 }]}>
    <Searchbar
        placeholder="Search features"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: 16 }}
        ref={searchbarRef}
    />

    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        All Features
    </Text>
    <View style={styles.webviewGrid}>
        {filteredFeatures.map((feature, index) => (
            <TouchableOpacity
                key={index}
                style={styles.webviewCardWrapper}
                onPress={feature.action}
            >
                <Card style={[styles.webviewCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
                    <Card.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>{feature.name}</Title>
                    {feature.name === 'Bus Schedule' || feature.name === 'Important Mails' || feature.name === 'Faculty Email Archive' || feature.name === 'Club Showcase' ? null : (
                        <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>
                            Coming soon
                        </Paragraph>
                    )}
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        ))}
    </View>

    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
        Feedback
    </Text>
    <Card style={[styles.profileCard, { backgroundColor: '#000' }]}>
        <Card.Content>
            <Title style={{ color: '#fff' }}>We value your feedback</Title>
            <Paragraph style={{ color: '#ccc', marginBottom: 10 }}>
                Share your thoughts or suggestions with us.
            </Paragraph>

            <Text style={{ color: '#fff', marginBottom: 5 }}>ID (Optional)</Text>
            <TextInput
                value={feedbackName}
                onChangeText={setFeedbackName}
                style={{ backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 15 }}
                placeholderTextColor="#777"
            />
            <Text style={{ color: '#fff', marginBottom: 5 }}>Feedback</Text>
            <TextInput
                value={feedbackMessage}
                onChangeText={setFeedbackMessage}
                multiline
                style={{ backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 8, height: 100 }}
                placeholderTextColor="#777"
            />

            <PaperButton
                mode="contained"
                onPress={handleFeedbackSubmit}
                loading={isSubmitting}
                style={{ marginTop: 15, backgroundColor: theme.colors.primary }}
                labelStyle={{ color: theme.colors.onPrimary }}
            >
                Submit
            </PaperButton>
        </Card.Content>
    </Card>
</ScrollView>

                    <QrScannerModal
                        visible={isQrModalVisible}
                        onClose={() => setIsQrModalVisible(false)}
                        onQrCodeScanned={handleQrCodeScanned}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const localStyles = StyleSheet.create({
    clubListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    clubLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
});

export default AdditionalScreen;