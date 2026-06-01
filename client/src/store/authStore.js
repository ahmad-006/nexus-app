import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  // Action to securely save the user profile in memory after logging in
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  
  // Action to clear the session
  logout: () => set({ user: null, isAuthenticated: false }),
}));
