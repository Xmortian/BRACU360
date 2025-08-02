import { StyleSheet } from 'react-native';

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

export default styles;