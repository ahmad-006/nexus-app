import { create } from 'zustand';
import axios from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  
  // Verify session on app load
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axios.get('/users/me');
      set({ user: response.data.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  // Login action making API call
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/auth/login', { email, password });
      set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Signup action making API call
  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/auth/signup', userData);
      // Signup does not log in directly, it redirects to verify email
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/auth/verify-otp', { email, otp });
      set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Resend OTP
  resendOtp: async (email) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/auth/resend-otp', { email });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Logout action making API call
  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post('/auth/logout');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
