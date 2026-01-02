import AuthAPI from './ApiConfig';
import { ENDPOINTS } from './ApiConfig';

export const adminLogin = async (data) => {
  try {
    const response = await AuthAPI.post(ENDPOINTS.AUTH.ADMIN_LOGIN, {
      email: data.email,
      password: data.password
    });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('role', 'admin');
    }
    
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    const errorData = error.response?.data || { success: false, error: error.message };
    throw errorData;
  }
};

export const userLogin = async (data) => {
  try {
    const response = await AuthAPI.post(ENDPOINTS.AUTH.USER_LOGIN, {
      email: data.email,
      password: data.password
    });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('role', 'user');
    }
    
    return response.data;
  } catch (error) {
    console.error('User login error:', error);
    const errorData = error.response?.data || { success: false, error: error.message };
    throw errorData;
  }
};

export const signup = async (data) => {
  try {
    const response = await AuthAPI.post(ENDPOINTS.AUTH.SIGNUP, {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'user'
    });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    const errorData = error.response?.data || { success: false, error: error.message };
    throw errorData;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

export const checkAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    isAuthenticated: !!token,
    user: user ? JSON.parse(user) : null,
    token: token
  };
};
