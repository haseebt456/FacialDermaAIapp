import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import Card from '../../components/Card';
import ScreenContainer from '../../components/ScreenContainer';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';
import { notificationService, NotificationItem } from '../../services/notificationService';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function NotificationsScreen({ navigation }: any) {
  const { refresh } = useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await notificationService.listNotifications(false, 50, 0);
    setLoading(false);
    if (res.success) {
      setItems(res.data || []);
    } else {
      setError(res.error || 'Failed to load notifications');
      setItems([]);
    }
    await refresh();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const openNotification = async (item: NotificationItem) => {
    if (!item.isRead) {
      await notificationService.markAsRead(item.id);
      await refresh();
      await load();
    }
    const reqId = item.ref?.requestId;
    const predId = item.ref?.predictionId;
    
    // Navigate to comprehensive detail showing both prediction and review info
    if (reqId) {
      navigation.navigate('AnalysisDetail', { requestId: reqId, predictionId: predId });
    } else if (predId) {
      navigation.navigate('AnalysisDetail', { predictionId: predId });
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'review_submitted') return '✅';
    if (type === 'review_rejected') return '❌';
    return '🔔';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Card style={!item.isRead ? styles.unreadCard : styles.card}>
      <TouchableOpacity
        onPress={() => openNotification(item)}
        activeOpacity={0.7}
        style={styles.notifTouchable}
      >
        <View style={styles.notifContent}>
          <View style={[styles.iconCircle, !item.isRead && styles.unreadIconCircle]}>
            <Text style={styles.notifIcon}>{getNotificationIcon(item.type)}</Text>
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.message, !item.isRead && styles.unreadText]}>
              {item.message}
            </Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.backgroundGray}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <Text style={styles.emptyText}>Loading notifications...</Text>
            ) : error ? (
              <>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>Could Not Load Notifications</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={load}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptyText}>
                  You're all caught up! Notifications will appear here when dermatologists review your cases.
                </Text>
              </>
            )}
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  backButton: { padding: spacing.sm },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  headerTitle: { ...typography.h2, color: colors.text },
  spacer: { width: 60 },
  card: { 
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  unreadCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  notifTouchable: {
    flex: 1,
  },
  notifContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  unreadIconCircle: {
    backgroundColor: colors.primaryLight,
  },
  notifIcon: {
    fontSize: 22,
  },
  textContent: {
    flex: 1,
  },
  unreadText: { 
    color: colors.primary,
    fontWeight: '700',
  },
  message: { 
    ...typography.body, 
    color: colors.text,
  },
  time: { 
    ...typography.caption, 
    color: colors.textLight, 
    marginTop: spacing.xs,
  },
  unreadDot: { 
    width: 10, 
    height: 10, 
    backgroundColor: colors.primary, 
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  deleteText: {
    fontSize: 20,
    color: colors.textLight,
    fontWeight: '600',
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: spacing.xxl, 
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { 
    ...typography.h3, 
    color: colors.text, 
    marginBottom: spacing.sm, 
    textAlign: 'center',
  },
  emptyText: { 
    ...typography.body, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: spacing.md,
  },
  retryButton: { 
    backgroundColor: colors.primary, 
    paddingVertical: spacing.md, 
    paddingHorizontal: spacing.xl, 
    borderRadius: borderRadius.md, 
    marginTop: spacing.sm,
  },
  retryText: { ...typography.body, color: colors.white, fontWeight: '600' },
});
