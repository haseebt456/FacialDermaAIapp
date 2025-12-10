import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { reviewService } from "../services/reviewService";
import Card from "../components/Card";
import CustomButton from "../components/CustomButton";
import Loading from "../components/Loading";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing, typography, shadows, borderRadius } from "../styles/theme";

export default function DermatologistReviewDetailScreen({ route, navigation }: any) {
  const { requestId } = route.params;
  const [request, setRequest] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRequest = useCallback(async () => {
    const result = await reviewService.getReviewRequest(requestId);
    if (result.success) {
      setRequest(result.data);
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert("Required", "Please enter your review comment");
      return;
    }

    Alert.alert(
      "Submit Review",
      "Are you sure you want to submit this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setSubmitting(true);
            const result = await reviewService.submitReview(requestId, comment);
            setSubmitting(false);

            if (result.success) {
              Alert.alert("Success", "Review submitted successfully", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } else {
              Alert.alert("Error", result.error);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);
            // Use rejectReview with optional reason
            const result = await reviewService.rejectReview(requestId, comment.trim() || undefined);
            setSubmitting(false);

            if (result.success) {
              Alert.alert("Success", "Request rejected", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } else {
              Alert.alert("Error", result.error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen message="Loading request..." />;
  }

  if (!request) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Request not found</Text>
          <CustomButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            size="large"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <CustomButton
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="small"
        />
        <Text style={styles.title}>Review Detail</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>
              {request.patient?.username || "Unknown"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>
              {request.patient?.email || "N/A"}
            </Text>
          </View>
        </Card>

        {request.prediction && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>AI Analysis Result</Text>
            <Image
              source={{ uri: request.prediction.imageUrl }}
              style={styles.image}
            />
            <View style={styles.predictionCard}>
              <Text style={styles.predictionLabel}>
                {request.prediction.result.predicted_label?.replace(/_/g, " ")}
              </Text>
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confidence:</Text>
                <Text style={styles.confidenceValue}>
                  {(request.prediction.result.confidence_score * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${request.prediction.result.confidence_score * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Your Professional Review</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter your diagnosis, recommendations, or comments..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </Card>

        <View style={styles.actionButtons}>
          <CustomButton
            title="Submit Review"
            icon="✅"
            onPress={handleSubmit}
            loading={submitting}
            size="large"
            fullWidth
            style={{ marginBottom: spacing.md }}
          />
          <CustomButton
            title="Reject Request"
            icon="❌"
            onPress={handleReject}
            loading={submitting}
            variant="outline"
            size="large"
            fullWidth
            style={{ borderColor: colors.error, marginBottom: spacing.xl }}
          />
        </View>
      </ScrollView>
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
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    width: 80,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  predictionCard: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  predictionLabel: {
    ...typography.h3,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  confidenceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  confidenceValue: {
    ...typography.body,
    fontWeight: "700",
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.white,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  textArea: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 150,
    backgroundColor: colors.white,
  },
  actionButtons: {
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.lg,
  },
});
