import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

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
	const { login } = useContext(AuthContext);

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
                await login(res.data.token, res.data.member_id);
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
				<ScrollView contentContainerStyle={styles.professionalScrollContainer}>
					<View style={styles.professionalContainer}>
						<Animated.View entering={FadeInUp.duration(700)}>
							<Text style={styles.professionalTitle}>Complete Your Profile</Text>
							<Text style={styles.professionalSubtitle}>
								Tell us a bit more about yourself.
							</Text>
						</Animated.View>

						<View style={styles.solidFormContainer}>
                            <Text style={styles.formLabel}>First Name</Text>
							<View style={styles.inputRow}>
								<Icon name='person' size={24} color='#555' />
								<TextInput
									style={styles.inputField}
									placeholder='First Name *'
									value={firstName}
									onChangeText={setFirstName}
									placeholderTextColor='#6c757d'
								/>
							</View>

                            <Text style={styles.formLabel}>Last Name</Text>
							<View style={styles.inputRow}>
								<Icon name='person-outline' size={24} color='#555' />
								<TextInput
									style={styles.inputField}
									placeholder='Last Name *'
									value={lastName}
									onChangeText={setLastName}
									placeholderTextColor='#6c757d'
								/>
							</View>

                            <Text style={styles.formLabel}>Gender</Text>
							<View style={styles.proGenderSelector}>
								<TouchableOpacity
									style={[
										styles.proGenderOption,
										gender === 'M' && styles.proGenderOptionSelected,
									]}
									onPress={() => setGender('M')}>
									<Text style={[styles.proGenderText, gender === 'M' && styles.proGenderTextSelected]}>Male</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.proGenderOption,
										gender === 'F' && styles.proGenderOptionSelected,
									]}
									onPress={() => setGender('F')}>
									<Text style={[styles.proGenderText, gender === 'F' && styles.proGenderTextSelected]}>Female</Text>
								</TouchableOpacity>
							</View>

                            <Text style={styles.formLabel}>Date of Birth</Text>
							<TouchableOpacity
								style={styles.inputRow}
								onPress={() => setShowDatePicker(true)}>
								<Icon name='cake' size={24} color='#555' />
								<Text style={styles.dateText}>{dob.toDateString()}</Text>
							</TouchableOpacity>

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

                            <Text style={styles.formLabel}>Address</Text>
							<View style={styles.inputRow}>
								<Icon name='home' size={24} color='#555' />
								<TextInput
									style={styles.inputField}
									placeholder='Address *'
									value={address}
									onChangeText={setAddress}
									placeholderTextColor='#6c757d'
								/>
							</View>

                            <Text style={styles.formLabel}>Phone Number</Text>
							<View style={styles.inputRow}>
								<Icon name='phone' size={24} color='#555' />
								<TextInput
									style={styles.inputField}
									placeholder='Phone Number *'
									value={phoneNumber}
									keyboardType='phone-pad'
									onChangeText={setPhoneNumber}
									placeholderTextColor='#6c757d'
								/>
							</View>

							<TouchableOpacity
								style={styles.primaryButton}
									onPress={handleRegister}
									disabled={loading}>
								<Text style={styles.primaryButtonText}>
									{loading ? 'Completing Registration...' : 'Register'}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}
