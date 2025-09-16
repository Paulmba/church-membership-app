import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react';
import { setLogout } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [userToken, setUserToken] = useState(null);
	const [memberId, setMemberId] = useState(null);

	const logout = async () => {
		setUserToken(null);
		setMemberId(null);
		await AsyncStorage.removeItem('token');
		await AsyncStorage.removeItem('member_id');
	};

	useEffect(() => {
		setLogout(logout);
	}, []);

	const isTokenValid = (token) => {
		if (!token) return false;
		try {
			const decoded = jwtDecode(token);
			const currentTime = Date.now() / 1000;
			return decoded.exp > currentTime;
		} catch (error) {
			return false;
		}
	};

	useEffect(() => {
		const loadToken = async () => {
			const token = await AsyncStorage.getItem('token');
			if (token && isTokenValid(token)) {
				const id = await AsyncStorage.getItem('member_id');
				setUserToken(token);
				if (id) setMemberId(id);
			} else {
				await logout();
			}
		};
		loadToken();
	}, []);

	const login = async (token, member_id) => {
		if (isTokenValid(token)) {
			setUserToken(token);
			setMemberId(member_id);
			await AsyncStorage.setItem('token', token);
			await AsyncStorage.setItem('member_id', String(member_id));
		} else {
			await logout();
		}
	};

	return (
		<AuthContext.Provider
			value={{ userToken, memberId, login, logout, isTokenValid }}>
			{children}
		</AuthContext.Provider>
	);
};
