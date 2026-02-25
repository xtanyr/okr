  import { create } from 'zustand';
import { safeGetItem, safeParseJSON, safeSetItem, safeRemoveItem } from '../utils/localStorage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: { initials: string; color: string };
}

interface UserStore {
  user: User | null;  
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  register: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  refreshToken: (token: string, user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,
  login: (user: User, token: string) => {
    set((state) => ({ ...state, user, token }));
    safeSetItem('token', token);
    safeSetItem('user', JSON.stringify(user));
  },
  logout: () => {
    set((state) => ({ ...state, user: null, token: null }));
    safeRemoveItem('token');
    safeRemoveItem('user');
  },
  register: (user: User, token: string) => {
    set((state) => ({ ...state, user, token }));
    safeSetItem('token', token);
    safeSetItem('user', JSON.stringify(user));
  },
  setUser: (user: User | null) => {
    set((state) => ({ ...state, user }));
    if (user) safeSetItem('user', JSON.stringify(user));
    else safeRemoveItem('user');
  },
  refreshToken: (token: string, user: User) => {
    set((state) => ({ ...state, token, user }));
    safeSetItem('token', token);
    safeSetItem('user', JSON.stringify(user));
  },
}));
    
export function getUserAvatar(firstName: string, lastName: string, idOrEmail?: string) {
  const initials = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
  const colors = ['#FFB300', '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#F4511E', '#2563eb', '#f59e42'];
  let hash = 0;
  const str = idOrEmail || firstName + lastName;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  return { initials, color };
}


const token = safeGetItem('token');
const user = safeParseJSON<User>('user');
if (token && user) {
  useUserStore.setState((state) => ({ ...state, token, user }));
} 