import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function LoginScreen() {
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async () => {
		if (!phone || !password) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		setLoading(true);
		try {
			const res = await api.post('/login.php', {
				phone_number: phone,
				password,
			});

			if (res.data.success) {
				// Check if user needs to complete registration
				if (res.data.needs_registration) {
					router.push('/register');
				} else {
					router.push('/member-area');
				}
			} else {
				Alert.alert('Login Failed', res.data.message);
			}
		} catch (error) {
			Alert.alert('Error', 'Login request failed');
		} finally {
			setLoading(false);
		}
	};

	const handleCreateAccount = () => {
		router.push('/create-account');
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
							Login
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

						<View style={styles.buttonContainer}>
							<Button
								title={loading ? 'Logging in...' : 'Login'}
								onPress={handleLogin}
								disabled={loading}
							/>
						</View>

						<TouchableOpacity
							style={styles.linkContainer}
							onPress={handleCreateAccount}>
							<Text style={styles.linkText}>New user? Create account</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
