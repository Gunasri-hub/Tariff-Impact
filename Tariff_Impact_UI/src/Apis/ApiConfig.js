import axios from 'axios';

// Tariff Impact Backend URL
export const BaseUrl = 'http://localhost:8080/api/metadata';

// Authenticated API instance
const API = axios.create({
  baseURL: BaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Auto token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;