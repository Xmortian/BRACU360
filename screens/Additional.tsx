import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  useTheme,
  Button as PaperButton,
  List,
  Searchbar,
} from 'react-native-paper';
import { WebView } from 'react-native-webview';
import styles from '../styles/styles';
import QrScannerModal from './QrScannerModal';
import { QrCode, Phone, Mail, Clock, Facebook, Github } from 'lucide-react-native';
import { Linking } from 'react-native';
import CircularText from '../UI/CirculatText';
import { useNavigation } from '@react-navigation/native';
import StarBorder from './StarBorder';

import { faculty } from '../Data/Faculty';
import { courses } from '../Data/CourseResource';

const AdditionalScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [showClubs, setShowClubs] = useState(false);
  const [showBusSchedule, setShowBusSchedule] = useState(false);
  const [showImportantMails, setShowImportantMails] = useState(false);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [showFacultyArchive, setShowFacultyArchive] = useState(false);
  const [showCourseResources, setShowCourseResources] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  const cardColors = ['#cce5cc', '#ffe0b3', '#b3d9ff', '#b3ffe0'];
  const greyishColors = ['#e0e0e0', '#cccccc', '#b3b3b3', '#999999'];

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

  // Animation values for the button's overall blink
  const buttonBlinkAnim = useRef(new Animated.Value(1)).current;
  // Animation value for the circling light beam
  const circlingLightAnim = useRef(new Animated.Value(0)).current;

  // Slow blinking animation for the whole button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonBlinkAnim, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonBlinkAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [buttonBlinkAnim]);

  // Fast circling light beam animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(circlingLightAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [circlingLightAnim]);

  const features = [
    { name: 'Faculty Finder', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Find Where is your Faculty')) },
    { name: 'Faculty Email Archive', action: () => handleFeatureAction(() => setShowFacultyArchive(true)) },
    { name: 'Bus Schedule', action: () => handleFeatureAction(() => setShowBusSchedule(true)) },
    { name: 'Important Mails', action: () => handleFeatureAction(() => setShowImportantMails(true)) },
    { name: 'Club Showcase', action: () => handleFeatureAction(() => setShowClubs(true)) },
    { name: 'Food Hunter', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Hangout spot and food item reviews')) },
    { name: 'Course Resources', action: () => handleFeatureAction(() => setShowCourseResources(true)) },
    { name: 'Traffic Alert', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Alert when Heavy Traffic Near BracU')) },
  ];

  const Clubs = [
    { name: 'Chess Club (BUCHC)', image: require('../assets/Clubs/CHESS.jpg'), link: 'https://www.facebook.com/realbuchc' },
    { name: 'Community Service Club (BUCSC)', image: require('../assets/Clubs/Community.jpg'), link: 'https://www.facebook.com/BRACU.COMMUNITYSERVICECLUB' },
    { name: 'Adventure Club (BUAC)', image: require('../assets/Clubs/Adventure.jpg'), link: 'https://www.facebook.com/buacofficial' },
    { name: 'Art & Photography Society (BUAPS)', image: require('../assets/Clubs/Arts and Photography.jpg'), link: 'https://www.facebook.com/BRACUAPS' },
    { name: 'Cultural Club (BUCuC)', image: require('../assets/Clubs/Culture.jpg'), link: 'https://www.facebook.com/bucuc' },
    { name: 'Debating Club (BUDC)', image: require('../assets/Clubs/Debate.jpg'), link: 'https://www.facebook.com/BUDC.Offical' },
    { name: 'Drama and Theater Forum (BUDTF)', image: require('../assets/Clubs/Drama.jpg'), link: 'https://www.facebook.com/bracu.dtf' },
    { name: 'Entrepreneurship Forum (BUEDF)', image: require('../assets/Clubs/BUEDF.jpg'), link: 'https://www.facebook.com/BRACU.EDF' },
    { name: 'Film Club (BUFC)', image: require('../assets/Clubs/Film.jpg'), link: 'https://www.facebook.com/BRACUFC' },
    { name: 'Response Team (BURT)', image: require('../assets/Clubs/Response team.jpg'), link: 'https://www.facebook.com/buresponseteam' },
    { name: 'Association of Business Communicators (IABC)', image: require('../assets/Clubs/IABC.jpg'), link: 'https://www.facebook.com/iabcbracu' },
    { name: 'MONON', image: require('../assets/Clubs/Monon.jpg'), link: 'https://www.facebook.com/MONON.BRACU' },
    { name: 'Leadership Development Forum (BULDF)', image: require('../assets/Clubs/Leadership and Development.jpg'), link: 'https://www.facebook.com/bracu.ldf' },
    { name: 'Communication & Language (BUCLC)', image: require('../assets/Clubs/Communication and language.jpg'), link: 'https://www.facebook.com/BUCLC' },
    { name: 'BRAC University Research for Development Club (BURed)', image: require('../assets/Clubs/Research and development.jpg'), link: 'https://www.facebook.com/BRACUReD' },
    { name: 'Peace Café BRAC University (PCBU)', image: require('../assets/Clubs/Peace Cafe.jpg'), link: 'https://www.facebook.com/Peacecafe.BracU' },
    { name: 'Multicultural Club (BUMC)', image: require('../assets/Clubs/Multi Culture club.jpg'), link: 'https://www.facebook.com/profile.php?id=100092476521133' },
    { name: 'Business & Economics Forum (BUBeF)', image: require('../assets/Clubs/Businees and economics.jpg'), link: 'https://www.facebook.com/beforum' },
    { name: 'Business Club (BIZBEE)', image: require('../assets/Clubs/BizBee.jpg'), link: 'https://www.facebook.com/bizbee.club' },
    { name: 'Finance and Accounting Club (FINACT)', image: require('../assets/Clubs/Finance Finact.jpg'), link: 'https://www.facebook.com/FINACTBracu' },
    { name: 'Computer Club (BUCC)', image: require('../assets/Clubs/Computer.jpg'), link: 'https://www.facebook.com/BRACUCC' },
    { name: 'Economics Club (BUEC)', image: require('../assets/Clubs/Economics.jpg'), link: 'https://www.facebook.com/buec.official' },
    { name: 'Electrical & Electronic Club (BUEEC)', image: require('../assets/Clubs/Electrical.jpg'), link: 'https://www.facebook.com/bracueec' },
    { name: 'Law Society (BULC)', image: require('../assets/Clubs/Law.jpeg'), link: 'https://www.facebook.com/BULawSociety1' },
    { name: 'Marketing Association (BUMA)', image: require('../assets/Clubs/Marketing.jpg'), link: 'https://www.facebook.com/bracubuma' },
    { name: 'Natural Science (BUNSC)', image: require('../assets/Clubs/Natural science.jpg'), link: 'https://www.facebook.com/bracunsc' },
    { name: 'Pharmacy Society (BUPS)', image: require('../assets/Clubs/Pharma.jpg'), link: 'https://www.facebook.com/BUPS.BRACU' },
    { name: 'Robotics Club (ROBU)', image: require('../assets/Clubs/Robotics.jpg'), link: 'https://www.facebook.com/BRACU.Robotics.Club' },
    { name: 'Cricket Club (CBU)', image: require('../assets/Clubs/Cricket.jpg'), link: 'https://www.facebook.com/CricketBRACUniversity' },
    { name: 'Football Club (FCBU)', image: require('../assets/Clubs/Football.jpg'), link: 'https://www.facebook.com/official.fcbu11' },
    { name: 'Indoor Games Club (BUIGC)', image: require('../assets/Clubs/indoor games.jpg'), link: 'https://www.facebook.com/indoorgamesclub' },
    { name: 'Brac University History Club (BUHC)', image: require('../assets/Clubs/History.jpg'), link: 'https://www.facebook.com/profile.php?id=61562120219682' },
    { name: 'BRAC University Esports Club (BUESC)', image: require('../assets/Clubs/E sports.jpg'), link: 'https://www.facebook.com/BRACUEsportsClub' },
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
      onPress={() => Linking.openURL(item.link)}
    >
      <Image source={item.image} style={localStyles.clubLogo} />
      <Text style={[styles.clubListItemText, { color: theme.colors.onSurface, flex: 1 }]}>
        {item.name}
      </Text>
      <Facebook size={24} color={theme.colors.primary} />
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

  const otherFacultyMembers = faculty.filter(f =>
    (f.Department || f.department) !== 'Department of Computer Science and Engineering'
  );

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

  const filteredCourses = Object.keys(courses).filter(courseName =>
    courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  const resourceColors = ['#f5f5f5', '#e8e8e8'];

  // --- RENDER LOGIC ---

  if (showCourseResources) {
    return (
      <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
          <Appbar.BackAction onPress={() => { setShowCourseResources(false); setCourseSearchQuery(''); }} color={theme.colors.onPrimary} />
          <Appbar.Content title="Course Resources" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
        </Appbar.Header>
        <Searchbar
          placeholder="Search courses (e.g., Cse110)"
          onChangeText={setCourseSearchQuery}
          value={courseSearchQuery}
          style={{ marginHorizontal: 16, marginVertical: 8 }}
        />
        {filteredCourses.length > 0 ? (
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
            renderItem={({ item: courseName, index: courseIndex }) => {
              const courseData = courses[courseName];
              if (!courseData || !courseData.resources) {
                return null;
              }
              const cardBackgroundColor = cardColors[courseIndex % cardColors.length];
              return (
                <View style={localStyles.courseCardContainer}>
                  <Card style={[localStyles.courseCard, { backgroundColor: cardBackgroundColor }]}>
                    <Card.Content>
                      <Title style={localStyles.courseTitle}>{courseName}</Title>
                      {courseData.resources.map((resource, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => Linking.openURL(resource.url)}
                          style={[localStyles.resourceButton, { backgroundColor: resourceColors[index % resourceColors.length] }]}
                        >
                          <Text style={localStyles.resourceName}>{resource.name}</Text>
                          <Text style={localStyles.resourceType}>{resource.type}</Text>
                        </TouchableOpacity>
                      ))}
                    </Card.Content>
                  </Card>
                </View>
              );
            }}
          />
        ) : (
          <View style={localStyles.noResultsContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No courses found.</Text>
          </View>
        )}
      </View>
    );
  }

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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

              <Text style={[styles.betaText, { color: theme.colors.onSurfaceVariant, fontStyle: 'italic', textAlign: 'center' }]}>Under Development</Text>

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

          <ScrollView style={styles.paddingContainer} contentContainerStyle={localStyles.scrollViewContentContainer}>
            <StarBorder>
              <TouchableOpacity onPress={() => navigation.navigate('Webview')}>
                <Animated.View style={[localStyles.webviewButtonAnimatedContainer, {
                  opacity: buttonBlinkAnim,
                }]}>
                  <Card style={[localStyles.webviewButtonCard, { backgroundColor: theme.colors.primary }]}>
                    <Card.Content style={localStyles.webviewButtonContent}>
<StarBorder as={View} speed="4s" color="white" style={localStyles.starBorderContainer}>
    <Title style={[localStyles.webviewButtonTitle, { color: 'cyan' }]}>
        Quick Web Links
    </Title>
</StarBorder>                      
<Paragraph style={[localStyles.webviewButtonSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>Access all web links in one place</Paragraph>

                    </Card.Content>
                  </Card>
                </Animated.View>
              </TouchableOpacity>
            </StarBorder>

            <Searchbar
              placeholder="Search features"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ marginTop: 16 }}
              ref={searchbarRef}
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              All Features
            </Text>
            <View style={styles.webviewGrid}>
              {filteredFeatures.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={localStyles.featureCardWrapper}
                  onPress={feature.action}>
                  <Card style={[localStyles.featureCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
                    <Card.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>{feature.name}</Title>
                      {feature.name === 'Club Showcase' ? (
                          <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>beta</Paragraph>
                      ) : (
                          feature.name === 'Bus Schedule' || feature.name === 'Important Mails' || feature.name === 'Faculty Email Archive' || feature.name === 'Course Resources' ? null : (
                              <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>
                                  Coming soon
                              </Paragraph>
                          )
                      )}
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            <View style={localStyles.creatorInfoContainer}>
              <Text style={localStyles.creatorText}>Developed by Moutmayen Nafis</Text>
              <View style={localStyles.socialLinksContainer}>
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL('https://www.facebook.com/moutmayen/').catch(err => {
                      console.error('An error occurred with Facebook linking', err);
                    });
                  }}>
                  <Facebook size={24} color={theme.colors.onSurface} style={localStyles.socialIcon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const githubWebUrl = 'https://github.com/Xmortian';
                    try {
                      await Linking.openURL(githubWebUrl);
                    } catch (err) {
                      console.error('An error occurred with GitHub linking', err);
                    }
                  }}>
                  <Github size={24} color={theme.colors.onSurface} style={localStyles.socialIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={localStyles.quoteContainer}>
              <Text style={localStyles.quoteText}>
                Non est ad astra mollis e terris via -     "There is no easy way from the earth to the stars."
              </Text>
              <Text style={localStyles.quoteAuthor}>
                — Seneca
              </Text>
            </View>
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
              Feedback
            </Text>
            <Card style={[styles.profileCard, { backgroundColor: '#000' }]}>
              <Card.Content>
                <Title style={{ color: '#fff' }}>We Value Your Feedback</Title>
                <Paragraph style={{ color: '#ccc', marginBottom: 10 }}>
                  Share your thoughts with us.
                </Paragraph>

                <Text style={{ color: '#fff', marginBottom: 5 }}>Student ID</Text>
                <TextInput
                  value={feedbackName}
                  onChangeText={setFeedbackName}
                  style={{ backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 15 }}
                  placeholderTextColor="#777"
                />
                <Text style={{ color: '#fff', marginBottom: 5 }}>Your Message</Text>
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
                  labelStyle={{ color: theme.colors.onPrimary }}>
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
  webviewButtonCard: {
    borderRadius: 26,
  },
  webviewButtonAnimatedContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webviewButtonContent: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  webviewButtonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  webviewButtonSubtitle: {
    fontSize: 12,
    paddingTop: 10,
  },

  featureCard: {
    borderRadius: 12,
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCardWrapper: {
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8, // Android-specific shadow
  },
  courseCardContainer: {
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseCard: {
    borderRadius: 12,
    padding: 0,
  },
      starBorderContainer: {
        padding: 8,
        marginVertical: 4, 
        alignItems: 'center', 
        justifyContent: 'center',
    },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resourceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  resourceName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resourceType: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  creatorInfoContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  creatorText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    marginHorizontal: 10,
  },
  quoteContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 5,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#555',
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  webviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default AdditionalScreen;