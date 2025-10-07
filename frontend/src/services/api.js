import axios from 'axios';

/**
 * Axios instance for API calls.
 * - Adds Bearer token from localStorage
 * - Sets sane defaults (timeout, JSON headers)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface a concise message while preserving the original error
    if (error.response) {
      console.warn('API error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.warn('API network error: no response');
    } else {
      console.warn('API config error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
