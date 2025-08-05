import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
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
	View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '../api';
import styles from '../styles/styles';

export default function RegisterScreen() {
	const router = useRouter();

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [gender, setGender] = useState('M');
	const [dob, setDob] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [address, setAddress] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [loading, setLoading] = useState(false);

	const handleRegister = async () => {
		if (!firstName || !lastName || !address || !phoneNumber) {
			Alert.alert('Error', 'Please fill in all required fields');
			return;
		}

		setLoading(true);
		try {
			const res = await api.post('/complete_registration.php', {
				first_name: firstName,
				last_name: lastName,
				gender,
				dob: dob.toISOString().split('T')[0],
				address,
				phone_number: phoneNumber,
			});

			if (res.data.success) {
				Alert.alert('Success', 'Registration completed successfully!', [
					{
						text: 'OK',
						onPress: () => router.replace('/member-area'),
					},
				]);
			} else {
				Alert.alert('Error', res.data.message || 'Registration failed');
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
			style={styles.background}
			resizeMode='cover'>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
					<View style={styles.container}>
						<Animated.Text
							entering={FadeInUp.duration(700)}
							style={styles.title}>
							Complete Your Profile
						</Animated.Text>

						<Text style={styles.subtitle}>
							Please fill in your details to complete registration
						</Text>

						<Animated.View
							entering={FadeInUp.delay(200)}
							style={styles.inputRow}>
							<Icon name='person' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='First Name *'
								value={firstName}
								onChangeText={setFirstName}
							/>
						</Animated.View>

						<View style={styles.inputRow}>
							<Icon name='person-outline' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='Last Name *'
								value={lastName}
								onChangeText={setLastName}
							/>
						</View>

						<Text style={styles.label}>Gender</Text>
						<Picker
							selectedValue={gender}
							style={styles.picker}
							onValueChange={setGender}>
							<Picker.Item label='Male' value='M' />
							<Picker.Item label='Female' value='F' />
						</Picker>

						<Text style={styles.label}>Date of Birth</Text>
						<View
							style={styles.dateInput}
							onTouchStart={() => setShowDatePicker(true)}>
							<Text>{dob.toDateString()}</Text>
						</View>
						{showDatePicker && (
							<DateTimePicker
								value={dob}
								mode='date'
								display='default'
								onChange={(event, selectedDate) => {
									setShowDatePicker(false);
									if (selectedDate) setDob(selectedDate);
								}}
							/>
						)}

						<View style={styles.inputRow}>
							<Icon name='home' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='Address *'
								value={address}
								onChangeText={setAddress}
								multiline
							/>
						</View>

						<View style={styles.inputRow}>
							<Icon name='phone' size={24} color='#555' />
							<TextInput
								style={styles.inputField}
								placeholder='Phone Number *'
								value={phoneNumber}
								keyboardType='phone-pad'
								onChangeText={setPhoneNumber}
							/>
						</View>
						<Animated.View
							entering={FadeInUp.delay(600)}
							style={styles.buttonContainer}>
							<Button
								title={loading ? 'Registering...' : 'Register'}
								onPress={handleRegister}
								disabled={loading}
							/>
						</Animated.View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
