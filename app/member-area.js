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
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/styles';

export default function MemberAreaScreen() {
	const router = useRouter();
	const { memberId, logout } = useContext(AuthContext);

	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState('general');
	const [member, setMember] = useState(null);
	const [announcements, setAnnouncements] = useState([]);
	const [loading, setLoading] = useState(true);
	const [tabLoading, setTabLoading] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	// Load member data when memberId changes
	useEffect(() => {
		if (memberId) {
			loadMemberData();
		} else if (!isLoggingOut) {
			Alert.alert('Error', 'Member ID not found. Please login again.', [
				{ text: 'OK', onPress: () => router.replace('/') },
			]);
		}
	}, [memberId, isLoggingOut]);

	const loadMemberData = async () => {
		try {
			setLoading(true);
			await Promise.all([loadMemberProfile(), loadAnnouncements(activeTab)]);
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

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadMemberData();
		setRefreshing(false);
	};

	const handleLogout = async () => {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Logout',
				onPress: async () => {
					setIsLoggingOut(true);
					await logout();
					router.replace('/');
				},
			},
		]);
	};

	const handleTabChange = async (newTab) => {
		if (newTab === activeTab) return;
		setActiveTab(newTab);
		await loadAnnouncements(newTab);
	};

	const getAnnouncementColor = (type) => {
		switch (type) {
			case 'general':
				return '#007bff';
			case 'youth':
			case 'men':
			case 'women':
			case 'children':
				return '#28a745';
			case 'leadership':
				return '#ffc107';
			default:
				return '#6c757d';
		}
	};

	const renderHeader = () => (
		<Animated.View
			entering={FadeInUp.duration(600)}
			style={styles.memberHeader}>
			<View style={styles.profileSection}>
				<View style={styles.profileImageContainer}>
					{member?.profile_photo_url ? (
						<Image
							source={{ uri: member.profile_photo_url }}
							style={styles.profileImage}
						/>
					) : (
						<View style={styles.defaultProfileImage}>
							<Icon name='account-outline' size={40} color='#fff' />
						</View>
					)}
					{member?.notifications > 0 && (
						<View style={styles.notificationBadge}>
							<Text style={styles.badgeText}>{member.notifications}</Text>
						</View>
					)}
				</View>
				<View style={styles.profileInfo}>
					<Text style={styles.memberName}>
						Welcome, {member?.first_name} {member?.last_name}
					</Text>
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
					style={styles.actionCard}
					onPress={() => router.push('/profile')}>
					<Icon name='account-circle-outline' size={24} color='#fff' />
					<Text style={styles.actionText}>My Profile</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.actionCard}
					onPress={() => router.push('/announcements')}>
					<Icon name='bullhorn-outline' size={24} color='#fff' />
					<Text style={styles.actionText}>Announcements</Text>
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
					color={activeTab === 'general' ? '#fff' : '#495057'}
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
					name='account-multiple-outline'
					size={16}
					color={activeTab === 'group' ? '#fff' : '#495057'}
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
			<Text style={styles.sectionTitle}>
				<Icon name='bullhorn-outline' size={20} color='#495057' /> Announcements
			</Text>
			{renderAnnouncementTabs()}

			{tabLoading ? (
				<View style={styles.tabLoadingContainer}>
					<Icon name='loading' size={30} color='#007bff' />
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
									{ backgroundColor: getAnnouncementColor(announcement.type) },
								]}
							/>
							<View style={styles.announcementMeta}>
								<Text style={styles.announcementTitle}>
									{announcement.isUrgent && (
										<Icon name='alert-circle' size={16} color='#d9534f' />
									)}
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

	const renderDemographicCorner = () => (
		<Animated.View
			entering={FadeInUp.duration(1000)}
			style={styles.demographicSection}>
			<Text style={styles.sectionTitle}>
				<Icon
					name={
						member?.demographic === 'youth'
							? 'bullseye-arrow'
							: member?.demographic === 'men'
							? 'face-man'
							: member?.demographic === 'women'
							? 'face-woman'
							: 'baby-face-outline'
					}
					size={20}
					color='#495057'
				/>{' '}
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
					<Icon name='loading' size={50} color='#007bff' />
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
					<Icon name='alert-circle' size={50} color='#d9534f' />
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
					{renderDemographicCorner()}

					<Animated.View
						entering={FadeInUp.duration(1100)}
						style={styles.logoutSection}>
						<TouchableOpacity
							style={styles.logoutButton}
							onPress={handleLogout}>
							<Icon name='logout-variant' size={20} color='#d9534f' />
							<Text style={styles.logoutText}>Logout</Text>
						</TouchableOpacity>
					</Animated.View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
