// components/ProtectedRoute.js - Issue 6: Role-based route protection

import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../app/AuthContext';

const ProtectedRoute = ({
	children,
	requiredRoles = [],
	requireLogin = true,
	fallbackComponent = null,
	showUnauthorizedAlert = true,
}) => {
	const {
		userToken,
		isLeader,
		isPastor,
		userRoles,
		authLoading,
		canAccess,
		logout,
	} = useContext(AuthContext);

	const router = useRouter();
	const [hasAccess, setHasAccess] = useState(false);
	const [accessChecked, setAccessChecked] = useState(false);

	useEffect(() => {
		if (authLoading) return;

		// Check if login is required and user is not logged in
		if (requireLogin && !userToken) {
			if (showUnauthorizedAlert) {
				Alert.alert(
					'Authentication Required',
					'Please log in to access this page.',
					[{ text: 'OK', onPress: () => router.push('/') }]
				);
			} else {
				router.push('/');
			}
			setHasAccess(false);
			setAccessChecked(true);
			return;
		}

		// Check role-based access
		if (requiredRoles.length > 0) {
			const hasRequiredAccess = canAccess(requiredRoles);

			if (!hasRequiredAccess) {
				if (showUnauthorizedAlert) {
					Alert.alert(
						'Access Denied',
						`You need one of the following roles to access this page: ${requiredRoles.join(
							', '
						)}`,
						[{ text: 'OK', onPress: () => router.back() }]
					);
				} else {
					router.back();
				}
				setHasAccess(false);
			} else {
				setHasAccess(true);
			}
		} else {
			setHasAccess(true);
		}

		setAccessChecked(true);
	}, [
		authLoading,
		userToken,
		userRoles,
		isLeader,
		isPastor,
		requiredRoles,
		requireLogin,
	]);

	// Show loading while checking access
	if (authLoading || !accessChecked) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#f8f9fa',
				}}>
				<Icon name='loading' size={50} color='#666' />
				<Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
					Checking permissions...
				</Text>
			</View>
		);
	}

	// Show fallback component if no access
	if (!hasAccess) {
		if (fallbackComponent) {
			return fallbackComponent;
		}

		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20,
					backgroundColor: '#f8f9fa',
				}}>
				<Icon name='shield-lock-outline' size={80} color='#e63946' />
				<Text
					style={{
						fontSize: 18,
						fontWeight: 'bold',
						marginTop: 16,
						textAlign: 'center',
						color: '#333',
					}}>
					Access Restricted
				</Text>
				<Text
					style={{
						fontSize: 14,
						marginTop: 8,
						textAlign: 'center',
						color: '#666',
					}}>
					You don't have permission to access this content.
				</Text>
			</View>
		);
	}

	// Render children if access is granted
	return children;
};

// Higher-order component for easier usage
export const withRoleProtection = (Component, options = {}) => {
	return function ProtectedComponent(props) {
		return (
			<ProtectedRoute {...options}>
				<Component {...props} />
			</ProtectedRoute>
		);
	};
};

// Specific protection components for common use cases
export const LeaderOnlyRoute = ({ children, ...props }) => (
	<ProtectedRoute
		requiredRoles={['Pastor', 'Elder', 'Deacon', 'Leader']}
		{...props}>
		{children}
	</ProtectedRoute>
);

export const PastorOnlyRoute = ({ children, ...props }) => (
	<ProtectedRoute requiredRoles={['Pastor']} {...props}>
		{children}
	</ProtectedRoute>
);

export const AuthenticatedRoute = ({ children, ...props }) => (
	<ProtectedRoute requireLogin={true} requiredRoles={[]} {...props}>
		{children}
	</ProtectedRoute>
);

export default ProtectedRoute;
