import api from './api';

export interface Dermatologist {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface ReviewRequest {
  id: string;
  predictionId: string;
  patientId: string;
  dermatologistId: string;
  status: 'pending' | 'reviewed' | 'rejected';
  comment?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  patientUsername?: string;
  dermatologistUsername?: string;
}

export const reviewService = {
  listDermatologists: async (q: string = '', limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/api/users/dermatologists`, {
        params: { q, limit, offset },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      let message = 'Unable to load dermatologists. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  createReviewRequest: async (predictionId: string, dermatologistId: string) => {
    try {
      const response = await api.post(`/api/review-requests`, {
        predictionId,
        dermatologistId,
      });
      return { success: true, data: response.data as ReviewRequest };
    } catch (error: any) {
      let message = 'Unable to send review request. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return {
        success: false,
        status: error.response?.status,
        error: message,
      };
    }
  },

  listReviewRequests: async (status?: 'pending' | 'reviewed', limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/api/review-requests`, {
        params: { status, limit, offset },
      });
      // Backend returns { requests: [...], total: n, limit: n, offset: n }
      const requests = Array.isArray(response.data) ? response.data : (response.data?.requests || []);
      return { success: true, data: requests };
    } catch (error: any) {
      let message = 'Unable to load review requests. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return {
        success: false,
        error: message,
      };
    }
  },

  getReviewRequest: async (id: string) => {
    try {
      const response = await api.get(`/api/review-requests/${id}`);
      return { success: true, data: response.data as ReviewRequest };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch review request',
      };
    }
  },

  submitReview: async (id: string, comment: string) => {
    try {
      const response = await api.post(`/api/review-requests/${id}/review`, { comment });
      return { success: true, data: response.data as ReviewRequest };
    } catch (error: any) {
      return {
        success: false,
        status: error.response?.status,
        error: error.response?.data?.error || 'Failed to submit review',
      };
    }
  },
};
