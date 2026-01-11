import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { predictionService, Prediction } from "../services/predictionService";
import { reviewService } from "../services/reviewService";
import Loading from "../components/Loading";
import Icon from "react-native-vector-icons/Ionicons";
import { colors, spacing, shadows } from "../styles/theme";

export default function HistoryScreen({ navigation }: any) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load predictions
    const result = await predictionService.getPredictions();
    if (result.success && result.data) {
      const sorted = result.data.sort(
        (a: Prediction, b: Prediction) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPredictions(sorted);
    }

    // Load pending reviews count
    const reviewsResult = await reviewService.listReviewRequests('pending');
    if (reviewsResult.success && reviewsResult.data) {
      setPendingCount(reviewsResult.data.length);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (predictionId: string, e?: any) => {
    e?.stopPropagation?.();
    Alert.alert(
      "Delete Analysis",
      "Are you sure you want to delete this analysis?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const prev = predictions;
            setPredictions((curr) => curr.filter((p) => p.id !== predictionId));
            const result = await predictionService.deletePrediction(predictionId);
            if (!result.success) {
              Alert.alert("Delete failed", result.error || "Could not delete.");
              setPredictions(prev);
            }
          },
        },
      ]
    );
  };

  const avgScore = useMemo(() => {
    if (predictions.length === 0) return 0;
    const total = predictions.reduce(
      (sum, p) => sum + (p.result.confidence_score * 100),
      0
    );
    return Math.round(total / predictions.length);
  }, [predictions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatConditionName = (label: string) => {
    const name = label.replace(/_/g, ' ');
    if (name.length > 16) {
      return name.substring(0, 14) + '...';
    }
    return name;
  };

  const renderItem = ({ item }: { item: Prediction }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('AnalysisDetail', { predictionId: item.id })}
      style={styles.analysisCard}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
      
      <View style={styles.cardDetails}>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.cardCondition} numberOfLines={1}>
          {formatConditionName(item.result.predicted_label)}
        </Text>
        <Text style={styles.cardConfidence}>
          {Math.round(item.result.confidence_score * 100)}% Confidence
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AnalysisDetail', { predictionId: item.id })}
        >
          <Icon name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => handleDelete(item.id, e)}
        >
          <Icon name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading fullScreen message="Loading history..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundGray} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Text style={[styles.statValue, styles.statValueBlue]}>{predictions.length}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={[styles.statCard, styles.statCardGray]}>
          <Text style={[styles.statValue, styles.statValueGray]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={[styles.statValue, styles.statValueGreen]}>{avgScore}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Analyses</Text>
        <TouchableOpacity>
          <Text style={styles.selectAllText}>Select All</Text>
        </TouchableOpacity>
      </View>

      {/* Analysis List */}
      {predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="scan-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptyText}>
            Your analysis results will appear here
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate("Prediction")}
          >
            <Text style={styles.startButtonText}>Start First Analysis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={predictions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: "center",
    ...shadows.small,
  },
  statCardBlue: {
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  statCardGray: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCardGreen: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statValueBlue: {
    color: '#3B82F6',
  },
  statValueGray: {
    color: '#6B7280',
  },
  statValueGreen: {
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: "500",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: '#10B981',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },

  // Analysis Card
  analysisCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  cardCondition: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  cardConfidence: {
    fontSize: 13,
    fontWeight: "600",
    color: '#10B981',
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
});
