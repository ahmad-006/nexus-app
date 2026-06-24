import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Relative in production, or configurable via env
  withCredentials: true, // Crucial for automatically attaching the JWT cookie to every request
});

export default api;
