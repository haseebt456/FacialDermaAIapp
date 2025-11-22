import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationsContextValue {
  unreadCount: number;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      setUnreadCount(0);
      return;
    }
    const res = await notificationService.listNotifications(true, 50, 0);
    if (res.success) {
      // Use unreadCount from backend if available, otherwise count unread items
      const count = res.unreadCount !== undefined ? res.unreadCount : (res.data?.length || 0);
      setUnreadCount(count);
    }
  };

  useEffect(() => {
    refresh();
    
    // Poll for new notifications every 30 seconds when app is active
    const interval = setInterval(async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        refresh();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [])

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
