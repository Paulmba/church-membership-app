import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Button,
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
import styles from '../styles/styles';

export default function OTPVerificationScreen() {
	const [otp, setOtp] = useState('');
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [countdown, setCountdown] = useState(60);
	const [canResend, setCanResend] = useState(false);

	const router = useRouter();
	const { phone_number } = useLocalSearchParams();

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		} else {
			setCanResend(true);
		}
	}, [countdown]);

	const handleVerifyOTP = async () => {
		if (!otp || otp.length !== 6) {
			Alert.alert('Error', 'Please enter a valid 6-digit OTP');
			return;
		}
		console.log('Phone number:', phone_number);
		console.log('OTP entered:', otp);
		console.log('OTP type:', typeof otp);
		console.log('OTP length:', otp.length);

		setLoading(true);
		try {
			const res = await api.post('/verify_otp.php', {
				phone_number,
				otp_code: otp.toString().trim(),
			});

			if (res.data.success) {
				Alert.alert('Success', 'Account verified successfully!', [
					{
						text: 'OK',
						onPress: () => router.replace('/'), // Go back to login
					},
				]);
			} else {
				Alert.alert('Error', res.data.message);
			}
		} catch (error) {
			Alert.alert('Error', 'Verification failed');
		} finally {
			setLoading(false);
		}
	};

	const handleResendOTP = async () => {
		setResendLoading(true);
		try {
			const res = await api.post('/resend_otp.php', {
				phone_number,
			});

			if (res.data.success) {
				setCountdown(60);
				setCanResend(false);
				Alert.alert('Success', 'OTP sent successfully!');
			} else {
				Alert.alert('Error', res.data.message);
			}
		} catch (error) {
			Alert.alert('Error', 'Failed to resend OTP');
		} finally {
			setResendLoading(false);
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
							Verify OTP
						</Animated.Text>

						<Text style={styles.otpSubtitle}>
							Enter the 6-digit code sent to {phone_number}
						</Text>

						<Animated.View
							entering={FadeInUp.delay(200)}
							style={styles.inputRow}>
							<Icon name='security' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='Enter OTP'
								value={otp}
								onChangeText={setOtp}
								keyboardType='numeric'
								maxLength={6}
							/>
						</Animated.View>

						<View style={styles.buttonContainer}>
							<Button
								title={loading ? 'Verifying...' : 'Verify OTP'}
								onPress={handleVerifyOTP}
								disabled={loading}
							/>
						</View>

						<View style={styles.resendContainer}>
							{canResend ? (
								<TouchableOpacity
									onPress={handleResendOTP}
									disabled={resendLoading}>
									<Text style={styles.linkText}>
										{resendLoading ? 'Sending...' : 'Resend OTP'}
									</Text>
								</TouchableOpacity>
							) : (
								<Text style={styles.countdownText}>
									Resend OTP in {countdown}s
								</Text>
							)}
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
