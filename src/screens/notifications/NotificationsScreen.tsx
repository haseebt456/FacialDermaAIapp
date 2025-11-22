import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import Card from '../../components/Card';
import { colors, spacing, typography, shadows } from '../../styles/theme';
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
    if (!item.read) {
      await notificationService.markAsRead(item.id);
      await refresh();
      await load();
    }
    const reqId = item.ref?.requestId;
    if (reqId) {
      navigation.navigate('ReviewRequestDetail', { id: reqId });
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity onPress={() => openNotification(item)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={[styles.title, !item.read && styles.unread]}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          {!item.read && <View style={styles.dot} />}
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
  spacer: { width: 60 },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { ...typography.body, color: colors.text, fontWeight: '700' },
  unread: { color: colors.primary },
  message: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  time: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  dot: { width: 10, height: 10, backgroundColor: colors.primary, borderRadius: 5 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  retryButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: 8, marginTop: spacing.sm },
  retryText: { ...typography.body, color: colors.white, fontWeight: '600' },
});
