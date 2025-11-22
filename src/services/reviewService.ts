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
  status: 'pending' | 'reviewed';
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
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dermatologists',
      };
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
      return {
        success: false,
        status: error.response?.status,
        error: error.response?.data?.error || 'Failed to create review request',
      };
    }
  },

  listReviewRequests: async (status?: 'pending' | 'reviewed', limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/api/review-requests`, {
        params: { status, limit, offset },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch review requests',
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
