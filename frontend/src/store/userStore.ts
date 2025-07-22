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
  setUser: (user: User | null) => set((state) => ({ ...state, user })),
}));

// Инициализация из localStorage при старте
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
if (token && user) {
  useUserStore.setState((state) => ({ ...state, token, user: JSON.parse(user) }));
} 