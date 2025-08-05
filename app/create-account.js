import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import styles from '../styles/styles';

export default function CreateAccountScreen() {
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

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
			const res = await api.post('/create_account.php', {
				phone_number: phone,
				password,
			});

			if (res.data.success) {
				// Always redirect to OTP verification
				// After OTP verification, user will go to login
				// Login will determine if they need registration or go to member area
				router.push({
					pathname: '/otp-verification',
					params: {
						phone_number: phone,
					},
				});
			} else {
				Alert.alert('Error', res.data.message || 'Account creation failed');
			}
		} catch (err) {
			Alert.alert('Error', 'Server error');
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
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
