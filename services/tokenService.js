// services/tokenService.js - Token refresh and management

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

class TokenService {
	constructor() {
		this.isRefreshing = false;
		this.failedQueue = [];
		this.refreshPromise = null;
	}

	/**
	 * Check if token is expired or will expire soon
	 */
	isTokenExpired(token, bufferTime = 300) {
		// 5 minutes buffer
		if (!token) return true;

		try {
			const decoded = jwtDecode(token);
			const currentTime = Date.now() / 1000;
			return decoded.exp <= currentTime + bufferTime;
		} catch (error) {
			return true;
		}
	}

	/**
	 * Get token with automatic refresh if needed
	 */
	async getValidToken() {
		try {
			let token = await AsyncStorage.getItem('token');

			if (!token) {
				throw new Error('No token found');
			}

			// If token is not expired, return it
			if (!this.isTokenExpired(token)) {
				return token;
			}

			// If already refreshing, wait for current refresh
			if (this.isRefreshing && this.refreshPromise) {
				return await this.refreshPromise;
			}

			// Start refresh process
			return await this.refreshToken();
		} catch (error) {
			console.error('Error getting valid token:', error);
			throw error;
		}
	}

	/**
	 * Refresh the token
	 */
	async refreshToken() {
		if (this.isRefreshing && this.refreshPromise) {
			return await this.refreshPromise;
		}

		this.isRefreshing = true;

		this.refreshPromise = this._performTokenRefresh();

		try {
			const newToken = await this.refreshPromise;
			this.isRefreshing = false;
			this.refreshPromise = null;
			return newToken;
		} catch (error) {
			this.isRefreshing = false;
			this.refreshPromise = null;
			throw error;
		}
	}

	async _performTokenRefresh() {
		try {
			const currentToken = await AsyncStorage.getItem('token');
			const memberId = await AsyncStorage.getItem('member_id');

			if (!currentToken || !memberId) {
				throw new Error('Missing refresh credentials');
			}

			// Make refresh request to backend
			const response = await api.post('/refresh-token.php', {
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

				// Store new token and auth data
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
			// If refresh fails, clear stored data and redirect to login
			await this.clearAuthData();
			throw error;
		}
	}

	/**
	 * Clear all authentication data
	 */
	async clearAuthData() {
		await AsyncStorage.multiRemove([
			'token',
			'member_id',
			'user_roles',
			'is_leader',
			'is_pastor',
		]);
	}

	/**
	 * Make authenticated API request with automatic token refresh
	 */
	async makeAuthenticatedRequest(url, options = {}) {
		try {
			const token = await this.getValidToken();

			const authHeaders = {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				...options.headers,
			};

			const response = await fetch(url, {
				...options,
				headers: authHeaders,
			});

			// If unauthorized, try refresh once
			if (response.status === 401) {
				const newToken = await this.refreshToken();

				const retryResponse = await fetch(url, {
					...options,
					headers: {
						...authHeaders,
						Authorization: `Bearer ${newToken}`,
					},
				});

				return retryResponse;
			}

			return response;
		} catch (error) {
			console.error('Authenticated request failed:', error);
			throw error;
		}
	}
}

// Create singleton instance
const tokenService = new TokenService();

/**
 * Enhanced API service with automatic token management
 */
export class AuthenticatedApiService {
	constructor(baseURL) {
		this.baseURL = baseURL;
		this.tokenService = tokenService;
	}

	async get(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`;
		return this.tokenService.makeAuthenticatedRequest(url, {
			method: 'GET',
			...options,
		});
	}

	async post(endpoint, data, options = {}) {
		const url = `${this.baseURL}${endpoint}`;
		return this.tokenService.makeAuthenticatedRequest(url, {
			method: 'POST',
			body: JSON.stringify(data),
			...options,
		});
	}

	async put(endpoint, data, options = {}) {
		const url = `${this.baseURL}${endpoint}`;
		return this.tokenService.makeAuthenticatedRequest(url, {
			method: 'PUT',
			body: JSON.stringify(data),
			...options,
		});
	}

	async delete(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`;
		return this.tokenService.makeAuthenticatedRequest(url, {
			method: 'DELETE',
			...options,
		});
	}
}

/**
 * React hook for automatic token management
 */
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../app/AuthContext';

export const useTokenManager = () => {
	const { userToken, logout } = useContext(AuthContext);
	const [tokenStatus, setTokenStatus] = useState('checking');

	useEffect(() => {
		let intervalId;

		const checkTokenStatus = async () => {
			if (!userToken) {
				setTokenStatus('no-token');
				return;
			}

			try {
				if (tokenService.isTokenExpired(userToken, 600)) {
					// 10 minutes buffer
					setTokenStatus('needs-refresh');
					await tokenService.refreshToken();
					setTokenStatus('valid');
				} else {
					setTokenStatus('valid');
				}
			} catch (error) {
				console.error('Token check failed:', error);
				setTokenStatus('invalid');
				logout && logout();
			}
		};

		if (userToken) {
			checkTokenStatus();
			// Check token every 5 minutes
			intervalId = setInterval(checkTokenStatus, 5 * 60 * 1000);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [userToken, logout]);

	return {
		tokenStatus,
		isTokenValid: tokenStatus === 'valid',
		isRefreshing: tokenStatus === 'needs-refresh',
		refreshToken: () => tokenService.refreshToken(),
	};
};

export { tokenService };
export default tokenService;
