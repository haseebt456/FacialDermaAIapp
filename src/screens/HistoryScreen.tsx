import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { predictionService, Prediction } from "../services/predictionService";
import Card from "../components/Card";
import Loading from "../components/Loading";
import { colors, spacing, typography, shadows, borderRadius } from "../styles/theme";
import Button from "../components/Button";

export default function HistoryScreen({ navigation }: any) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    const result = await predictionService.getPredictions();
    setLoading(false);

    if (result.success && result.data) {
      // Sort by date, newest first
      const sorted = result.data.sort(
        (a: Prediction, b: Prediction) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPredictions(sorted);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPredictions();
    setRefreshing(false);
  };

  const getConditionColor = (label: string) => {
    const colorMap: any = {
      Acne: colors.acne,
      Melanoma: colors.melanoma,
      Normal: colors.normal,
      Perioral_Dermatitis: colors.perioral,
      Rosacea: colors.rosacea,
      Warts: colors.warts,
    };
    return colorMap[label] || colors.primary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Prediction }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
        <View style={styles.details}>
          <View
            style={[
              styles.label,
              { backgroundColor: getConditionColor(item.result.predicted_label) },
            ]}
          >
            <Text style={styles.labelText}>
              {item.result.predicted_label.replace(/_/g, " ")}
            </Text>
          </View>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceText}>Confidence:</Text>
            <Text style={styles.confidenceValue}>
              {(item.result.confidence_score * 100).toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          <Button
            title="Request Expert Review"
            onPress={() => navigation.navigate('SelectDermatologist', { predictionId: item._id })}
            size="small"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <Loading fullScreen message="Loading history..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analysis History</Text>
        <View style={styles.spacer} />
      </View>

      {predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
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
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.sm,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  spacer: {
    width: 60,
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: "row",
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
    justifyContent: "space-between",
  },
  label: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
  },
  labelText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  confidenceValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  date: {
    ...typography.caption,
    color: colors.textLight,
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
    marginBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  startButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
