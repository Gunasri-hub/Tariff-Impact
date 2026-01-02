import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080';
export const API_DATA_URL = 'http://localhost:8080/api';

export const ENDPOINTS = {
  COUNTRIES: '/countries',
  AUTH: {
    ADMIN_LOGIN: '/admin/login',
    USER_LOGIN: '/user/login',
    SIGNUP: '/signup'
  }
};

const AuthAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const DataAPI = axios.create({
  baseURL: API_DATA_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const setupTokenInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

setupTokenInterceptor(AuthAPI);
setupTokenInterceptor(DataAPI);

const setupResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.status || 'Network error', error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

setupResponseInterceptor(AuthAPI);
setupResponseInterceptor(DataAPI);

export default AuthAPI;
export { DataAPI };  // ✅ FIXED: Removed ENDPOINTS (already exported above)
