// hooks/useRoleAccess.js - Issue 10: Role-based UI rendering hook

import { useContext, useMemo } from 'react';
import { AuthContext } from '../app/AuthContext';

/**
 * Custom hook for role-based access control and conditional UI rendering
 * Provides a clean API for checking permissions and rendering components conditionally
 */
export const useRoleAccess = () => {
	const {
		userToken,
		memberId,
		userRoles,
		isLeader,
		isPastor,
		authLoading,
		hasRole,
		hasAnyRole,
		canAccess,
		canCreateAnnouncement,
		canAccessLeadershipContent,
		canManageMembers,
	} = useContext(AuthContext);

	// Memoized permission checks to avoid unnecessary re-renders
	const permissions = useMemo(
		() => ({
			// Basic authentication status
			isAuthenticated: !!userToken && !!memberId,
			isAuthLoading: authLoading,

			// Role-based permissions
			isLeader,
			isPastor,
			roles: userRoles,

			// Feature-specific permissions
			canCreateAnnouncement: canCreateAnnouncement(),
			canAccessLeadershipContent: canAccessLeadershipContent(),
			canManageMembers: canManageMembers(),

			// General role checking functions
			hasRole: (role) => hasRole(role),
			hasAnyRole: (roles) => hasAnyRole(roles),
			canAccess: (requiredRoles) => canAccess(requiredRoles),

			// Specific role checks
			isPastorOrElder: hasAnyRole(['Pastor', 'Elder']),
			isDeaconOrAbove: hasAnyRole(['Pastor', 'Elder', 'Deacon']),
			isMinistry: hasAnyRole(['Pastor', 'Elder', 'Deacon', 'Ministry Leader']),

			// Permission helpers
			canCreateEvents: hasAnyRole(['Pastor', 'Elder', 'Event Coordinator']),
			canManageGroups: hasAnyRole(['Pastor', 'Elder', 'Group Leader']),
			canModerateDiscussions: hasAnyRole([
				'Pastor',
				'Elder',
				'Deacon',
				'Moderator',
			]),
			canAccessFinancials: hasAnyRole(['Pastor', 'Elder', 'Treasurer']),
			canManageUsers: hasAnyRole(['Pastor', 'Admin']),
		}),
		[
			userToken,
			memberId,
			userRoles,
			isLeader,
			isPastor,
			authLoading,
			hasRole,
			hasAnyRole,
			canAccess,
			canCreateAnnouncement,
			canAccessLeadershipContent,
			canManageMembers,
		]
	);

	return permissions;
};

/**
 * Component for conditional rendering based on roles
 * Usage: <RoleGuard roles={['Pastor']} fallback={<div>No access</div>}><ProtectedContent /></RoleGuard>
 */
export const RoleGuard = ({
	children,
	roles = [],
	requireLeader = false,
	requirePastor = false,
	requireAuth = true,
	fallback = null,
	showFallbackWhileLoading = false,
}) => {
	const { isAuthenticated, isAuthLoading, canAccess, isLeader, isPastor } =
		useRoleAccess();

	// Show loading or fallback while auth is loading
	if (isAuthLoading) {
		return showFallbackWhileLoading ? fallback : null;
	}

	// Check authentication requirement
	if (requireAuth && !isAuthenticated) {
		return fallback;
	}

	// Check role requirements
	if (roles.length > 0 && !canAccess(roles)) {
		return fallback;
	}

	// Check leader requirement
	if (requireLeader && !isLeader) {
		return fallback;
	}

	// Check pastor requirement
	if (requirePastor && !isPastor) {
		return fallback;
	}

	return children;
};

/**
 * Higher-order component for role-based rendering
 * Usage: const ProtectedComponent = withRoleGuard(MyComponent, { roles: ['Pastor'] });
 */
export const withRoleGuard = (Component, guardOptions = {}) => {
	return function GuardedComponent(props) {
		return (
			<RoleGuard {...guardOptions}>
				<Component {...props} />
			</RoleGuard>
		);
	};
};

/**
 * Hook for conditional styling based on roles
 * Usage: const styles = useRoleStyles({ leaderColor: '#gold', memberColor: '#silver' });
 */
export const useRoleStyles = (styleMap = {}) => {
	const { isLeader, isPastor, roles } = useRoleAccess();

	return useMemo(() => {
		if (isPastor && styleMap.pastorStyle) {
			return styleMap.pastorStyle;
		}

		if (isLeader && styleMap.leaderStyle) {
			return styleMap.leaderStyle;
		}

		// Check for specific role styles
		for (const role of roles) {
			const roleKey = `${role.toLowerCase()}Style`;
			if (styleMap[roleKey]) {
				return styleMap[roleKey];
			}
		}

		return styleMap.defaultStyle || {};
	}, [isLeader, isPastor, roles, styleMap]);
};

/**
 * Predefined role guards for common use cases
 */
export const LeaderGuard = ({ children, fallback = null }) => (
	<RoleGuard requireLeader={true} fallback={fallback}>
		{children}
	</RoleGuard>
);

export const PastorGuard = ({ children, fallback = null }) => (
	<RoleGuard requirePastor={true} fallback={fallback}>
		{children}
	</RoleGuard>
);

export const AuthGuard = ({ children, fallback = null }) => (
	<RoleGuard requireAuth={true} fallback={fallback}>
		{children}
	</RoleGuard>
);

export const ElderGuard = ({ children, fallback = null }) => (
	<RoleGuard roles={['Pastor', 'Elder']} fallback={fallback}>
		{children}
	</RoleGuard>
);

export const DeaconGuard = ({ children, fallback = null }) => (
	<RoleGuard roles={['Pastor', 'Elder', 'Deacon']} fallback={fallback}>
		{children}
	</RoleGuard>
);

/**
 * Hook for managing loading states based on auth status
 */
export const useAuthLoadingState = () => {
	const { isAuthLoading, isAuthenticated } = useRoleAccess();

	return {
		isLoading: isAuthLoading,
		isReady: !isAuthLoading,
		isAuthenticated: isAuthenticated && !isAuthLoading,
		showContent: !isAuthLoading && isAuthenticated,
	};
};

export default useRoleAccess;
