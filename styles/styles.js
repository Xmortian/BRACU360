import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    // --- General / Common Styles ---
    screenContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Background color for screens
    },
    appBar: {
        backgroundColor: '#4A90E2', // Blue banner color
        elevation: 0, // Remove shadow for flat look (Android)
        shadowOpacity: 0, // Remove shadow for iOS
        height: 60, // Standard app bar height
    },
    appBarTitle: {
        color: '#FFFFFF', // White text for app bar title
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        marginLeft: 10, // Adjust title alignment
    },
    paddingContainer: {
        padding: 15,
        paddingBottom: 32, // Extra padding at the bottom for scrollable content
    },
    mainCard: {
        borderRadius: 15,
        elevation: 4, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 20,
        backgroundColor: '#FFFFFF', // White background for cards
    },
    sectionTitle: { // Generic section title style
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
        color: '#333', // Dark grey text
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#F5F5F5', // Light grey background
        borderWidth: 1,
        borderColor: '#E0E0E0', // Light grey border
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
        color: '#212121', // Dark text
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 15,
        paddingHorizontal: 10,
        fontStyle: 'italic',
        color: '#616161', // Medium grey text
    },
    textInput: {
        marginBottom: 15,
    },
    centeredView: { // For modals
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
    },
    modalView: { // For modal content card
        margin: 20,
        backgroundColor: '#FFFFFF', // White background
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#D32F2F', // Red border for error modal
    },
    modalTitle: { // For modal title
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#D32F2F', // Red text for error title
    },
    modalText: { // For modal body text
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
        color: '#212121', // Dark text
    },
    modalButton: { // For modal action button
        backgroundColor: '#D32F2F', // Red background
        marginTop: 20,
    },
    modalButtonLabel: { // For modal action button text
        color: '#FFFFFF', // White text
    },

    // --- Styles specific to GradesheetScannerScreen and OcrScannerScreen ---
    scanContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    cardTitle: { // Title within the main card
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#212121', // Dark text
    },
    cardParagraph: { // Paragraph text within the main card
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
        color: '#616161', // Medium grey text
    },
    scanButton: { // Button to pick images/files
        marginTop: 15,
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        backgroundColor: '#4A90E2', // Primary color
    },
    scanButtonLabel: { // Text for the scan button
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text
    },
    imageContainer: { // Generic container for selected PDF text or single image preview
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0', // Outline variant color
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#F5F5F5', // Background color
    },
    image: { // Style for the image itself within imageContainer (from OcrScannerScreen)
        width: '100%',
        height: 200, // Adjusted from 300 to 200 for better fit with OcrScannerScreen's original style
        borderRadius: 8,
    },
    imagePreviewContainer: { // Specific container for multiple image previews (GradesheetScannerScreen)
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0', // Light grey border
        borderRadius: 8,
        padding: 5,
    },
    imagePreviewScroll: { // Horizontal scroll view for image previews
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagePreview: { // Individual image preview style
        width: 100,
        height: 100,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    resultsContainer: { // Container for OCR results
        marginTop: 20,
    },
    parsedSection: { // Section for parsed data (table)
        marginBottom: 20,
    },
    ocrSectionTitle: { // Title for OCR/Parsed sections
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#212121', // Dark text
    },
    tableContainer: { // Container for the data table
        borderWidth: 1,
        borderColor: '#E0E0E0', // Light grey border
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF', // White background
    },
    scheduleScroll: { // ScrollView for table content (used by both schedule and gradesheet)
        maxHeight: 300,
    },
    rawTextOutput: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        lineHeight: 20,
        color: '#212121', // Dark text
        borderBottomWidth: 0.5,
        borderColor: '#E0E0E0', // Light grey border
    },
    evenRow: { // Background for even rows in tables
        backgroundColor: '#f9f9f9',
    },
    oddRow: { // Background for odd rows in tables
        backgroundColor: '#ffffff',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        backgroundColor: '#E0E0E0', // Background color for table header
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
    },
    tableHeaderText: {
        fontWeight: 'bold',
        color: '#424242', // On surface text color (slightly darker for header)
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    courseColumn: {
        flex: 2,
        paddingHorizontal: 5,
        fontWeight: 'bold',
    },
    gradeColumn: {
        flex: 1,
        paddingHorizontal: 5,
        textAlign: 'center',
    },
    rawSection: { // Section for raw OCR text display
        marginTop: 20,
    },
    rawTextContainer: { // Container for raw OCR text
        padding: 10,
        backgroundColor: '#F5F5F5', // Light grey background
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 70,
        flexGrow: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0', // Outline variant color
    },

    // --- Original styles for OcrScannerScreen's schedule table ---
    scheduleItem: { // Style for individual schedule items (rows) in OcrScannerScreen
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    scheduleDay: { // Column style for Day in schedule table (OcrScannerScreen)
        width: 100,
        fontWeight: 'bold',
    },
    scheduleTime: { // Column style for Time in schedule table (OcrScannerScreen)
        width: 120,
    },
    scheduleDetails: { // Column style for Details in schedule table (OcrScannerScreen)
        flex: 1,
    },

    // --- All Other Original Styles (from your previous inputs) ---
    routinelistScroll: { // From HomeScreen.tsx
        flex: 1,
    },
    routineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#E0F2F7',
        borderBottomWidth: 1,
        borderBottomColor: '#CFE8F0',
    },
    routineDateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    daySelectorScroll: {
        maxHeight: 80,
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
        borderColor: '#4A90E2',
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
    classCard: {
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        height: '80%',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
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
    modalContentScroll: {
        flex: 1,
    },
    yearPlannerText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'justify',
    },
    webviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    webviewCardWrapper: {
        width: '45%',
        margin: '2.5%',
        aspectRatio: 1,
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
        justifyContent: 'center',
        alignItems: 'center',
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
    profileCard: {
        marginBottom: 20,
        borderRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    quizButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        marginBottom: 10,
    },
    floatingLogo: {
        width: 40,
        height: 50,
        resizeMode: 'contain',
        marginHorizontal: -5,
    },
    quizButton: {
        backgroundColor: '#423f66',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    quizButtonText: {
        color: '#FFFFFF',
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
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginRight: 50,
    },
    houseDisplayInfo: {
        flex: 1,
    },
    winnerDisplay: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 5,
        textAlign: 'left',
    },
    retryButton: {
        marginTop: 15,
        paddingHorizontal: 10,
        paddingVertical: 10,
        width: '100%',
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
    bottomMenu: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    menuItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 10,
    },
    menuText: {
        fontSize: 12,
        marginTop: 5,
        fontWeight: '600',
    },
    courseCard: {
        marginBottom: 10,
        borderRadius: 12,
        elevation: 2,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    cardActionButton: {
        alignItems: 'center',
        flex: 1,
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    friendCard: {
        borderRadius: 15,
        elevation: 2,
    },
    friendCourses: {
        fontSize: 14,
        marginBottom: 5,
    },
    friendStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    addFriendModalContent: {
        paddingVertical: 10,
    },
    uploadRoutineButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    uploadRoutineButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyListText: {
        fontSize: 16,
        textAlign: 'center',
    },
    cgpaCard: {
        borderRadius: 15,
        elevation: 2,
        marginBottom: 15,
    },
    cgpaDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cgpaValueText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    advancedToggle: {
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
    },
    courseListContainer: {
        marginTop: 15,
    },
    courseDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseGrade: {
        fontSize: 14,
    },
    courseActions: {
        flexDirection: 'row',
    },
    courseActionButton: {
        marginLeft: 15,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
});

export default styles;