import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { reviewService, ReviewRequest } from '../../services/reviewService';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import ScreenContainer from '../../components/ScreenContainer';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';

export default function ReviewRequestDetailScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  const [item, setItem] = useState<ReviewRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await reviewService.getReviewRequest(id);
    setLoading(false);
    if (res.success) {
      setItem(res.data || null);
    } else {
      Alert.alert('Error', res.error);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loading fullScreen message="Loading review request..." />;
  if (!item) return null;

  const getStatusIcon = () => {
    if (item.status === 'pending') return '⏳';
    if (item.status === 'rejected') return '❌';
    return '✅';
  };

  const getStatusColor = () => {
    if (item.status === 'pending') return colors.warning;
    if (item.status === 'rejected') return colors.danger;
    return colors.success;
  };

  return (
    <ScreenContainer
      backgroundColor={colors.backgroundGray}
      withKeyboardAvoid={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review Request</Text>
        <View style={styles.spacer} />
      </View>

      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={styles.statusIconLarge}>{getStatusIcon()}</Text>
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, { color: getStatusColor() }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </Card>

      {item.comment ? (
        <Card style={styles.commentCard}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentIcon}>
              {item.status === 'rejected' ? '❌' : '👨‍⚕️'}
            </Text>
            <Text style={styles.commentTitle}>
              {item.status === 'rejected' ? 'Rejection Reason' : 'Expert Review'}
            </Text>
          </View>
          <View style={styles.commentContent}>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        </Card>
      ) : (
        <Card style={styles.pendingCard}>
          <Text style={styles.pendingIcon}>⏳</Text>
          <Text style={styles.pendingTitle}>Review Pending</Text>
          <Text style={styles.pendingText}>
            Your request is being reviewed by the dermatologist. You'll receive a notification once completed.
          </Text>
        </Card>
      )}
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
  title: { ...typography.h2, color: colors.text, fontWeight: '700' },
  spacer: { width: 60 },
  statusCard: { margin: spacing.lg, padding: spacing.xl },
  statusHeader: { flexDirection: 'row', alignItems: 'center' },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusIconLarge: { fontSize: 32 },
  statusTextContainer: { flex: 1 },
  statusLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  statusValue: { ...typography.h2, fontWeight: '700', letterSpacing: 0.5 },
  commentCard: { margin: spacing.lg, marginTop: 0, padding: spacing.xl },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  commentIcon: { fontSize: 28, marginRight: spacing.sm },
  commentTitle: { ...typography.h3, color: colors.text, fontWeight: '700' },
  commentContent: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  commentText: { ...typography.body, color: colors.text, lineHeight: 24 },
  pendingCard: { margin: spacing.lg, marginTop: 0, padding: spacing.xl, alignItems: 'center' },
  pendingIcon: { fontSize: 64, marginBottom: spacing.md },
  pendingTitle: { ...typography.h3, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  pendingText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
