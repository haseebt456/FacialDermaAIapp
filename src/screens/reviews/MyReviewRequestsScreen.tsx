import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image, StatusBar } from 'react-native';
import { reviewService, ReviewRequest } from '../../services/reviewService';
import { colors, spacing, shadows } from '../../styles/theme';
import { bottomNavHeight } from '../../components/BottomNav';
import Icon from 'react-native-vector-icons/Ionicons';

type FilterType = 'all' | 'reviewed' | 'pending';

export default function MyReviewRequestsScreen({ navigation }: any) {
  const [items, setItems] = useState<ReviewRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await reviewService.listReviewRequests(undefined, 50, 0);
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
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'reviewed') return item.status === 'reviewed';
    if (activeFilter === 'pending') return item.status === 'pending' || item.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return { text: 'Completed', color: '#10B981', bgColor: '#D1FAE5' };
      case 'pending':
        return { text: 'In Progress', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'rejected':
        return { text: 'Rejected', color: '#EF4444', bgColor: '#FEE2E2' };
      default:
        return { text: 'Pending', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatConditionName = (label: string) => {
    return label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getSpecializationColor = (spec?: string) => {
    if (!spec) return '#6B7280';
    const specLower = spec.toLowerCase();
    if (specLower.includes('clinical')) return '#3B82F6';
    if (specLower.includes('surgical')) return '#8B5CF6';
    if (specLower.includes('cosmetic')) return '#EC4899';
    if (specLower.includes('pediatric')) return '#10B981';
    return '#6B7280';
  };

  const renderItem = ({ item }: { item: ReviewRequest }) => {
    const statusBadge = getStatusBadge(item.status);
    const doctorName = item.dermatologistUsername || 'Specialist';
    const specialization = item.dermatologist?.name || 'Dermatologist';
    const conditionName = item.prediction?.result?.predicted_label 
      ? formatConditionName(item.prediction.result.predicted_label)
      : 'Skin Analysis';
    const dateLabel = item.status === 'reviewed' ? 'Reviewed on' : 'Requested on';
    const dateValue = item.reviewedAt || item.createdAt;

    return (
      <View style={styles.reviewCard}>
        {/* Doctor Header */}
        <View style={styles.doctorHeader}>
          <View style={styles.doctorAvatarContainer}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorInitials}>
                {doctorName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {doctorName}</Text>
            <Text style={[styles.doctorSpecialization, { color: getSpecializationColor(specialization) }]}>
              {specialization}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        {/* Analysis Card */}
        <TouchableOpacity 
          style={styles.analysisCard}
          onPress={() => navigation.navigate('ReviewRequestDetail', { id: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.analysisImageContainer}>
            {item.prediction?.imageUrl ? (
              <Image 
                source={{ uri: item.prediction.imageUrl }} 
                style={styles.analysisImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.analysisImagePlaceholder}>
                <Icon name="image-outline" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>
          <View style={styles.analysisContent}>
            <Text style={styles.analysisTitle}>{conditionName}</Text>
            <Text style={styles.analysisDate}>{dateLabel} {formatDate(dateValue)}</Text>
            <Text style={styles.analysisComment} numberOfLines={3}>
              {item.status === 'reviewed' && item.comment 
                ? item.comment 
                : item.status === 'pending'
                  ? 'Your dermatologist is currently reviewing this analysis. You will receive a detailed recommendation within 24 hours.'
                  : 'Awaiting review from the dermatologist.'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.requestId}>ID: #RV-{item.id.slice(-4).toUpperCase()}</Text>
          {item.status === 'reviewed' && (
            <TouchableOpacity 
              style={styles.viewReportButton}
              onPress={() => navigation.navigate('AnalysisDetail', { 
                requestId: item.id,
                predictionId: item.predictionId 
              })}
            >
              <Text style={styles.viewReportText}>View Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundGray} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All Reviews
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'reviewed' && styles.filterTabActive]}
          onPress={() => setActiveFilter('reviewed')}
        >
          <Text style={[styles.filterText, activeFilter === 'reviewed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'pending' && styles.filterTabActive]}
          onPress={() => setActiveFilter('pending')}
        >
          <Text style={[styles.filterText, activeFilter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22B8DC']} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <Icon name="hourglass-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Loading...</Text>
                <Text style={styles.emptyText}>Fetching your review requests</Text>
              </>
            ) : error ? (
              <>
                <Icon name="alert-circle-outline" size={64} color="#F87171" />
                <Text style={styles.emptyTitle}>Could Not Load Requests</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={load}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Icon name="document-text-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Review Requests</Text>
                <Text style={styles.emptyText}>
                  You haven't requested any expert reviews yet.{'\n'}
                  Upload a scan and request a dermatologist review.
                </Text>
                <TouchableOpacity 
                  style={styles.scanButton}
                  onPress={() => navigation.navigate('Prediction')}
                >
                  <Icon name="camera-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Start New Scan</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#22B8DC',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#22B8DC',
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: bottomNavHeight + spacing.xl,
  },

  // Review Card
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.small,
  },

  // Doctor Header
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  doctorAvatarContainer: {
    marginRight: spacing.md,
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  doctorSpecialization: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Analysis Card
  analysisCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analysisImageContainer: {
    marginRight: spacing.md,
  },
  analysisImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  analysisImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisContent: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  analysisDate: {
    fontSize: 11,
    color: '#22B8DC',
    marginBottom: 6,
  },
  analysisComment: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  requestId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  viewReportButton: {
    backgroundColor: '#22B8DC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewReportText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#22B8DC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
