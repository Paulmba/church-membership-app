import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://10.130.134.148:8000'; // your PHP backend URL

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 5000,
});

// Attach JWT token to requests if available
api.interceptors.request.use(async (config) => {
	const token = await AsyncStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
