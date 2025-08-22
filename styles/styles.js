// styles/styles.js
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
	background: {
		flex: 1,
		justifyContent: 'center',
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
		color: '#fff',
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
		color: '#fff',
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
		backgroundColor: '#ffffffcc',
		borderRadius: 10,
		paddingVertical: 20,
		alignItems: 'center',
		marginBottom: 15,
		elevation: 4,
	},
	cardText: {
		marginTop: 8,
		fontSize: 14,
		fontWeight: '500',
		color: '#333',
	},
	sectionBox: {
		backgroundColor: '#ffffffcc',
		borderRadius: 8,
		padding: 15,
		marginBottom: 15,
	},
	sectionTitle: {
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 5,
		color: '#222',
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
		color: '#fff',
		fontSize: 16,
		textDecorationLine: 'underline',
		fontWeight: '500',
	},
	otpSubtitle: {
		fontSize: 16,
		color: '#fff',
		textAlign: 'center',
		marginBottom: 30,
		paddingHorizontal: 20,
	},
	resendContainer: {
		marginTop: 20,
		alignItems: 'center',
	},
	countdownText: {
		color: '#fff',
		fontSize: 14,
		opacity: 0.8,
	},
	// === Push Notification Styles ===
	warningContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 152, 0, 0.1)',
		padding: 12,
		borderRadius: 8,
		marginTop: 15,
		borderWidth: 1,
		borderColor: 'rgba(255, 152, 0, 0.3)',
	},
	warningText: {
		color: '#ff9800',
		fontSize: 14,
		marginLeft: 8,
		flex: 1,
		fontWeight: '500',
	},
	notificationInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(76, 175, 80, 0.1)',
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: 'rgba(76, 175, 80, 0.3)',
	},
	notificationText: {
		color: '#4CAF50',
		fontSize: 14,
		marginLeft: 8,
		fontWeight: '500',
	},
	instructionContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: 'rgba(33, 150, 243, 0.1)',
		padding: 12,
		borderRadius: 8,
		marginTop: 15,
		borderWidth: 1,
		borderColor: 'rgba(33, 150, 243, 0.3)',
	},
	instructionText: {
		color: '#2196F3',
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
		backgroundColor: 'rgba(76, 175, 80, 0.1)',
		borderColor: 'rgba(76, 175, 80, 0.3)',
		borderWidth: 1,
	},
	statusError: {
		backgroundColor: 'rgba(244, 67, 54, 0.1)',
		borderColor: 'rgba(244, 67, 54, 0.3)',
		borderWidth: 1,
	},
	statusWarning: {
		backgroundColor: 'rgba(255, 152, 0, 0.1)',
		borderColor: 'rgba(255, 152, 0, 0.3)',
		borderWidth: 1,
	},
	memberHeader: {
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		marginHorizontal: 20,
		marginTop: 50,
		borderRadius: 15,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
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
		borderWidth: 3,
		borderColor: '#3498db',
	},

	defaultProfileImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#3498db',
		justifyContent: 'center',
		alignItems: 'center',
	},

	notificationBadge: {
		position: 'absolute',
		top: -5,
		right: -5,
		backgroundColor: '#e63946',
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
		fontSize: 20,
		fontWeight: 'bold',
		color: '#2c3e50',
		marginBottom: 4,
	},

	memberRole: {
		fontSize: 16,
		color: '#7f8c8d',
		marginBottom: 8,
	},

	tagContainer: {
		flexDirection: 'row',
	},

	demographicTag: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
		fontSize: 12,
		fontWeight: 'bold',
		color: '#fff',
	},

	// Quick Actions Styles
	quickActionsSection: {
		marginHorizontal: 20,
		marginTop: 20,
	},

	actionGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},

	actionCard: {
		width: (width - 60) / 2,
		backgroundColor: '#3498db',
		borderRadius: 12,
		padding: 15,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
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
		backgroundColor: '#ecf0f1',
		borderRadius: 25,
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
		borderRadius: 20,
	},

	activeTab: {
		backgroundColor: '#3498db',
		shadowColor: '#3498db',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},

	tabText: {
		marginLeft: 6,
		fontSize: 13,
		fontWeight: '600',
		color: '#666',
	},

	activeTabText: {
		color: '#fff',
	},

	// Section Styles
	announcementsSection: {
		marginHorizontal: 20,
		marginTop: 20,
	},

	eventsSection: {
		marginHorizontal: 20,
		marginTop: 25,
	},

	demographicSection: {
		marginHorizontal: 20,
		marginTop: 25,
	},

	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#2c3e50',
		marginBottom: 15,
	},

	// Announcement Card Styles
	announcementCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 15,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
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
		color: '#2c3e50',
		marginBottom: 4,
	},

	announcementAuthor: {
		fontSize: 12,
		color: '#7f8c8d',
	},

	announcementContent: {
		fontSize: 14,
		color: '#34495e',
		lineHeight: 20,
	},

	// Event Card Styles
	eventCard: {
		backgroundColor: '#fff',
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
		color: '#2c3e50',
		flex: 1,
		marginRight: 10,
	},

	eventDate: {
		fontSize: 12,
		color: '#27ae60',
		fontWeight: '600',
	},

	eventDetails: {
		fontSize: 14,
		color: '#7f8c8d',
		marginBottom: 6,
	},

	eventAttendees: {
		fontSize: 13,
		color: '#34495e',
		marginBottom: 12,
	},

	rsvpButtons: {
		flexDirection: 'row',
	},

	rsvpButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#3498db',
		paddingHorizontal: 15,
		paddingVertical: 8,
		borderRadius: 20,
	},

	attendingButton: {
		backgroundColor: '#27ae60',
	},

	rsvpText: {
		color: '#fff',
		fontSize: 13,
		fontWeight: '600',
		marginLeft: 6,
	},

	// Resource Card Styles
	resourceCard: {
		backgroundColor: '#fff',
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
		color: '#2c3e50',
		marginBottom: 8,
	},

	resourceContent: {
		fontSize: 14,
		color: '#34495e',
		lineHeight: 20,
		marginBottom: 12,
	},

	resourceButton: {
		alignSelf: 'flex-start',
		backgroundColor: '#9b59b6',
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
		color: '#2c3e50',
	},

	modalInput: {
		borderWidth: 1,
		borderColor: '#bdc3c7',
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
		backgroundColor: '#95a5a6',
		padding: 12,
		borderRadius: 8,
		marginRight: 10,
		alignItems: 'center',
	},

	modalSubmitButton: {
		flex: 1,
		backgroundColor: '#3498db',
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
		marginHorizontal: 20,
		marginTop: 30,
		marginBottom: 50,
	},

	logoutButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e63946',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
	},

	logoutText: {
		color: '#e63946',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},

	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

	loadingText: {
		color: '#fff',
		fontSize: 16,
		marginTop: 15,
	},

	scrollContainer: {
		paddingBottom: 30,
	},

	emptyText: {
		fontSize: 14,
		color: '#7f8c8d',
		textAlign: 'center',
		marginTop: 10,
		marginBottom: 20,
		fontStyle: 'italic',
	},
});
