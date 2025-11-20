import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export const authService = {
  // Signup (always as patient)
  signup: async (userData: SignupData) => {
    try {
      const response = await api.post('/api/auth/signup', {
        ...userData,
        role: 'patient', // Explicitly set role as patient
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Unable to create account. Please try again.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('username') && err.includes('exist')) {
          message = 'This username is already taken. Please choose a different one.';
        } else if (err.includes('email') && err.includes('exist')) {
          message = 'This email is already registered. Try logging in instead.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Login (always as patient)
  login: async (credentials: LoginData) => {
    try {
      const response = await api.post('/api/auth/login', {
        ...credentials,
        role: 'patient', // Explicitly set role as patient
      });
      
      // Save token and user data
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Unable to login. Please check your credentials.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('invalid') || err.includes('incorrect')) {
          message = 'Incorrect email/username or password. Please try again.';
        } else if (err.includes('not found')) {
          message = 'Account not found. Please check your credentials or sign up.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/users/me');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user',
      };
    }
  },

  // Check if user is logged in
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },

  // Get stored user data
  getStoredUser: async (): Promise<User | null> => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
};
