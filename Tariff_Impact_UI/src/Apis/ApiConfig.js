import axios from 'axios';

// Base URLs
export const API_BASE_URL = 'http://localhost:8080';           // For auth routes (without /api)
export const API_DATA_URL = 'http://localhost:8080/api';       // For data routes (with /api)

// Endpoints
export const ENDPOINTS = {
  // Data endpoints (used with API_DATA_URL)
  COUNTRIES: '/countries',
  
  // Auth endpoints (used with API_BASE_URL)
  AUTH: {
    ADMIN_LOGIN: '/admin/login',
    USER_LOGIN: '/user/login',
    SIGNUP: '/signup'
  }
};

// Main API instance for AUTHENTICATION (without /api)
const AuthAPI = axios.create({
  baseURL: API_BASE_URL, // http://localhost:8080
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Data API instance for DATA endpoints (with /api)
const DataAPI = axios.create({
  baseURL: API_DATA_URL, // http://localhost:8080/api
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Auto token interceptor for both APIs
const setupTokenInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
};

setupTokenInterceptor(AuthAPI);
setupTokenInterceptor(DataAPI);

// Response interceptor for error handling
const setupResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.status, error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

setupResponseInterceptor(AuthAPI);
setupResponseInterceptor(DataAPI);

// Export both APIs
export default AuthAPI;
export { DataAPI };