import { useRouter } from 'expo-router';
import React, { useEffect, useState, useContext } from 'react';
import {
	Alert,
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Modal,
	Platform,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/styles';
import { AuthContext } from './AuthContext';

// API Configuration
const API_BASE_URL = 'http://10.177.33.123:8000'; // Replace with your server URL

export default function MemberAreaScreen() {
	const router = useRouter();
    const { memberId, logout } = useContext(AuthContext);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState('general');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [member, setMember] = useState(null);
	const [announcements, setAnnouncements] = useState([]);
	const [events, setEvents] = useState([]);
	const [prayerRequests, setPrayerRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	// Modal form state
	const [modalTitle, setModalTitle] = useState('');
	const [modalContent, setModalContent] = useState('');

	useEffect(() => {
		loadMemberData();
	}, []);

	const loadMemberData = async () => {
		try {
			setLoading(true);
			await Promise.all([
				loadMemberProfile(),
				loadAnnouncements(),
				loadEvents(),
				loadPrayerRequests(),
			]);
			setLoading(false);
		} catch (error) {
			console.error('Error loading member data:', error);
			setLoading(false);
			Alert.alert('Error', 'Failed to load member data. Please try again.');
		}
	};

	const loadMemberProfile = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/mobile/member-dashboard.php?action=member-profile&member_id=${memberId}`
			);
			const result = await response.json();

			if (result.success) {
				setMember(result.data);
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error('Error loading member profile:', error);
			throw error;
		}
	};

	const loadAnnouncements = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/mobile/member-dashboard.php?action=announcements&member_id=${memberId}&type=${activeTab}`
			);
			const result = await response.json();

			if (result.success) {
				setAnnouncements(result.data);
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error('Error loading announcements:', error);
			throw error;
		}
	};

	const loadEvents = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/mobile/member-dashboard.php?action=events&member_id=${memberId}`
			);
			const result = await response.json();

			if (result.success) {
				setEvents(result.data);
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error('Error loading events:', error);
			throw error;
		}
	};

	const loadPrayerRequests = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/mobile/member-dashboard.php?action=prayer-requests&member_id=${memberId}`
			);
			const result = await response.json();

			if (result.success) {
				setPrayerRequests(result.data);
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error('Error loading prayer requests:', error);
			throw error;
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadMemberData();
		setRefreshing(false);
	};

	const handleLogout = () => {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Logout', onPress: () => logout() },
		]);
	};

	const handleTabChange = async (newTab) => {
		setActiveTab(newTab);
		try {
			const response = await fetch(
				`${API_BASE_URL}/mobile/member-dashboard.php?action=announcements&member_id=${memberId}&type=${newTab}`
			);
			const result = await response.json();

			if (result.success) {
				setAnnouncements(result.data);
			}
		} catch (error) {
			console.error('Error loading announcements for tab:', error);
		}
	};

	const handleCreateAnnouncement = async () => {
		if (!modalTitle.trim() || !modalContent.trim()) {
			Alert.alert('Error', 'Please fill in both title and content');
			return;
		}

		try {
			const response = await fetch(
				`${API_BASE_URL}/mobile/member-dashboard.php?action=create-announcement`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						member_id: memberId,
						title: modalTitle,
						content: modalContent,
						type: activeTab === 'group' ? member?.demographic : activeTab,
						is_urgent: false,
						expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
							.toISOString()
							.split('T')[0], // 30 days from now
					}),
				}
			);

			const result = await response.json();

			if (result.success) {
				Alert.alert('Success', 'Announcement created successfully');
				setShowCreateModal(false);
				setModalTitle('');
				setModalContent('');
				loadAnnouncements(); // Reload announcements
			} else {
				Alert.alert('Error', result.message);
			}
		} catch (error) {
			console.error('Error creating announcement:', error);
			Alert.alert('Error', 'Failed to create announcement. Please try again.');
		}
	};

	const handleRSVP = async (eventId, attending) => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/mobile/member-dashboard.php?action=rsvp-event`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						member_id: memberId,
						event_id: eventId,
						attending: attending,
					}),
				}
			);

			const result = await response.json();

			if (result.success) {
				// Update local state
				setEvents((prev) =>
					prev.map((event) =>
						event.id === eventId
							? {
									...event,
									isAttending: attending,
									attendees: attending
										? event.attendees + 1
										: event.attendees - 1,
							  }
							: event
					)
				);
			} else {
				Alert.alert('Error', result.message);
			}
		} catch (error) {
			console.error('Error updating RSVP:', error);
			Alert.alert('Error', 'Failed to update RSVP. Please try again.');
		}
	};

	const getAnnouncementColor = (type) => {
		switch (type) {
			case 'general':
				return '#3498db';
			case 'youth':
			case 'men':
			case 'women':
			case 'children':
				return '#27ae60';
			case 'leadership':
				return '#f39c12';
			default:
				return '#95a5a6';
		}
	};

	const renderHeader = () => (
		<Animated.View
			entering={FadeInUp.duration(600)}
			style={styles.memberHeader}>
			<View style={styles.profileSection}>
				<View style={styles.profileImageContainer}>
					{member?.profileImage ? (
						<Image
							source={{ uri: member.profileImage }}
							style={styles.profileImage}
						/>
					) : (
						<View style={styles.defaultProfileImage}>
							<Icon name='account' size={40} color='#fff' />
						</View>
					)}
					{member?.notifications > 0 && (
						<View style={styles.notificationBadge}>
							<Text style={styles.badgeText}>{member.notifications}</Text>
						</View>
					)}
				</View>
				<View style={styles.profileInfo}>
					<Text style={styles.memberName}>Welcome, {member?.name}</Text>
					<Text style={styles.memberRole}>{member?.role}</Text>
					<View style={styles.tagContainer}>
						<Text
							style={[
								styles.demographicTag,
								{ backgroundColor: getAnnouncementColor(member?.demographic) },
							]}>
							{member?.demographic?.toUpperCase()}
						</Text>
					</View>
				</View>
			</View>
		</Animated.View>
	);

	const renderQuickActions = () => (
		<Animated.View
			entering={FadeInUp.duration(700)}
			style={styles.quickActionsSection}>
			<Text style={styles.sectionTitle}>Quick Actions</Text>
			<View style={styles.actionGrid}>
				{member?.isLeader && (
					<TouchableOpacity
						style={[styles.actionCard, { backgroundColor: '#3498db' }]}
						onPress={() => setShowCreateModal(true)}>
						<Icon name='plus-box' size={24} color='#fff' />
						<Text style={styles.actionText}>Create Announcement</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={[styles.actionCard, { backgroundColor: '#27ae60' }]}
					onPress={() => router.push('/events')}>
					<Icon name='calendar-month' size={24} color='#fff' />
					<Text style={styles.actionText}>View Events</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.actionCard, { backgroundColor: '#9b59b6' }]}
					onPress={() => router.push('/prayer-wall')}>
					<Icon name='hand-heart' size={24} color='#fff' />
					<Text style={styles.actionText}>Prayer Wall</Text>
				</TouchableOpacity>

				{member?.isLeader && (
					<TouchableOpacity
						style={[styles.actionCard, { backgroundColor: '#f39c12' }]}
						onPress={() => router.push('/group-members')}>
						<Icon name='account-multiple' size={24} color='#fff' />
						<Text style={styles.actionText}>My Group</Text>
					</TouchableOpacity>
				)}
			</View>
		</Animated.View>
	);

	const renderAnnouncementTabs = () => (
		<View style={styles.tabContainer}>
			<TouchableOpacity
				style={[styles.tab, activeTab === 'general' && styles.activeTab]}
				onPress={() => handleTabChange('general')}>
				<Icon
					name='bullhorn-outline'
					size={16}
					color={activeTab === 'general' ? '#fff' : '#666'}
				/>
				<Text
					style={[
						styles.tabText,
						activeTab === 'general' && styles.activeTabText,
					]}>
					General
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.tab, activeTab === 'group' && styles.activeTab]}
				onPress={() => handleTabChange('group')}>
				<Icon
					name='account-multiple'
					size={16}
					color={activeTab === 'group' ? '#fff' : '#666'}
				/>
				<Text
					style={[
						styles.tabText,
						activeTab === 'group' && styles.activeTabText,
					]}>
					My Group
				</Text>
			</TouchableOpacity>

			{member?.isLeader && (
				<TouchableOpacity
					style={[styles.tab, activeTab === 'leadership' && styles.activeTab]}
					onPress={() => handleTabChange('leadership')}>
					<Icon
						name='crown-outline'
						size={16}
						color={activeTab === 'leadership' ? '#fff' : '#666'}
					/>
					<Text
						style={[
							styles.tabText,
							activeTab === 'leadership' && styles.activeTabText,
						]}>
						Leadership
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	const renderAnnouncements = () => (
		<Animated.View
			entering={FadeInUp.duration(800)}
			style={styles.announcementsSection}>
			<Text style={styles.sectionTitle}>📌 Announcements</Text>
			{renderAnnouncementTabs()}

			{announcements.length === 0 ? (
				<Text style={styles.emptyText}>No announcements yet.</Text>
			) : (
				announcements.map((announcement) => (
					<View key={announcement.id} style={styles.announcementCard}>
						<View style={styles.announcementHeader}>
							<View
								style={[
									styles.typeIndicator,
									{
										backgroundColor: getAnnouncementColor(announcement.type),
									},
								]}
							/>
							<View style={styles.announcementMeta}>
								<Text style={styles.announcementTitle}>
									{announcement.isUrgent && '🔴 '}
									{announcement.title}
								</Text>
								<Text style={styles.announcementAuthor}>
									By {announcement.author} • {announcement.date}
								</Text>
							</View>
						</View>
						<Text style={styles.announcementContent}>
							{announcement.content}
						</Text>
					</View>
				))
			)}
		</Animated.View>
	);

	const renderUpcomingEvents = () => (
		<Animated.View
			entering={FadeInUp.duration(900)}
			style={styles.eventsSection}>
			<Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
			{events.length === 0 ? (
				<Text style={styles.emptyText}>No upcoming events.</Text>
			) : (
				events.map((event) => (
					<View key={event.id} style={styles.eventCard}>
						<View style={styles.eventHeader}>
							<Text style={styles.eventTitle}>{event.title}</Text>
							<Text style={styles.eventDate}>{event.date}</Text>
						</View>
						<Text style={styles.eventDetails}>
							🕐 {event.time} • 📍 {event.location}
						</Text>
						<Text style={styles.eventAttendees}>
							👥 {event.attendees} attending
						</Text>

						<View style={styles.rsvpButtons}>
							<TouchableOpacity
								style={[
									styles.rsvpButton,
									event.isAttending && styles.attendingButton,
								]}
								onPress={() => handleRSVP(event.id, !event.isAttending)}>
								<Icon
									name={event.isAttending ? 'check-circle-outline' : 'plus-circle-outline'}
									size={16}
									color='#fff'
								/>
								<Text style={styles.rsvpText}>
									{event.isAttending ? 'Attending' : 'Join Event'}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				))
			)}
		</Animated.View>
	);

	const renderDemographicCorner = () => (
		<Animated.View
			entering={FadeInUp.duration(1000)}
			style={styles.demographicSection}>
			<Text style={styles.sectionTitle}>
				{member?.demographic === 'youth'
					? '🎯'
					: member?.demographic === 'men'
					? '👨'
					: member?.demographic === 'women'
					? '👩'
					: '👶'}{' '}
				{member?.demographic?.toUpperCase()} Corner
			</Text>
			<View style={styles.resourceCard}>
				<Text style={styles.resourceTitle}>Weekly Devotional</Text>
				<Text style={styles.resourceContent}>
					This week's theme: "Walking in Faith" - Join your{' '}
					{member?.demographic} group for special studies and fellowship.
				</Text>
				<TouchableOpacity style={styles.resourceButton}>
					<Text style={styles.resourceButtonText}>Read More</Text>
				</TouchableOpacity>
			</View>
		</Animated.View>
	);

	if (loading) {
		return (
			<ImageBackground
				source={require('../assets/bg.jpg')}
				style={styles.background}>
				<View style={styles.loadingContainer}>
					<Icon name='loading' size={50} color='#fff' />
					<Text style={styles.loadingText}>Loading your dashboard...</Text>
				</View>
			</ImageBackground>
		);
	}

	return (
		<View style={styles.background}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<ScrollView
					contentContainerStyle={styles.scrollContainer}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}>
					{renderHeader()}
					{renderQuickActions()}
					{renderAnnouncements()}
					{renderUpcomingEvents()}
					{renderDemographicCorner()}

					{/* Logout Button */}
					<Animated.View
						entering={FadeInUp.duration(1100)}
						style={styles.logoutSection}>
						<TouchableOpacity
							style={styles.logoutButton}
							onPress={handleLogout}>
							<Icon name='logout-variant' size={20} color='#e63946' />
							<Text style={styles.logoutText}>Logout</Text>
						</TouchableOpacity>
					</Animated.View>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Create Announcement Modal */}
			<Modal
				visible={showCreateModal}
				animationType='slide'
				transparent={true}
				onRequestClose={() => setShowCreateModal(false)}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Create Announcement</Text>
							<TouchableOpacity onPress={() => setShowCreateModal(false)}>
								<Icon name='close' size={24} color='#666' />
							</TouchableOpacity>
						</View>

						<TextInput
							style={styles.modalInput}
							placeholder='Announcement Title'
							placeholderTextColor='#999'
							value={modalTitle}
							onChangeText={setModalTitle}
						/>

						<TextInput
							style={[styles.modalInput, styles.modalTextArea]}
							placeholder='Announcement Content'
							multiline
							numberOfLines={4}
							placeholderTextColor='#999'
							value={modalContent}
							onChangeText={setModalContent}
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.modalCancelButton}
								onPress={() => setShowCreateModal(false)}>
								<Text style={styles.modalCancelText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.modalSubmitButton}
								onPress={handleCreateAnnouncement}>
								<Text style={styles.modalSubmitText}>Post Announcement</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
