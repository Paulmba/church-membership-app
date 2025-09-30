// services/api.js - Complete API client with automatic token management

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://10.124.181.123:8000';

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Token management utilities
const isTokenExpired = (token, bufferTime = 300) => {
	if (!token) return true;
	try {
		const decoded = jwtDecode(token);
		const currentTime = Date.now() / 1000;
		return decoded.exp <= currentTime + bufferTime;
	} catch (error) {
		return true;
	}
};

const refreshToken = async () => {
	try {
		const currentToken = await AsyncStorage.getItem('token');
		const memberId = await AsyncStorage.getItem('member_id');

		if (!currentToken || !memberId) {
			throw new Error('Missing refresh credentials');
		}

		const response = await axios.post(`${API_BASE_URL}/refresh-token.php`, {
			token: currentToken,
			member_id: memberId,
		});

		if (response.data.success) {
			const {
				token: newToken,
				roles = [],
				isLeader = false,
				isPastor = false,
			} = response.data;

			await AsyncStorage.multiSet([
				['token', newToken],
				['user_roles', JSON.stringify(roles)],
				['is_leader', String(isLeader)],
				['is_pastor', String(isPastor)],
			]);

			return newToken;
		} else {
			throw new Error(response.data.message || 'Token refresh failed');
		}
	} catch (error) {
		// Clear stored data on refresh failure
		await AsyncStorage.multiRemove([
			'token',
			'member_id',
			'user_roles',
			'is_leader',
			'is_pastor',
		]);
		throw error;
	}
};

const getValidToken = async () => {
	let token = await AsyncStorage.getItem('token');

	if (!token) {
		return null;
	}

	if (isTokenExpired(token)) {
		try {
			token = await refreshToken();
		} catch (error) {
			console.error('Token refresh failed:', error);
			return null;
		}
	}

	return token;
};

// Request interceptor to add auth header
api.interceptors.request.use(
	async (config) => {
		const token = await getValidToken();

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const newToken = await refreshToken();

				if (newToken) {
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				console.error('Token refresh failed:', refreshError);
				// Redirect to login or show auth error
			}
		}

		return Promise.reject(error);
	}
);

// API service methods
const apiService = {
	// Authentication endpoints (no token required)
	auth: {
		login: (credentials) => api.post('/login.php', credentials),
		register: (userData) => api.post('/register.php', userData),
		verifyPhone: (data) => api.post('/verify-phone.php', data),
		verifyOTP: (data) => api.post('/verify_otp.php', data),
		resendOTP: (data) => api.post('/resend_otp.php', data),
		createAccount: (data) => api.post('/create_account.php', data),
		completeRegistration: (data) =>
			api.post('/complete_registration.php', data),
		refreshToken: (data) => api.post('/refresh-token.php', data),
	},

	// Member dashboard (requires authentication)
	member: {
		getProfile: (memberId) =>
			api.get(`/member-dashboard.php`, {
				params: { action: 'member-profile', member_id: memberId },
			}),

		getAnnouncements: (memberId, type = 'general') =>
			api.get(`/member-dashboard.php`, {
				params: { action: 'announcements', member_id: memberId, type },
			}),

		getEvents: (memberId) =>
			api.get(`/member-dashboard.php`, {
				params: { action: 'events', member_id: memberId },
			}),

		getPrayerRequests: (memberId) =>
			api.get(`/member-dashboard.php`, {
				params: { action: 'prayer-requests', member_id: memberId },
			}),

		createAnnouncement: (data) =>
			api.post('/member-dashboard.php?action=create-announcement', data),

		rsvpEvent: (data) =>
			api.post('/member-dashboard.php?action=rsvp-event', data),

		createPrayerRequest: (data) =>
			api.post('/member-dashboard.php?action=create-prayer-request', data),
	},

	// Leadership endpoints (requires leader role)
	leadership: {
		getStats: () =>
			api.get('/member-dashboard.php', {
				params: { action: 'leadership-stats' },
			}),

		createEvent: (data) =>
			api.post('/member-dashboard.php?action=create-event', data),

		getMembers: (groupId) =>
			api.get('/member-dashboard.php', {
				params: { action: 'group-members', group_id: groupId },
			}),
	},

	// Admin endpoints (requires pastor role)
	admin: {
		getUsers: () =>
			api.get('/member-dashboard.php', { params: { action: 'admin-users' } }),

		manageUser: (data) =>
			api.post('/member-dashboard.php?action=manage-user', data),
	},

	// Generic authenticated requests
	get: (endpoint, params = {}) => api.get(endpoint, { params }),
	post: (endpoint, data) => api.post(endpoint, data),
	put: (endpoint, data) => api.put(endpoint, data),
	delete: (endpoint) => api.delete(endpoint),
};

// Export both the axios instance and the service
export { api, apiService };
export default apiService;
