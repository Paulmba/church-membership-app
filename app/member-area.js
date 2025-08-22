import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function MemberAreaScreen() {
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState('general');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [member, setMember] = useState(null);
	const [announcements, setAnnouncements] = useState([]);
	const [events, setEvents] = useState([]);
	const [prayerRequests, setPrayerRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	// Mock data - replace with actual API calls
	useEffect(() => {
		loadMemberData();
	}, []);

	const loadMemberData = async () => {
		try {
			setLoading(true);
			// Replace with actual API calls
			const memberData = {
				id: 1,
				name: 'Brother John Mwansa',
				role: 'Youth Leader',
				demographic: 'youth',
				profileImage: null,
				isLeader: true,
				isPastor: false,
				notifications: 3,
			};

			const mockAnnouncements = [
				{
					id: 1,
					title: 'Youth Bible Study Tonight',
					content:
						'Join us for an exciting Bible study session at 7 PM in the youth hall.',
					type: 'youth',
					author: 'Pastor David',
					date: '2025-08-22',
					isUrgent: false,
				},
				{
					id: 2,
					title: 'Church Clean Up Day',
					content:
						'All members are invited to participate in our monthly church cleaning.',
					type: 'general',
					author: 'Admin',
					date: '2025-08-24',
					isUrgent: true,
				},
				{
					id: 3,
					title: 'Leadership Meeting',
					content:
						'Monthly leadership meeting to discuss upcoming events and ministry plans.',
					type: 'leadership',
					author: 'Senior Pastor',
					date: '2025-08-25',
					isUrgent: false,
				},
			];

			const mockEvents = [
				{
					id: 1,
					title: 'Youth Conference 2025',
					date: '2025-09-15',
					time: '9:00 AM',
					location: 'Main Sanctuary',
					attendees: 45,
					isAttending: false,
					demographic: 'youth',
				},
				{
					id: 2,
					title: "Men's Fellowship Breakfast",
					date: '2025-08-30',
					time: '8:00 AM',
					location: 'Fellowship Hall',
					attendees: 23,
					isAttending: true,
					demographic: 'men',
				},
			];

			setMember(memberData);
			setAnnouncements(mockAnnouncements);
			setEvents(mockEvents);
			setLoading(false);
		} catch (error) {
			console.error('Error loading member data:', error);
			setLoading(false);
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
			{ text: 'Logout', onPress: () => router.replace('/') },
		]);
	};

	const getAnnouncementsByType = (type) => {
		if (type === 'general') {
			return announcements.filter((ann) => ann.type === 'general');
		} else if (type === 'group') {
			return announcements.filter((ann) => ann.type === member?.demographic);
		} else if (type === 'leadership') {
			return announcements.filter((ann) => ann.type === 'leadership');
		}
		return announcements;
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

	const handleRSVP = (eventId, attending) => {
		setEvents((prev) =>
			prev.map((event) =>
				event.id === eventId
					? {
							...event,
							isAttending: attending,
							attendees: attending ? event.attendees + 1 : event.attendees - 1,
					  }
					: event
			)
		);
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
						<Icon name='plus-circle' size={24} color='#fff' />
						<Text style={styles.actionText}>Create Announcement</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={[styles.actionCard, { backgroundColor: '#27ae60' }]}
					onPress={() => router.push('/events')}>
					<Icon name='calendar-plus' size={24} color='#fff' />
					<Text style={styles.actionText}>View Events</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.actionCard, { backgroundColor: '#9b59b6' }]}
					onPress={() => router.push('/prayer-wall')}>
					<Icon name='hands-pray' size={24} color='#fff' />
					<Text style={styles.actionText}>Prayer Wall</Text>
				</TouchableOpacity>

				{member?.isLeader && (
					<TouchableOpacity
						style={[styles.actionCard, { backgroundColor: '#f39c12' }]}
						onPress={() => router.push('/group-members')}>
						<Icon name='account-group' size={24} color='#fff' />
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
				onPress={() => setActiveTab('general')}>
				<Icon
					name='bullhorn'
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
				onPress={() => setActiveTab('group')}>
				<Icon
					name='account-group'
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
					onPress={() => setActiveTab('leadership')}>
					<Icon
						name='crown'
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

	const renderAnnouncements = () => {
		const filteredAnnouncements = getAnnouncementsByType(activeTab);

		return (
			<Animated.View
				entering={FadeInUp.duration(800)}
				style={styles.announcementsSection}>
				<Text style={styles.sectionTitle}>📌 Announcements</Text>
				{renderAnnouncementTabs()}

				{filteredAnnouncements.length === 0 ? (
					<Text style={styles.emptyText}>No announcements yet.</Text>
				) : (
					filteredAnnouncements.map((announcement) => (
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
	};

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
									name={event.isAttending ? 'check-circle' : 'plus-circle'}
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
		<ImageBackground
			source={require('../assets/bg.jpg')}
			style={styles.background}>
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
							<Icon name='logout' size={20} color='#e63946' />
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
						/>

						<TextInput
							style={[styles.modalInput, styles.modalTextArea]}
							placeholder='Announcement Content'
							multiline
							numberOfLines={4}
							placeholderTextColor='#999'
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.modalCancelButton}
								onPress={() => setShowCreateModal(false)}>
								<Text style={styles.modalCancelText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.modalSubmitButton}>
								<Text style={styles.modalSubmitText}>Post Announcement</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</ImageBackground>
	);
}
