// styles/styles.js
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: '#e9ecef',
	},
	container: {
		padding: 20,
		flex: 1,
		justifyContent: 'center',
	},
	title: {
		fontSize: 26,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 30,
		color: '#1a1a1a',
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 15,
	},
	inputField: {
		flex: 1,
		paddingVertical: 10,
		paddingLeft: 10,
	},
	label: {
		marginBottom: 5,
		fontWeight: '600',
		color: '#1a1a1a',
	},
	picker: {
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 15,
	},
	dateInput: {
		backgroundColor: '#fff',
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
	},
	iconRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	card: {
		width: '40%',
		backgroundColor: '#ffffff',
		borderRadius: 10,
		paddingVertical: 20,
		alignItems: 'center',
		marginBottom: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	cardText: {
		marginTop: 8,
		fontSize: 14,
		fontWeight: '500',
		color: '#333',
	},
	sectionBox: {
		backgroundColor: '#ffffff',
		borderRadius: 8,
		padding: 15,
		marginBottom: 15,
	},
	sectionTitle: {
		fontWeight: 'bold',
		fontSize: 18,
		marginBottom: 15,
		color: '#1a1a1a',
	},
	sectionContent: {
		fontSize: 14,
		color: '#444',
	},
	buttonContainer: {
		marginVertical: 10,
	},
	linkContainer: {
		marginTop: 20,
		alignItems: 'center',
	},
	linkText: {
		color: '#007bff',
		fontSize: 16,
		textDecorationLine: 'underline',
		fontWeight: '500',
	},
	otpSubtitle: {
		fontSize: 16,
		color: '#1a1a1a',
		textAlign: 'center',
		marginBottom: 30,
		paddingHorizontal: 20,
	},
	resendContainer: {
		marginTop: 20,
		alignItems: 'center',
	},
	countdownText: {
		color: '#1a1a1a',
		fontSize: 14,
		opacity: 0.8,
	},
	// === Push Notification Styles ===
	warningContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff3e0',
		padding: 12,
		borderRadius: 8,
		marginTop: 15,
		borderWidth: 1,
		borderColor: '#ffe0b2',
	},
	warningText: {
		color: '#e65100',
		fontSize: 14,
		marginLeft: 8,
		flex: 1,
		fontWeight: '500',
	},
	notificationInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#e8f5e9',
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: '#c8e6c9',
	},
	notificationText: {
		color: '#2e7d32',
		fontSize: 14,
		marginLeft: 8,
		fontWeight: '500',
	},
	instructionContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: '#e3f2fd',
		padding: 12,
		borderRadius: 8,
		marginTop: 15,
		borderWidth: 1,
		borderColor: '#bbdefb',
	},
	instructionText: {
		color: '#0d47a1',
		fontSize: 13,
		marginLeft: 8,
		flex: 1,
		lineHeight: 18,
	},
	statusIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 8,
		borderRadius: 6,
		marginBottom: 10,
	},
	statusText: {
		fontSize: 14,
		marginLeft: 6,
		fontWeight: '500',
	},
	statusSuccess: {
		backgroundColor: '#e8f5e9',
		borderColor: '#c8e6c9',
		borderWidth: 1,
	},
	statusError: {
		backgroundColor: '#ffebee',
		borderColor: '#ffcdd2',
		borderWidth: 1,
	},
	statusWarning: {
		backgroundColor: '#fff3e0',
		borderColor: '#ffe0b2',
		borderWidth: 1,
	},
	memberHeader: {
		backgroundColor: '#ffffff',
		padding: 25,
		borderBottomWidth: 1,
		borderBottomColor: '#dee2e6',
	},

	profileSection: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	profileImageContainer: {
		position: 'relative',
		marginRight: 15,
	},

	profileImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 2,
		borderColor: '#007bff',
	},

	defaultProfileImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#007bff',
		justifyContent: 'center',
		alignItems: 'center',
	},

	notificationBadge: {
		position: 'absolute',
		top: -5,
		right: -5,
		backgroundColor: '#d9534f',
		borderRadius: 12,
		minWidth: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fff',
	},

	badgeText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: 'bold',
	},

	profileInfo: {
		flex: 1,
	},

	memberName: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#212529',
		marginBottom: 4,
	},

	memberRole: {
		fontSize: 16,
		color: '#6c757d',
		marginBottom: 8,
	},

	tagContainer: {
		flexDirection: 'row',
	},

	demographicTag: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 8,
		fontSize: 12,
		fontWeight: 'bold',
		color: '#fff',
	},

	// Quick Actions Styles
	quickActionsSection: {
		padding: 20,
        paddingVertical: 10,
	},

	actionGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},

	actionCard: {
		width: (width - 50) / 2,
		backgroundColor: '#007bff',
		borderRadius: 8,
		padding: 20,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},

	actionText: {
		color: '#fff',
		fontWeight: 'bold',
		marginLeft: 10,
		fontSize: 14,
	},

	// Tab Styles
	tabContainer: {
		flexDirection: 'row',
		backgroundColor: '#e9ecef',
		borderRadius: 8,
		padding: 4,
		marginBottom: 15,
	},

	tab: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 6,
	},

	activeTab: {
		backgroundColor: '#007bff',
		shadowColor: '#007bff',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 2,
	},

	tabText: {
		marginLeft: 6,
		fontSize: 13,
		fontWeight: '600',
		color: '#495057',
	},

	activeTabText: {
		color: '#fff',
	},

	// Section Styles
	announcementsSection: {
		padding: 20,
	},

	eventsSection: {
		padding: 20,
	},

	demographicSection: {
		padding: 20,
	},

	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#212529',
		marginBottom: 15,
	},

	// Announcement Card Styles
	announcementCard: {
		backgroundColor: '#ffffff',
		borderRadius: 8,
		padding: 15,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},

	announcementHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 10,
	},

	typeIndicator: {
		width: 4,
		height: 40,
		borderRadius: 2,
		marginRight: 12,
	},

	announcementMeta: {
		flex: 1,
	},

	announcementTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1a1a1a',
		marginBottom: 4,
	},

	announcementAuthor: {
		fontSize: 12,
		color: '#6c757d',
	},

	announcementContent: {
		fontSize: 14,
		color: '#343a40',
		lineHeight: 20,
	},

	// Event Card Styles
	eventCard: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 15,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
	},

	eventHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},

	eventTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1a1a1a',
		flex: 1,
		marginRight: 10,
	},

	eventDate: {
		fontSize: 12,
		color: '#28a745',
		fontWeight: '600',
	},

	eventDetails: {
		fontSize: 14,
		color: '#6c757d',
		marginBottom: 6,
	},

	eventAttendees: {
		fontSize: 13,
		color: '#343a40',
		marginBottom: 12,
	},

	rsvpButtons: {
		flexDirection: 'row',
	},

	rsvpButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#007bff',
		paddingHorizontal: 15,
		paddingVertical: 8,
		borderRadius: 20,
	},

	attendingButton: {
		backgroundColor: '#28a745',
	},

	rsvpText: {
		color: '#fff',
		fontSize: 13,
		fontWeight: '600',
		marginLeft: 6,
	},

	// Resource Card Styles
	resourceCard: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
	},

	resourceTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1a1a1a',
		marginBottom: 8,
	},

	resourceContent: {
		fontSize: 14,
		color: '#343a40',
		lineHeight: 20,
		marginBottom: 12,
	},

	resourceButton: {
		alignSelf: 'flex-start',
		backgroundColor: '#6f42c1',
		paddingHorizontal: 15,
		paddingVertical: 8,
		borderRadius: 20,
	},

	resourceButtonText: {
		color: '#fff',
		fontSize: 13,
		fontWeight: '600',
	},

	// Modal Styles
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},

	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 15,
		padding: 20,
		width: width * 0.9,
		maxHeight: height * 0.8,
	},

	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},

	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#1a1a1a',
	},

	modalInput: {
		borderWidth: 1,
		borderColor: '#ced4da',
		borderRadius: 8,
		padding: 12,
		marginBottom: 15,
		fontSize: 16,
		backgroundColor: '#fff',
	},

	modalTextArea: {
		height: 100,
		textAlignVertical: 'top',
	},

	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},

	modalCancelButton: {
		flex: 1,
		backgroundColor: '#6c757d',
		padding: 12,
		borderRadius: 8,
		marginRight: 10,
		alignItems: 'center',
	},

	modalSubmitButton: {
		flex: 1,
		backgroundColor: '#007bff',
		padding: 12,
		borderRadius: 8,
		marginLeft: 10,
		alignItems: 'center',
	},

	modalCancelText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},

	modalSubmitText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},

	// Logout & Loading Styles
	logoutSection: {
		padding: 20,
		marginTop: 10,
		marginBottom: 30,
	},

	logoutButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#d9534f',
	},

	logoutText: {
		color: '#d9534f',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},

	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f8f9fa',
	},

	loadingText: {
		color: '#212529',
		fontSize: 16,
		marginTop: 15,
	},

	scrollContainer: {
		paddingBottom: 30,
	},

	emptyText: {
		fontSize: 14,
		color: '#6c757d',
		textAlign: 'center',
		marginTop: 20,
		marginBottom: 20,
		fontStyle: 'italic',
	},
	tabLoadingContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
});
