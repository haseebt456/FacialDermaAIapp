import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this based on your environment
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000'  // Android emulator
  // ? 'http://localhost:5000'  // iOS simulator - uncomment for iOS testing
  : 'https://your-production-url.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000, // 30 seconds (prediction can take time)
});

// Request interceptor - adds token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
