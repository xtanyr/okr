import { create } from 'zustand';

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
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,
  login: (user: User, token: string) => {
    set((state) => ({ ...state, user, token }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout: () => {
    set((state) => ({ ...state, user: null, token: null }));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  register: (user: User, token: string) => {
    set((state) => ({ ...state, user, token }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  setUser: (user: User | null) => {
    set((state) => ({ ...state, user }));
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  },
}));

// Генерация аватарки: первые буквы имени и фамилии + цвет, зависящий от id/email
export function getUserAvatar(firstName: string, lastName: string, idOrEmail?: string) {
  const initials = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
  // Цвет выбирается детерминированно по id/email
  const colors = ['#FFB300', '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#F4511E', '#2563eb', '#f59e42'];
  let hash = 0;
  const str = idOrEmail || firstName + lastName;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  return { initials, color };
}

// Инициализация из localStorage при старте
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
if (token && user) {
  useUserStore.setState((state) => ({ ...state, token, user: JSON.parse(user) }));
} 