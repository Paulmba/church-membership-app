import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
	Alert,
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../api';
import styles from '../styles/styles';
import { AuthContext } from './AuthContext';

export default function MemberAreaScreen() {
	const router = useRouter();
	const { memberId, logout } = useContext(AuthContext);

	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState('general');
	const [member, setMember] = useState(null);
	const [announcements, setAnnouncements] = useState([]);
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [tabLoading, setTabLoading] = useState(false);

	useEffect(() => {
		if (memberId) {
			loadMemberData();
		} else {
			Alert.alert('Error', 'Member ID not found. Please login again.');
			logout && logout();
		}
	}, [memberId]);

	const loadMemberData = async () => {
		try {
			setLoading(true);
			await Promise.all([
				loadMemberProfile(),
				loadAnnouncements(activeTab),
				loadEvents(),
			]);
		} catch (error) {
			console.error('Error loading member data:', error);
			Alert.alert('Error', 'Failed to load member data. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const loadMemberProfile = async () => {
		try {
			const response = await apiService.member.getProfile(memberId);

			if (response.data.success) {
				setMember(response.data.data);
			} else {
				throw new Error(response.data.message || 'Failed to load profile');
			}
		} catch (error) {
			console.error('Error loading member profile:', error);
			throw error;
		}
	};

	const loadAnnouncements = async (tab = activeTab) => {
		try {
			setTabLoading(true);
			const response = await apiService.member.getAnnouncements(memberId, tab);

			if (response.data.success) {
				setAnnouncements(response.data.data || []);
			} else {
				throw new Error(
					response.data.message || 'Failed to load announcements'
				);
			}
		} catch (error) {
			console.error('Error loading announcements:', error);
		} finally {
			setTabLoading(false);
		}
	};

	const loadEvents = async () => {
		try {
			const response = await apiService.member.getEvents(memberId);

			if (response.data.success) {
				const normalized = (response.data.data || []).map((e) => ({
					...e,
					attendees: Number(e.attendees) || 0,
					isAttending: !!e.isAttending,
				}));
				setEvents(normalized);
			} else {
				throw new Error(response.data.message || 'Failed to load events');
			}
		} catch (error) {
			console.error('Error loading events:', error);
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
			{ text: 'Logout', onPress: () => logout && logout() },
		]);
	};

	const handleTabChange = async (newTab) => {
		if (newTab === activeTab) return;
		setActiveTab(newTab);
		await loadAnnouncements(newTab);
	};

	const handleRSVP = async (eventId, attending) => {
		try {
			// Optimistic update
			setEvents((prev) =>
				prev.map((ev) =>
					ev.id === eventId
						? {
								...ev,
								isAttending: attending,
								attendees: attending
									? ev.attendees + 1
									: Math.max(ev.attendees - 1, 0),
						  }
						: ev
				)
			);

			const response = await apiService.member.rsvpEvent({
				member_id: memberId,
				event_id: eventId,
				attending: attending ? 1 : 0,
			});

			if (response.data.success) {
				await loadEvents();
			} else {
				// Revert on failure
				setEvents((prev) =>
					prev.map((ev) =>
						ev.id === eventId
							? {
									...ev,
									isAttending: !attending,
									attendees: attending
										? Math.max(ev.attendees - 1, 0)
										: ev.attendees + 1,
							  }
							: ev
					)
				);
				Alert.alert('Error', response.data.message || 'Failed to update RSVP');
			}
		} catch (error) {
			console.error('Error updating RSVP:', error);
			// Revert on error
			setEvents((prev) =>
				prev.map((ev) =>
					ev.id === eventId
						? {
								...ev,
								isAttending: !attending,
								attendees: attending
									? Math.max(ev.attendees - 1, 0)
									: ev.attendees + 1,
						  }
						: ev
				)
			);
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
					<Text style={styles.memberRole}>Member</Text>
					<View style={styles.tagContainer}>
						<Text
							style={[
								styles.demographicTag,
								{ backgroundColor: getAnnouncementColor(member?.demographic) },
							]}>
							{member?.demographic?.toUpperCase() ?? ''}
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
				<TouchableOpacity
					style={[styles.actionCard, { backgroundColor: '#27ae60' }]}
					onPress={() => router.push('/events')}>
					<Icon name='calendar-month' size={24} color='#fff' />
					<Text style={styles.actionText}>View Events</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.actionCard, { backgroundColor: '#3498db' }]}
					onPress={() => router.push('/profile')}>
					<Icon name='account-circle' size={24} color='#fff' />
					<Text style={styles.actionText}>My Profile</Text>
				</TouchableOpacity>
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
		</View>
	);

	const renderAnnouncements = () => (
		<Animated.View
			entering={FadeInUp.duration(800)}
			style={styles.announcementsSection}>
			<Text style={styles.sectionTitle}>📌 Announcements</Text>
			{renderAnnouncementTabs()}

			{tabLoading ? (
				<View style={styles.tabLoadingContainer}>
					<Icon name='loading' size={30} color='#666' />
				</View>
			) : announcements.length === 0 ? (
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
									name={
										event.isAttending
											? 'check-circle-outline'
											: 'plus-circle-outline'
									}
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
				{member?.demographic?.toUpperCase() ?? ''} Corner
			</Text>
			<View style={styles.resourceCard}>
				<Text style={styles.resourceTitle}>Weekly Devotional</Text>
				<Text style={styles.resourceContent}>
					This week's theme: "Walking in Faith" - Join your{' '}
					{member?.demographic} group for special studies and fellowship.
				</Text>
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

	if (!member) {
		return (
			<ImageBackground
				source={require('../assets/bg.jpg')}
				style={styles.background}>
				<View style={styles.loadingContainer}>
					<Icon name='alert-circle' size={50} color='#e63946' />
					<Text style={styles.loadingText}>Failed to load member data</Text>
					<TouchableOpacity style={styles.retryButton} onPress={loadMemberData}>
						<Text style={styles.retryButtonText}>Retry</Text>
					</TouchableOpacity>
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
		</View>
	);
}