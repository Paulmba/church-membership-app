// app/AuthContext.js - Simplified without role-based access control

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [userToken, setUserToken] = useState(null);
	const [memberId, setMemberId] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);

	// Load stored auth data on app start
	useEffect(() => {
		loadStoredAuth();
	}, []);

	const loadStoredAuth = async () => {
		try {
			setAuthLoading(true);
			const token = await AsyncStorage.getItem('token');
			const storedMemberId = await AsyncStorage.getItem('member_id');

			if (token && storedMemberId) {
				setUserToken(token);
				setMemberId(storedMemberId);
			}
		} catch (error) {
			console.error('Error loading auth data:', error);
		} finally {
			setAuthLoading(false);
		}
	};

	const login = async (token, memberId) => {
		try {
			// Store auth data
			await AsyncStorage.multiSet([
				['token', token],
				['member_id', String(memberId)],
			]);

			// Update state
			setUserToken(token);
			setMemberId(String(memberId));

			return true;
		} catch (error) {
			console.error('Error storing auth data:', error);
			return false;
		}
	};

	const logout = async () => {
		try {
			// Clear storage
			await AsyncStorage.multiRemove(['token', 'member_id']);

			// Clear state
			setUserToken(null);
			setMemberId(null);

			return true;
		} catch (error) {
			console.error('Error during logout:', error);
			return false;
		}
	};

	const updateToken = async (newToken) => {
		try {
			await AsyncStorage.setItem('token', newToken);
			setUserToken(newToken);
		} catch (error) {
			console.error('Error updating token:', error);
		}
	};

	const contextValue = {
		// Auth state
		userToken,
		memberId,
		authLoading,
		isAuthenticated: !!userToken && !!memberId,

		// Auth actions
		login,
		logout,
		updateToken,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};