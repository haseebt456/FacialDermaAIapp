import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import Card from '../../components/Card';
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
    if (reqId) {
      navigation.navigate('ReviewRequestDetail', { id: reqId });
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
    <TouchableOpacity
      onPress={() => openNotification(item)}
      activeOpacity={0.7}
    >
      <Card style={!item.isRead ? styles.unreadCard : styles.card}>
        <View style={styles.notifContent}>
          <View style={[styles.iconCircle, !item.isRead && styles.unreadIconCircle]}>
            <Text style={styles.notifIcon}>{getNotificationIcon(item.type)}</Text>
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.message, !item.isRead && styles.unreadText]}>
              {item.message}
            </Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  flex1: { flex: 1 },
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
  refreshButton: {
    padding: spacing.sm,
  },
  refreshIcon: {
    fontSize: 24,
  },
  card: { marginBottom: spacing.md },
  unreadCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { ...typography.body, color: colors.text, fontWeight: '700' },
  unreadText: { 
    color: colors.primary,
    fontWeight: '700',
  },
  message: { 
    ...typography.bodySmall, 
    color: colors.textSecondary, 
    marginTop: spacing.xs,
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
