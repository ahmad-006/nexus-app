import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Point to our Express backend
  withCredentials: true, // Crucial for automatically attaching the JWT cookie to every request
});

export default api;
