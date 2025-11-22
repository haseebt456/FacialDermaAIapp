import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { predictionService, Prediction } from '../services/predictionService'
import { reviewService, ReviewRequest } from '../services/reviewService';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ScreenContainer from '../components/ScreenContainer';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/theme';

export default function AnalysisDetailScreen({ route, navigation }: any) {
  const { requestId, predictionId } = route.params || {};
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [reviewRequest, setReviewRequest] = useState<ReviewRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    
    // Load review request if requestId is provided
    if (requestId) {
      const reviewRes = await reviewService.getReviewRequest(requestId);
      if (reviewRes.success && reviewRes.data) {
        setReviewRequest(reviewRes.data);
        
        // Load prediction using predictionId from review request
        const predId = reviewRes.data.predictionId;
        if (predId) {
          const allPredictionsRes = await predictionService.getPredictions();
          if (allPredictionsRes.success) {
            const pred = allPredictionsRes.data?.find(p => p.id === predId);
            if (pred) setPrediction(pred);
          }
        }
      }
    } else if (predictionId) {
      // Load only prediction if only predictionId is provided
      const allPredictionsRes = await predictionService.getPredictions();
      if (allPredictionsRes.success) {
        const pred = allPredictionsRes.data?.find(p => p.id === predictionId);
        if (pred) setPrediction(pred);
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, predictionId]);

  if (loading) return <Loading fullScreen message="Loading details..." />;
  
  if (!prediction && !reviewRequest) {
    return (
      <ScreenContainer backgroundColor={colors.backgroundGray}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Details</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Not Found</Text>
          <Text style={styles.errorText}>Unable to load notification details.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const getStatusIcon = () => {
    if (!reviewRequest) return '📋';
    if (reviewRequest.status === 'pending') return '⏳';
    if (reviewRequest.status === 'rejected') return '❌';
    return '✅';
  };

  const getStatusColor = () => {
    if (!reviewRequest) return colors.primary;
    if (reviewRequest.status === 'pending') return colors.warning;
    if (reviewRequest.status === 'rejected') return colors.danger;
    return colors.success;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return colors.warning;
    return colors.error;
  };

  return (
    <ScreenContainer backgroundColor={colors.backgroundGray}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analysis Details</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Prediction Section */}
        {prediction && (
          <>
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🔬</Text>
                <Text style={styles.sectionTitle}>AI Analysis</Text>
              </View>
              
              {prediction.imageUrl && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: prediction.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              )}
              
              <View style={styles.resultContainer}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Detected Condition</Text>
                  <Text style={styles.resultValue}>{prediction.result.predicted_label}</Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Confidence Score</Text>
                  <Text style={[
                    styles.resultValue,
                    { color: getConfidenceColor(prediction.result.confidence_score) }
                  ]}>
                    {(prediction.result.confidence_score * 100).toFixed(1)}%
                  </Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${prediction.result.confidence_score * 100}%`,
                        backgroundColor: getConfidenceColor(prediction.result.confidence_score),
                      },
                    ]}
                  />
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Analysis Date</Text>
                  <Text style={styles.resultValue}>
                    {new Date(prediction.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.disclaimerCard}>
              <Text style={styles.disclaimerIcon}>⚠️</Text>
              <Text style={styles.disclaimerText}>
                This is an AI-generated analysis and should not replace professional medical advice.
                Consult with a dermatologist for accurate diagnosis and treatment.
              </Text>
            </Card>
          </>
        )}

        {/* Review Request Section */}
        {reviewRequest && (
          <>
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>👨‍⚕️</Text>
                <Text style={styles.sectionTitle}>Expert Review</Text>
              </View>

              <View style={styles.statusContainer}>
                <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor() + '20' }]}>
                  <Text style={styles.statusIconLarge}>{getStatusIcon()}</Text>
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <Text style={[styles.statusValue, { color: getStatusColor() }]}>
                    {reviewRequest.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dermatologist</Text>
                <Text style={styles.infoValue}>
                  Dr. {reviewRequest.dermatologistUsername || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Request Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(reviewRequest.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              {reviewRequest.reviewedAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Review Date</Text>
                  <Text style={styles.infoValue}>
                    {new Date(reviewRequest.reviewedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              )}
            </Card>

            {reviewRequest.comment ? (
              <Card style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentIcon}>
                    {reviewRequest.status === 'rejected' ? '❌' : '💬'}
                  </Text>
                  <Text style={styles.commentTitle}>
                    {reviewRequest.status === 'rejected' ? 'Rejection Reason' : 'Expert Opinion'}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentText}>{reviewRequest.comment}</Text>
                </View>
              </Card>
            ) : reviewRequest.status === 'pending' ? (
              <Card style={styles.pendingCard}>
                <Text style={styles.pendingIcon}>⏳</Text>
                <Text style={styles.pendingTitle}>Review Pending</Text>
                <Text style={styles.pendingText}>
                  The dermatologist is reviewing your case. You'll receive a notification once the review is complete.
                </Text>
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
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
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resultContainer: {
    gap: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resultValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  disclaimerCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#FFF8E1',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  disclaimerText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusIconLarge: {
    fontSize: 32,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    ...typography.h2,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  commentCard: {
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  commentIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  commentTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  commentContent: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  commentText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  pendingCard: {
    marginBottom: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  pendingIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  pendingTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  pendingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
