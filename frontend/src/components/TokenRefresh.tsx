import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import api from '../api/axios';
import axios from 'axios';

function decodeToken(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  const expirationTime = decoded.exp * 1000;
  const now = Date.now();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  return expirationTime - now < sevenDaysInMs;
}

export default function TokenRefresh() {
  const token = useUserStore((s) => s.token);
  const refreshToken = useUserStore((s) => s.refreshToken);
  const logout = useUserStore((s) => s.logout); // add this if you have it
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!token || !user) return;

    const checkAndRefreshToken = async () => {
      if (!isTokenExpiringSoon(token)) return;

      try {
        const response = await api.post(
          `/auth/refresh`,
          { refreshToken: token },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { token: newToken, user: updatedUser } = response.data;
        if (updatedUser) refreshToken(newToken, updatedUser);
        console.log('Token refreshed successfully');
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(`Token refresh failed: ${error.response?.status} ${error.response?.data?.message}`);
          // If 401/403, token is invalid — log user out
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout?.();
          }
        }
      }
    };

    checkAndRefreshToken();
    const interval = setInterval(checkAndRefreshToken, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, user, refreshToken, logout]);

  return null;
}