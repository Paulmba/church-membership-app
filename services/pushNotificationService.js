// services/pushNotificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is running
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

class PushNotificationService {
	constructor() {
		this.expoPushToken = null;
		this.notificationListener = null;
		this.responseListener = null;
	}

	// Initialize push notifications
	async initialize() {
		try {
			// Check if device supports push notifications
			if (!Device.isDevice) {
				console.log('Must use physical device for Push Notifications');
				return null;
			}

			// Request permissions
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}

			if (finalStatus !== 'granted') {
				console.log('Failed to get push token for push notification!');
				return null;
			}

			// Get the token
			const token = await Notifications.getExpoPushTokenAsync();
			this.expoPushToken = token.data;

			// Store token locally
			await AsyncStorage.setItem('expoPushToken', this.expoPushToken);

			console.log('Expo Push Token:', this.expoPushToken);

			// Configure notification channel for Android
			if (Platform.OS === 'android') {
				await Notifications.setNotificationChannelAsync('otp-channel', {
					name: 'OTP Notifications',
					importance: Notifications.AndroidImportance.MAX,
					vibrationPattern: [0, 250, 250, 250],
					lightColor: '#FF231F7C',
					sound: 'default',
				});
			}

			return this.expoPushToken;
		} catch (error) {
			console.error('Error initializing push notifications:', error);
			return null;
		}
	}

	// Set up notification listeners
	setupNotificationListeners(onOTPReceived) {
		// Listen for notifications when app is in foreground
		this.notificationListener = Notifications.addNotificationReceivedListener(
			(notification) => {
				const { data } = notification.request.content;
				if (data && data.type === 'otp') {
					onOTPReceived(data.otp, data.phone_number);
				}
			}
		);

		// Listen for notification responses (when user taps notification)
		this.responseListener =
			Notifications.addNotificationResponseReceivedListener((response) => {
				const { data } = response.notification.request.content;
				if (data && data.type === 'otp') {
					onOTPReceived(data.otp, data.phone_number);
				}
			});
	}

	// Clean up listeners
	removeNotificationListeners() {
		if (this.notificationListener) {
			Notifications.removeNotificationSubscription(this.notificationListener);
		}
		if (this.responseListener) {
			Notifications.removeNotificationSubscription(this.responseListener);
		}
	}

	// Get stored push token
	async getPushToken() {
		if (this.expoPushToken) {
			return this.expoPushToken;
		}

		try {
			const storedToken = await AsyncStorage.getItem('expoPushToken');
			if (storedToken) {
				this.expoPushToken = storedToken;
				return storedToken;
			}

			// Initialize if no token exists
			return await this.initialize();
		} catch (error) {
			console.error('Error getting push token:', error);
			return null;
		}
	}

	// Send local notification (for testing)
	async sendLocalOTPNotification(otp, phoneNumber) {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: 'Church App - Verification Code',
				body: `Your verification code is: ${otp}`,
				data: {
					type: 'otp',
					otp: otp,
					phone_number: phoneNumber,
				},
				sound: 'default',
				priority: Notifications.AndroidNotificationPriority.HIGH,
			},
			trigger: null, // Show immediately
		});
	}
}

export default new PushNotificationService();
