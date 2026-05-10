import { create } from 'zustand';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: true,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return set({ isLoading: false });
    try {
      const { user } = await api.get('/auth/me');
      set({ user, token, isLoading: false });
      connectSocket(token);
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', token);
    set({ user, token });
    connectSocket(token);
    return user;
  },

  register: async (data) => {
    const { token, user } = await api.post('/auth/register', data);
    localStorage.setItem('token', token);
    set({ user, token });
    connectSocket(token);
    return user;
  },

  logout: () => {
    localStorage.removeItem('token');
    disconnectSocket();
    set({ user: null, token: null });
  },

  updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
}));

export default useAuthStore;
