import { Stack } from 'expo-router';
import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from '../context/AuthContext';

const RootLayout = () => {
	const { userToken } = useContext(AuthContext);

	return (
		<Stack>
			{userToken ? (
				<Stack.Group>
					<Stack.Screen name='member-area' options={{ headerShown: false }} />
					<Stack.Screen
						name='profile'
						options={{ headerShown: false, title: 'My Profile' }}
					/>
					<Stack.Screen
						name='announcements'
						options={{ headerShown: false, title: 'Announcements' }}
					/>
					<Stack.Screen name='edit-profile' options={{ headerShown: false }} />
				</Stack.Group>
			) : (
				<Stack.Screen name='index' options={{ headerShown: false }} />
			)}
			<Stack.Screen
				name='create-account'
				options={{ headerShown: false, title: 'Create Account' }}
			/>
			<Stack.Screen
				name='otp-verification'
				options={{ headerShown: false, title: 'OTP Verification' }}
			/>
			<Stack.Screen
				name='register'
				options={{ headerShown: false, title: 'Register' }}
			/>
		</Stack>
	);
};

export default function Layout() {
	return (
		<AuthProvider>
			<RootLayout />
		</AuthProvider>
	);
}
