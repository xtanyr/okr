import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import axios from 'axios';

// Helper function to decode JWT token
function decodeToken(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Helper function to check if token is expiring soon (within 7 days)
function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  
  return expirationTime - now < sevenDaysInMs;
}

export default function TokenRefresh() {
  const token = useUserStore((s) => s.token);
  const refreshToken = useUserStore((s) => s.refreshToken);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!token || !user) return;

    // Check token expiration every hour
    const checkAndRefreshToken = async () => {
      if (isTokenExpiringSoon(token)) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/auth/refresh-token`, { token });
          const { token: newToken, user: updatedUser } = response.data;
          refreshToken(newToken, updatedUser);
          console.log('Token refreshed automatically');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Then check every hour
    const interval = setInterval(checkAndRefreshToken, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, user, refreshToken]);

  return null; // This component doesn't render anything
}
