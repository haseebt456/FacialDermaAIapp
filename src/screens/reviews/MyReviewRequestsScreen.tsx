import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { reviewService, ReviewRequest } from '../../services/reviewService';
import Card from '../../components/Card';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';

export default function MyReviewRequestsScreen({ navigation }: any) {
  const [status, setStatus] = useState<'pending' | 'reviewed'>('pending');
  const [items, setItems] = useState<ReviewRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await reviewService.listReviewRequests(status, 50, 0);
    setLoading(false);
    if (res.success) {
      setItems(res.data || []);
    } else {
      setError(res.error || 'Failed to load requests');
      setItems([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ReviewRequest }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ReviewRequestDetail', { id: item.id })}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.titleText}>Request #{item.id.slice(-6)}</Text>
            <Text style={styles.subtitle}>
              {item.dermatologistUsername ? `Derm: ${item.dermatologistUsername}` : 'Dermatologist: —'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: item.status === 'pending' ? colors.warning : colors.success }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
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
        <Text style={styles.headerTitle}>My Review Requests</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setStatus('pending')} style={[styles.tab, status === 'pending' && styles.tabActive]}>
          <Text style={[styles.tabText, status === 'pending' && styles.tabTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatus('reviewed')} style={[styles.tab, status === 'reviewed' && styles.tabActive]}>
          <Text style={[styles.tabText, status === 'reviewed' && styles.tabTextActive]}>Reviewed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <Text style={styles.emptyText}>Loading review requests...</Text>
            ) : error ? (
              <>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>Could Not Load Requests</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={load}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No {status} requests</Text>
                <Text style={styles.emptyText}>
                  {status === 'pending' 
                    ? 'You have not requested any expert reviews yet.'
                    : 'No completed reviews yet.'}
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
  refreshButton: { padding: spacing.sm },
  refreshText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tab: { flex: 1, padding: spacing.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.backgroundGray },
  tabText: { ...typography.body, color: colors.textSecondary },
  tabTextActive: { color: colors.text, fontWeight: '700' },
  card: { margin: spacing.lg, marginBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
  titleText: { ...typography.body, color: colors.text, fontWeight: '600' },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 16 },
  badgeText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  retryButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md, marginTop: spacing.sm },
  retryText: { ...typography.body, color: colors.white, fontWeight: '600' },
});
