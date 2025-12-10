import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { reviewService } from "../services/reviewService";
import Card from "../components/Card";
import Loading from "../components/Loading";
import CustomButton from "../components/CustomButton";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing, typography, shadows, borderRadius } from "../styles/theme";
import { bottomNavHeight } from "../components/BottomNav";

export default function DermatologistReviewsScreen({ navigation }: any) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const result = await reviewService.listReviewRequests();
    setLoading(false);

    if (result.success && result.data) {
      setRequests(result.data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "completed":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.patientName}>
            Patient: {item.patient?.username || "Unknown"}
          </Text>
          <Text style={styles.date}>Requested: {formatDate(item.createdAt)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      {item.prediction && (
        <View style={styles.predictionInfo}>
          <Image
            source={{ uri: item.prediction.imageUrl }}
            style={styles.thumbnail}
          />
          <View style={styles.predictionDetails}>
            <Text style={styles.predictionLabel}>
              {item.prediction.result.predicted_label?.replace(/_/g, " ")}
            </Text>
            <Text style={styles.confidence}>
              Confidence:{" "}
              {(item.prediction.result.confidence_score * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      )}

      {item.status === "pending" && (
        <CustomButton
          title="Review Case"
          icon="📝"
          onPress={() =>
            navigation.navigate("DermatologistReviewDetail", {
              requestId: item.id,
            })
          }
          size="small"
          fullWidth
        />
      )}

      {item.status === "completed" && item.review && (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewLabel}>Your Review:</Text>
          <Text style={styles.reviewComment}>{item.review.comment}</Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <Loading fullScreen message="Loading requests..." />;
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.backgroundGray}>
      <View style={styles.header}>
        <CustomButton
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="small"
        />
        <Text style={styles.title}>Review Requests</Text>
        <View style={styles.spacer} />
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Requests Yet</Text>
          <Text style={styles.emptyText}>
            Patient review requests will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: bottomNavHeight + spacing.xl,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  spacer: {
    width: 60,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  patientName: {
    ...typography.body,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
  },
  predictionInfo: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  predictionDetails: {
    flex: 1,
    justifyContent: "center",
  },
  predictionLabel: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  confidence: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reviewBox: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  reviewLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewComment: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
