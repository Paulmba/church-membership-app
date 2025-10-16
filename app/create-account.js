import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '../api';
import pushNotificationService from '../services/pushNotificationService';
import styles from '../styles/styles';

export default function CreateAccountScreen() {
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [pushToken, setPushToken] = useState(null);
	const router = useRouter();

	useEffect(() => {
		initializePushNotifications();
	}, []);

	const initializePushNotifications = async () => {
		try {
			const token = await pushNotificationService.initialize();
			if (token) {
				setPushToken(token);
			}
		} catch (error) {
			console.error('Push notification initialization error:', error);
		}
	};

	const getPasswordStrength = () => {
		const length = password.length;
		if (length === 0) return { strength: 'none', color: '#ced4da' };
		if (length < 6) return { strength: 'Weak', color: '#dc3545' };
		if (length < 10) return { strength: 'Medium', color: '#ffc107' };
		return { strength: 'Strong', color: '#28a745' };
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
			const requestData = { phone_number: phone, password };

			if (pushToken) requestData.push_token = pushToken;

			const res = await api.auth.createAccount(requestData);

			if (res.data.success) {
				router.push({
					pathname: '/otp-verification',
					params: { phone_number: phone },
				});
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

	const { strength, color } = getPasswordStrength();

	return (
		<ImageBackground
			source={require('../assets/bg.jpg')}
			style={styles.background}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					<View style={styles.container}>
						<Animated.View entering={FadeInUp.duration(700)}>
							<Text style={styles.title}>Join Us</Text>
						</Animated.View>

						<BlurView intensity={80} tint='light' style={styles.formContainer}>
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
									placeholderTextColor='#6c757d'
								/>
							</Animated.View>

							<Animated.View
								entering={FadeInUp.delay(400)}
								style={styles.inputRow}>
								<Icon name='lock' size={24} color='#555' />
								<TextInput
									style={styles.inputField}
									placeholder='Password'
									value={password}
									onChangeText={setPassword}
									secureTextEntry
									placeholderTextColor='#6c757d'
								/>
							</Animated.View>

							{password.length > 0 && (
								<View style={styles.strengthIndicatorContainer}>
									<View
										style={[
											styles.strengthIndicator,
											{ backgroundColor: color },
										]}></View>
									<Text style={[styles.strengthText, { color }]}>
										{strength}
									</Text>
								</View>
							)}

							<Animated.View
								entering={FadeInUp.delay(600)}
								style={styles.inputRow}>
								<Icon name='lock-outline' size={24} color='#555' />
								<TextInput
									style={styles.inputField}
									placeholder='Confirm Password'
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry
									placeholderTextColor='#6c757d'
								/>
							</Animated.View>

							<Animated.View entering={FadeInUp.delay(800)}>
								<TouchableOpacity
									style={styles.primaryButton}
									onPress={handleCreateAccount}
									disabled={loading}>
									<Text style={styles.primaryButtonText}>
										{loading ? 'Creating Account...' : 'Create Account'}
									</Text>
								</TouchableOpacity>
							</Animated.View>
						</BlurView>

						<Animated.View entering={FadeInUp.delay(900)}>
							<TouchableOpacity
								style={styles.linkContainer}
								onPress={() => router.back()}>
								<Text style={styles.linkText}>
									Already have an account? Login
								</Text>
							</TouchableOpacity>
						</Animated.View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
