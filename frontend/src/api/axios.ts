import axios from 'axios';
import { useUserStore } from '../store/userStore';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3500',
  timeout: 10000,
});

// Helper function to decode JWT token
function decodeToken(token: string): { exp?: number; userId?: string; role?: string } | null {
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

// Helper function to refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token and refresh if needed
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Check if token is expiring soon and refresh proactively
      if (isTokenExpiringSoon(token)) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/auth/refresh-token`, { token });
            const { token: newToken, user } = response.data;
            useUserStore.getState().refreshToken(newToken, user);
            config.headers.Authorization = `Bearer ${newToken}`;
            isRefreshing = false;
            processQueue(null, newToken);
            return config;
          } catch (error) {
            isRefreshing = false;
            processQueue(error, null);
            // If refresh fails, continue with old token
          }
        } else {
          // Wait for refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            config.headers.Authorization = `Bearer ${newToken || token}`;
            return config;
          });
        }
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors (token expiration)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const token = localStorage.getItem('token');
      
      // Try to refresh the token
      if (token && !isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/auth/refresh-token`, { token });
          const { token: newToken, user } = response.data;
          useUserStore.getState().refreshToken(newToken, user);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          
          // Refresh failed - logout user
          const logout = useUserStore.getState().logout;
          logout();
          
          // Redirect to login page (avoid redirect loop)
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            // Store the current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken || token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      } else {
        // No token or refresh not possible - logout
        const logout = useUserStore.getState().logout;
        logout();
        
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
