
import { AuthProvider, AuthContext } from './AuthContext';
import { Stack } from 'expo-router';
import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';

const RootLayout = () => {
  const { userToken } = useContext(AuthContext);

  return (
    <Stack>
      {userToken ? (
        <Stack.Screen name="member-area" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="index" options={{ headerShown: false }} />
      )}
       <Stack.Screen name="create-account" options={{ headerShown: true, title: 'Create Account' }} />
       <Stack.Screen name="otp-verification" options={{ headerShown: true, title: 'OTP Verification' }} />
       <Stack.Screen name="register" options={{ headerShown: true, title: 'Register' }} />
    </Stack>
  );
};

export default function Layout() {
    return (
        <AuthProvider>
            <RootLayout />
        </AuthProvider>
    )
}
