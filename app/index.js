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

export default function LoginScreen() {
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter();

	const handleLogin = async () => {
		try {
			const res = await api.post('/login.php', {
				phone_number: phone,
				password,
			});

			if (res.data.success) {
				router.push('/member-area');
			} else {
				Alert.alert('Login Failed', res.data.message);
			}
		} catch (error) {
			Alert.alert('Error', 'Login request failed');
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

						<Button title='Login' onPress={handleLogin} />
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
