import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TextInput,
	View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '../api';
import PushNotificationService from '../services/pushNotificationService';
import styles from '../styles/styles';

export default function CreateAccountScreen() {
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [pushToken, setPushToken] = useState(null);
	const router = useRouter();

	useEffect(() => {
		// Initialize push notifications when component mounts
		initializePushNotifications();
	}, []);

	const initializePushNotifications = async () => {
		try {
			const token = await PushNotificationService.initialize();
			if (token) {
				setPushToken(token);
				console.log('Push token obtained:', token);
			} else {
				console.log('Failed to get push token');
				// You might want to show a warning to the user
				Alert.alert(
					'Notification Permission',
					'Push notifications are disabled. You may not receive OTP notifications.',
					[{ text: 'OK' }]
				);
			}
		} catch (error) {
			console.error('Push notification initialization error:', error);
		}
	};

	const handleCreateAccount = async () => {
		if (!phone || !password || !confirmPassword) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert('Error', 'Passwords do not match');
			return;
		}

		if (password.length < 6) {
			Alert.alert('Error', 'Password must be at least 6 characters');
			return;
		}

		setLoading(true);
		try {
			const requestData = {
				phone_number: phone,
				password,
			};

			// Include push token if available
			if (pushToken) {
				requestData.push_token = pushToken;
			}

			const res = await api.post('/create_account.php', requestData);

			if (res.data.success) {
				if (res.data.notification_sent) {
					Alert.alert(
						'Account Created',
						'Account created successfully! Check your notifications for the OTP.',
						[
							{
								text: 'OK',
								onPress: () =>
									router.push({
										pathname: '/otp-verification',
										params: {
											phone_number: phone,
											has_push_notifications: 'true',
										},
									}),
							},
						]
					);
				} else {
					Alert.alert(
						'Account Created',
						'Account created successfully! You will need to enter the OTP manually.',
						[
							{
								text: 'OK',
								onPress: () =>
									router.push({
										pathname: '/otp-verification',
										params: {
											phone_number: phone,
											has_push_notifications: 'false',
										},
									}),
							},
						]
					);
				}
			} else {
				Alert.alert('Error', res.data.message || 'Account creation failed');
			}
		} catch (err) {
			console.error('Account creation error:', err);
			Alert.alert('Error', 'Server error occurred');
		} finally {
			setLoading(false);
		}
	};

	return (
		<ImageBackground
			source={require('../assets/bg.jpg')}
			style={styles.background}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
					<View style={styles.container}>
						<Animated.Text
							entering={FadeInUp.duration(700)}
							style={styles.title}>
							Create Account
						</Animated.Text>

						<Animated.View
							entering={FadeInUp.delay(200)}
							style={styles.inputRow}>
							<Icon name='phone' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='Phone Number'
								value={phone}
								onChangeText={setPhone}
								keyboardType='phone-pad'
							/>
						</Animated.View>

						<View style={styles.inputRow}>
							<Icon name='lock' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='Password'
								value={password}
								onChangeText={setPassword}
								secureTextEntry
							/>
						</View>

						<View style={styles.inputRow}>
							<Icon name='lock-outline' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='Confirm Password'
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry
							/>
						</View>

						<View style={styles.buttonContainer}>
							<Button
								title={loading ? 'Creating Account...' : 'Create Account'}
								onPress={handleCreateAccount}
								disabled={loading}
							/>
						</View>

						{!pushToken && (
							<Animated.View
								entering={FadeInUp.delay(800)}
								style={styles.warningContainer}>
								<Icon name='warning' size={20} color='#ff9800' />
								<Text style={styles.warningText}>
									Push notifications disabled. Enable them for OTP delivery.
								</Text>
							</Animated.View>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
