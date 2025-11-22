import api from './api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  ref?: {
    type?: string;
    requestId?: string;
  } | null;
}

export const notificationService = {
  listNotifications: async (unreadOnly = false, limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/api/notifications`, {
        params: { unreadOnly, limit, offset },
      });
      // Backend may return array directly or wrapped in { notifications: [...] }
      const notifications = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.notifications || []);
      return { success: true, data: notifications };
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
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to mark notification as read',
      };
    }
  },
};
