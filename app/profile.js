import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import apiService from '../api';
import { AuthContext } from './AuthContext'; // Correct path

const MyProfileScreen = () => {
	const { memberId, userToken } = useContext(AuthContext);
	const [memberData, setMemberData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const navigation = useNavigation();

	useEffect(() => {
		if (memberId) {
			fetchProfileData();
		}
	}, [memberId]);

	const fetchProfileData = async () => {
		try {
			const response = await apiService.get(
				`/get_member_profile.php?mid=${memberId}`
			);
			console.log('Profile data response:', response.data); // Added for debugging

			if (response.data.success) {
				setMemberData(response.data.data);
			} else {
				Alert.alert(
					'Error',
					response.data.message || 'Failed to fetch profile data.'
				);
			}
		} catch (error) {
			console.error('Error fetching profile data:', error); // Added for debugging
			Alert.alert('Error', 'An error occurred while fetching your profile.');
		} finally {
			setLoading(false);
		}
	};

        const handleChoosePhoto = async () => {
            console.log('handleChoosePhoto called');
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Permission result:', permissionResult);
    
            if (permissionResult.granted === false) {
                Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
                return;
            }
    
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'Images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            console.log('Picker result:', pickerResult);
    
            if (pickerResult.cancelled) {
                console.log('Image picking cancelled');
                return;
            }
    
            uploadImage(pickerResult.assets[0].uri);
        };
    
        const uploadImage = async (uri) => {
            console.log('Uploading image for memberId:', memberId);
    
            if (!memberId) {
                Alert.alert('Error', 'Member ID missing. Please log in again.');
                return;
            }
    
            setUploading(true);
    
            try {
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
    
                const formData = new FormData();
                formData.append('mid', String(memberId));
                formData.append('profile_photo', {
                    uri,
                    name: filename,
                    type,
                });
    
                const response = await apiService.post(
                    '/upload_profile_photo.php',
                    formData
                );
    
                console.log('Upload response:', response.data);
    
                if (response.data.success) {
                    setMemberData({
                        ...memberData,
                        profile_photo_url: response.data.data.profile_photo_url,
                    });
                    Alert.alert('Success', 'Profile photo updated successfully.');
                } else {
                    Alert.alert(
                        'Error',
                        response.data.message || 'Failed to upload photo.'
                    );
                }
            } catch (error) {
                console.error('Upload error:', error.response?.data || error.message);
                Alert.alert('Error', 'An error occurred while uploading the photo.');
            } finally {
                setUploading(false);
            }
        };
	const handleEditProfile = () => {
		navigation.navigate('edit-profile');
	};

	if (loading) {
		return (
			<ActivityIndicator
				style={pageStyles.loading}
				size='large'
				color='#007bff'
			/>
		);
	}

	if (!memberData) {
		return <Text style={pageStyles.errorText}>No profile data found.</Text>;
	}

	return (
		<ScrollView style={pageStyles.container}>
			<View style={pageStyles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={pageStyles.backButton}>
					<Ionicons name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={pageStyles.headerTitle}>My Profile</Text>
				<TouchableOpacity
					onPress={handleEditProfile}
					style={pageStyles.editButton}>
					<Ionicons name='create-outline' size={24} color='#fff' />
				</TouchableOpacity>
			</View>

			<View style={pageStyles.profileContainer}>
				<TouchableOpacity
					onPress={handleChoosePhoto}
					disabled={uploading}
					style={pageStyles.avatarContainer}>
					<Image
						source={
							memberData.profile_photo_url
								? { uri: memberData.profile_photo_url }
								: require('../assets/icon.png')
						}
						style={pageStyles.avatar}
					/>
					<View style={pageStyles.cameraIcon}>
						<Ionicons name='camera' size={20} color='#fff' />
					</View>
					{uploading && (
						<ActivityIndicator
							style={pageStyles.uploadingIndicator}
							size='large'
							color='#fff'
						/>
					)}
				</TouchableOpacity>
				<Text
					style={
						pageStyles.name
					}>{`${memberData.first_name} ${memberData.last_name}`}</Text>
				<Text style={pageStyles.bio}>Member</Text>
			</View>

			<View style={pageStyles.infoSection}>
				<InfoRow
					icon='person-outline'
					label='Gender'
					value={memberData.gender}
				/>
				<InfoRow
					icon='calendar-outline'
					label='Date of Birth'
					value={memberData.dob}
				/>
				<InfoRow
					icon='home-outline'
					label='Address'
					value={memberData.address}
				/>
				<InfoRow
					icon='call-outline'
					label='Phone Number'
					value={memberData.phone_number}
				/>
			</View>
		</ScrollView>
	);
};

const InfoRow = ({ icon, label, value }) => (
	<View style={pageStyles.infoRow}>
		<Ionicons
			name={icon}
			size={24}
			color='#007bff'
			style={pageStyles.infoIcon}
		/>
		<View>
			<Text style={pageStyles.infoLabel}>{label}</Text>
			<Text style={pageStyles.infoValue}>{value}</Text>
		</View>
	</View>
);

const pageStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f2f5',
	},
	loading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		textAlign: 'center',
		marginTop: 20,
		fontSize: 16,
		color: '#666',
	},
	header: {
		backgroundColor: '#007bff',
		paddingTop: 50,
		paddingBottom: 20,
		paddingHorizontal: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
	},
	backButton: {
		padding: 5,
	},
	editButton: {
		padding: 5,
	},
	profileContainer: {
		alignItems: 'center',
		marginTop: -50,
	},
	avatarContainer: {
		position: 'relative',
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 4,
		borderColor: '#fff',
	},
	cameraIcon: {
		position: 'absolute',
		bottom: 5,
		right: 5,
		backgroundColor: '#007bff',
		borderRadius: 15,
		padding: 5,
	},
	uploadingIndicator: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.3)',
		borderRadius: 60,
	},
	name: {
		marginTop: 15,
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
	},
	bio: {
		marginTop: 5,
		fontSize: 16,
		color: '#666',
	},
	infoSection: {
		marginTop: 30,
		paddingHorizontal: 20,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 15,
		marginBottom: 15,
	},
	infoIcon: {
		marginRight: 15,
	},
	infoLabel: {
		fontSize: 14,
		color: '#666',
	},
	infoValue: {
		fontSize: 16,
		color: '#333',
		fontWeight: '500',
	},
});

export default MyProfileScreen;
