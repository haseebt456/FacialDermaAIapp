import api from './api';

export interface NotificationItem {
  id: string;
  userId: string;
  type: 
    | 'review_requested'      // New review request (for dermatologists)
    | 'review_completed'      // Review submitted (for patients)
    | 'review_rejected'       // Review request rejected (for patients)
    | 'verification_approved' // Dermatologist verification approved
    | 'verification_rejected'; // Dermatologist verification rejected
  message: string;
  createdAt: string;
  isRead: boolean;
  ref?: {
    requestId?: string;
    predictionId?: string;
  } | null;
}

export const notificationService = {
  listNotifications: async (unreadOnly = false, limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/api/notifications`, {
        params: { unreadOnly, limit, offset },
      });
      // Backend returns { notifications: [...], total, unreadCount, limit, offset }
      const notifications = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.notifications || []);
      const total = response.data?.total || notifications.length;
      const unreadCount = response.data?.unreadCount || 0;
      return { success: true, data: notifications, total, unreadCount };
    } catch (error: any) {
      let message = 'Unable to load notifications. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      return { success: true };
    } catch (error: any) {
      let message = 'Failed to update notification.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('not found')) {
          message = 'Notification not found.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      return { success: true };
    } catch (error: any) {
      let message = 'Failed to delete notification.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('not found')) {
          message = 'Notification not found.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },
};
