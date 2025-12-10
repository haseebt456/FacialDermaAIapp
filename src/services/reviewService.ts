import api from './api';

export interface Dermatologist {
  id: string;
  username: string;
  email: string;
  name?: string;
  specialization?: string;
  clinic?: string;
  fees?: number;
  experience?: number;
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
  prediction?: {
    id: string;
    result: {
      predicted_label: string;
      confidence_score: number;
    };
    imageUrl: string;
  };
  patient?: {
    name?: string;
    username: string;
    email: string;
    age?: number;
    gender?: string;
    phone?: string;
    bloodGroup?: string;
    allergies?: string;
  };
  dermatologist?: {
    name?: string;
    username: string;
    email: string;
  };
}

export const reviewService = {
  listDermatologists: async (q: string = '', limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/api/users/dermatologists`, {
        params: { q, limit, offset },
      });
      // API returns { dermatologists: [...], total, limit, offset }
      const dermatologists = response.data?.dermatologists || response.data || [];
      return { 
        success: true, 
        data: dermatologists,
        total: response.data?.total || dermatologists.length,
      };
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
        const err = error.response.data.error.toLowerCase();
        if (err.includes('not a dermatologist')) {
          message = 'Selected user is not a dermatologist.';
        } else if (err.includes('your own predictions')) {
          message = 'You can only request reviews for your own predictions.';
        } else if (err.includes('already exists')) {
          message = 'You have already sent a review request to this dermatologist for this prediction.';
        } else if (err.includes('prediction not found')) {
          message = 'Prediction not found. It may have been deleted.';
        } else if (err.includes('dermatologist not found')) {
          message = 'Dermatologist not found.';
        } else {
          message = error.response.data.error;
        }
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

  // Use status_filter as per API docs
  listReviewRequests: async (status?: 'pending' | 'reviewed' | 'rejected', limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/api/review-requests`, {
        params: { status_filter: status, limit, offset },
      });
      // Backend returns { requests: [...], total: n, limit: n, offset: n }
      const requests = Array.isArray(response.data) ? response.data : (response.data?.requests || []);
      return { 
        success: true, 
        data: requests,
        total: response.data?.total || requests.length,
      };
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
      let message = 'Unable to load review request details.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('not authorized')) {
          message = 'You are not authorized to view this request.';
        } else if (err.includes('not found')) {
          message = 'Review request not found.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Submit review (dermatologist only)
  submitReview: async (id: string, comment: string) => {
    try {
      const response = await api.post(`/api/review-requests/${id}/review`, { comment });
      return { success: true, data: response.data as ReviewRequest };
    } catch (error: any) {
      let message = 'Failed to submit review. Please try again.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('not authorized') || err.includes('not a dermatologist')) {
          message = 'You are not authorized to review this request.';
        } else if (err.includes('not found')) {
          message = 'Review request not found.';
        } else if (err.includes('already reviewed')) {
          message = 'This request has already been reviewed.';
        } else {
          message = error.response.data.error;
        }
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

  // Reject review request (dermatologist only)
  rejectReview: async (id: string, reason?: string) => {
    try {
      const response = await api.post(`/api/review-requests/${id}/reject`, { reason });
      return { success: true, data: response.data as ReviewRequest };
    } catch (error: any) {
      let message = 'Failed to reject request. Please try again.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('not authorized') || err.includes('not a dermatologist')) {
          message = 'You are not authorized to reject this request.';
        } else if (err.includes('not found')) {
          message = 'Review request not found.';
        } else if (err.includes('already')) {
          message = 'This request has already been processed.';
        } else {
          message = error.response.data.error;
        }
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
};
