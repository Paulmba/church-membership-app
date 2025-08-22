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
import PushNotificationService from '../services/pushNotificationService';
import styles from '../styles/styles';

export default function OTPVerificationScreen() {
	const [otp, setOtp] = useState('');
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [countdown, setCountdown] = useState(60);
	const [canResend, setCanResend] = useState(false);

	const router = useRouter();
	const { phone_number, has_push_notifications } = useLocalSearchParams();

	const hasPushNotifications = has_push_notifications === 'true';

	useEffect(() => {
		// Set up push notification listeners
		if (hasPushNotifications) {
			PushNotificationService.setupNotificationListeners(handleOTPReceived);
		}

		// Cleanup function
		return () => {
			if (hasPushNotifications) {
				PushNotificationService.removeNotificationListeners();
			}
		};
	}, [hasPushNotifications]);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		} else {
			setCanResend(true);
		}
	}, [countdown]);

	const handleOTPReceived = (receivedOTP, receivedPhoneNumber) => {
		console.log('OTP received via push notification:', receivedOTP);

		// Verify the phone number matches
		if (receivedPhoneNumber === phone_number) {
			setOtp(receivedOTP);
			Alert.alert(
				'OTP Received',
				`Verification code received: ${receivedOTP}`,
				[
					{
						text: 'Auto-Verify',
						onPress: () => verifyOTPWithCode(receivedOTP),
					},
					{
						text: 'Cancel',
						style: 'cancel',
					},
				]
			);
		}
	};

	const verifyOTPWithCode = async (otpCode) => {
		const codeToVerify = otpCode || otp;

		if (!codeToVerify || codeToVerify.length !== 6) {
			Alert.alert('Error', 'Please enter a valid 6-digit OTP');
			return;
		}

		setLoading(true);
		try {
			const res = await api.post('/verify_otp.php', {
				phone_number,
				otp_code: codeToVerify.toString().trim(),
			});

			if (res.data.success) {
				Alert.alert('Success', 'Account verified successfully!', [
					{
						text: 'OK',
						onPress: () => router.replace('/'),
					},
				]);
			} else {
				Alert.alert('Error', res.data.message);
			}
		} catch (error) {
			console.error('OTP verification error:', error);
			Alert.alert('Error', 'Verification failed');
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = () => {
		verifyOTPWithCode();
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

				if (res.data.notification_sent) {
					Alert.alert(
						'Success',
						'OTP sent successfully via push notification!'
					);
				} else {
					Alert.alert('Success', 'OTP generated. Check your app for the code.');
				}
			} else {
				Alert.alert('Error', res.data.message);
			}
		} catch (error) {
			console.error('Resend OTP error:', error);
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
							Enter the 6-digit code{' '}
							{hasPushNotifications ? 'sent to your notifications' : 'sent to'}{' '}
							for {phone_number}
						</Text>

						{hasPushNotifications && (
							<Animated.View
								entering={FadeInUp.delay(100)}
								style={styles.notificationInfo}>
								<Icon name='notifications-active' size={20} color='#4CAF50' />
								<Text style={styles.notificationText}>
									OTP will be delivered via push notification
								</Text>
							</Animated.View>
						)}

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

						{hasPushNotifications && (
							<Animated.View
								entering={FadeInUp.delay(600)}
								style={styles.instructionContainer}>
								<Icon name='info-outline' size={18} color='#2196F3' />
								<Text style={styles.instructionText}>
									The OTP will appear in your notifications. Tap the
									notification to auto-fill the code.
								</Text>
							</Animated.View>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
