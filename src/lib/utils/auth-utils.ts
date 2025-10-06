/**
 * Auth Utilities
 * Helper functions for authentication
 */

import { useAuthStore } from '@/store/auth-store';
import { extractUserFromToken } from './jwt';

/**
 * Get current user ID from auth store
 */
export function getCurrentUserId(): number | null {
  const { user } = useAuthStore.getState();
  
  if (user?.id) {
    return parseInt(user.id);
  }

  // Fallback: try to get from localStorage token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      const userInfo = extractUserFromToken(token);
      
      if (userInfo?.id) {
        return parseInt(userInfo.id);
      }
    }
  }

  return null;
}

/**
 * Get current user info from auth store
 */
export function getCurrentUser() {
  const { user, isAuthenticated } = useAuthStore.getState();
  return { user, isAuthenticated };
}