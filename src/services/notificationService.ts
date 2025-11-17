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
      return { success: true, data: response.data as NotificationItem[] };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch notifications',
      };
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
