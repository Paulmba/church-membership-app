import { useRouter } from 'expo-router';
import React from 'react';
import {
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/styles';

export default function MemberAreaScreen() {
	const router = useRouter();

	const handleLogout = () => {
		console.log('Logging out...');
		router.replace('/'); // Use root instead of /index
	};

	return (
		<ImageBackground
			source={require('../assets/bg.jpg')}
			style={styles.background}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.container}>
					<Animated.View entering={FadeInUp.duration(700)}>
						<Text style={styles.title}> Welcome to Member Area</Text>

						<View style={styles.iconRow}>
							<TouchableOpacity style={styles.card} onPress={() => {}}>
								<Icon name='account-circle-outline' size={30} color='#444' />
								<Text style={styles.cardText}>Profile</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.card} onPress={() => {}}>
								<Icon name='calendar-month-outline' size={30} color='#444' />
								<Text style={styles.cardText}>Events</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.card} onPress={() => {}}>
								<Icon name='phone-outline' size={30} color='#444' />
								<Text style={styles.cardText}>prayer line</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.card} onPress={handleLogout}>
								<Icon name='logout' size={30} color='#e63946' />
								<Text style={[styles.cardText, { color: '#e63946' }]}>
									Logout
								</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.sectionBox}>
							<Text style={styles.sectionTitle}>📌 Announcements</Text>
							<Text style={styles.sectionContent}>- No announcements yet.</Text>
						</View>
					</Animated.View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
