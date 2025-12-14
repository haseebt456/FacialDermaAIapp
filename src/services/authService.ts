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
  role?: 'patient' | 'dermatologist';
  name?: string;
  license?: string; // Required for dermatologists
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export const authService = {
  // Signup (patient or dermatologist)
  signup: async (userData: SignupData) => {
    try {
      const response = await api.post('/api/auth/signup', {
        ...userData,
        role: userData.role || 'patient',
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Unable to create account. Please try again.';
      // Check detail.error first (API standard), then fallback to error
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('email') && err.includes('registered')) {
          message = 'This email is already registered. Try logging in instead.';
        } else if (err.includes('username') && err.includes('taken')) {
          message = 'This username is already taken. Please choose a different one.';
        } else if (err.includes('license') && err.includes('registered')) {
          message = 'This license number is already registered to another dermatologist.';
        } else if (err.includes('license') && err.includes('required')) {
          message = 'License number is required for dermatologist registration.';
        } else if (err.includes('username') && err.includes('spaces')) {
          message = 'Username cannot contain spaces.';
        } else {
          message = errorMsg;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Login (any role)
  login: async (credentials: LoginData) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      // Save token and user data
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Unable to login. Please check your credentials.';
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('not found') || err.includes('user not found')) {
          message = 'Account not found. Please check your credentials or sign up.';
        } else if (err.includes('invalid password')) {
          message = 'Incorrect password. Please try again.';
        } else if (err.includes('email not verified')) {
          message = 'Please verify your email address first. Check your inbox for the verification link.';
        } else if (err.includes('pending admin approval') || err.includes('pending approval')) {
          message = 'Your account is pending admin approval. You will be notified once approved.';
        } else if (err.includes('verification was rejected')) {
          message = errorMsg; // Show full rejection reason
        } else if (err.includes('role mismatch')) {
          message = errorMsg;
        } else if (err.includes('suspended')) {
          message = 'Your account has been suspended. Please contact support.';
        } else {
          message = errorMsg;
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
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error || 'Failed to get user';
      return {
        success: false,
        error: errorMsg,
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

  // Verify email with token
  verifyEmail: async (token: string) => {
    try {
      const response = await api.get('/api/auth/verify-email', { params: { token } });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Email verification failed. Please try again.';
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('expired')) {
          message = 'Verification link has expired. Please request a new verification email.';
        } else if (err.includes('already verified')) {
          message = 'Email is already verified. You can now log in.';
        } else if (err.includes('invalid')) {
          message = 'Invalid verification link. Please request a new verification email.';
        } else {
          message = errorMsg;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Verify email via OTP (alternative to link)
  verifyEmailOtp: async (email: string, otp: string) => {
    try {
      const response = await api.post('/api/auth/verify-email-otp', { email, otp });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Invalid or expired code. Please try again.';
      if (error.response?.data?.detail?.error) {
        message = error.response.data.detail.error;
      } else if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('invalid')) {
          message = 'Invalid OTP. Please check the code and try again.';
        } else if (err.includes('expired') || err.includes('gone')) {
          message = 'OTP has expired. Please request a new one.';
        } else if (err.includes('too many') || err.includes('locked')) {
          message = 'Too many attempts. Please wait a few minutes before retrying.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Resend verification email
  resendVerificationEmail: async (email: string) => {
    try {
      const response = await api.post('/api/auth/verification/resend', { email });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Unable to send verification email. Please try again.';
      if (error.response?.data?.detail?.error) {
        message = error.response.data.detail.error;
      } else if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('already verified')) {
          message = 'This email is already verified. You can log in now.';
        } else if (err.includes('not found')) {
          message = 'No account found with this email address.';
        } else if (err.includes('too many') || err.includes('wait')) {
          message = 'Please wait a few minutes before requesting again.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Forgot password - request OTP
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Failed to send reset code. Please try again.';
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('no account') || err.includes('not found')) {
          message = 'No account found with this email address.';
        } else {
          message = errorMsg;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { email, otp });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Invalid or expired code. Please try again.';
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('invalid otp')) {
          message = 'Invalid code. Please check and try again.';
        } else if (err.includes('expired')) {
          message = 'Code has expired. Please request a new one.';
        } else {
          message = errorMsg;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Reset password with email and OTP
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await api.post('/api/auth/reset-password', { email, otp, newPassword });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Failed to reset password. Please try again.';
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('invalid otp') || err.includes('invalid') || err.includes('email')) {
          message = 'Invalid code or email. Please try again.';
        } else if (err.includes('expired')) {
          message = 'Code has expired. Please request a new one.';
        } else if (err.includes('at least')) {
          message = 'Password must be at least 6 characters long.';
        } else {
          message = errorMsg;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Change password (authenticated)
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/api/users/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Failed to change password. Please try again.';
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('incorrect') || err.includes('current password')) {
          message = 'Current password is incorrect.';
        } else if (err.includes('at least 8')) {
          message = 'New password must be at least 8 characters long.';
        } else if (err.includes('different')) {
          message = 'New password must be different from current password.';
        } else {
          message = errorMsg;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Update profile
  updateProfile: async (data: Record<string, any>) => {
    try {
      const response = await api.put('/api/users/me', data);
      // API returns { message, user } - update stored user with the user object
      const updatedUser = response.data.user || response.data;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (error: any) {
      let message = 'Failed to update profile. Please try again.';
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error;
      
      if (errorMsg) {
        const err = errorMsg.toLowerCase();
        if (err.includes('no fields')) {
          message = 'No changes to save.';
        } else if (err.includes('license') && err.includes('exists')) {
          message = 'This license number is already registered.';
        } else {
          message = errorMsg;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Convenience: fetch current user (used for email verification re-check)
  getMe: async () => {
    try {
      const response = await api.get('/api/users/me');
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Failed to fetch user profile.';
      if (error.response?.data?.detail?.error) {
        message = error.response.data.detail.error;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },
};
