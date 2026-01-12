import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { predictionService, Prediction } from '../services/predictionService'
import { reviewService, ReviewRequest } from '../services/reviewService';
import { treatmentService, TreatmentSuggestion } from '../services/treatmentService';
import { reportService } from '../services/reportService';
import { authService } from '../services/authService';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, shadows } from '../styles/theme';

export default function AnalysisDetailScreen({ route, navigation }: any) {
  const { requestId, predictionId } = route.params || {};
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [reviewRequest, setReviewRequest] = useState<ReviewRequest | null>(null);
  const [treatment, setTreatment] = useState<TreatmentSuggestion | null>(null);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [userName, setUserName] = useState<string>('');

  const load = async () => {
    setLoading(true);
    
    // Get user name
    const user = await authService.getStoredUser();
    if (user?.username) {
      setUserName(user.username);
    }
    
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
            if (pred) {
              setPrediction(pred);
              // Fetch treatment for this condition
              fetchTreatment(pred.result.predicted_label);
            }
          }
        }
      }
    } else if (predictionId) {
      // Load prediction if predictionId is provided
      const allPredictionsRes = await predictionService.getPredictions();
      if (allPredictionsRes.success) {
        const pred = allPredictionsRes.data?.find(p => p.id === predictionId);
        if (pred) {
          setPrediction(pred);
          // Fetch treatment for this condition
          fetchTreatment(pred.result.predicted_label);
        }
      }
      
      // Also check if there's a review request for this prediction
      const reviewsRes = await reviewService.listReviewRequests();
      if (reviewsRes.success && reviewsRes.data) {
        // Find review request that matches this prediction
        const matchingReview = reviewsRes.data.find(
          (r: ReviewRequest) => r.predictionId === predictionId
        );
        if (matchingReview) {
          setReviewRequest(matchingReview);
        }
      }
    }
    
    setLoading(false);
  };

  const fetchTreatment = async (conditionName: string) => {
    setLoadingTreatment(true);
    try {
      console.log('Fetching treatment for:', conditionName);
      const res = await treatmentService.getTreatmentByName(conditionName);
      console.log('Treatment response:', res);
      if (res.success && res.data) {
        setTreatment(res.data);
      } else {
        console.log('Treatment not found by name, trying to get all treatments...');
        // Fallback: get all treatments and find matching one
        const allRes = await treatmentService.getAllTreatments();
        console.log('All treatments:', allRes);
        if (allRes.success && allRes.data) {
          const match = allRes.data.find((t: TreatmentSuggestion) => 
            t.name.toLowerCase() === conditionName.toLowerCase() ||
            t.name.toLowerCase().replace(/_/g, ' ') === conditionName.toLowerCase() ||
            t.name.toLowerCase().replace(/\s+/g, '_') === conditionName.toLowerCase().replace(/\s+/g, '_')
          );
          if (match) {
            console.log('Found matching treatment:', match);
            setTreatment(match);
          } else {
            console.log('No matching treatment found in all treatments');
          }
        }
      }
    } catch (error) {
      console.log('Error fetching treatment:', error);
    } finally {
      setLoadingTreatment(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, predictionId]);

  const handleDownload = async () => {
    if (!prediction) return;
    
    setDownloading(true);
    try {
      const result = await reportService.downloadReport({
        prediction,
        reviewRequest,
        treatment,
        userName,
      });
      
      if (result.success) {
        // Extract just the filename for cleaner message
        const fileName = result.filePath?.split('/').pop() || 'Report';
        Alert.alert(
          'Download Complete ✓',
          `Report saved successfully!\n\nFile: ${fileName}\n\nYou can find it in your Downloads folder using any file manager app.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Download Failed', result.error || 'Failed to download report');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loading fullScreen message="Loading details..." />;
  
  if (!prediction && !reviewRequest) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundGray} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Analysis Detail</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Not Found</Text>
          <Text style={styles.errorText}>Unable to load analysis details.</Text>
        </View>
      </View>
    );
  }

  const formatConditionName = (label: string) => {
    return label.replace(/_/g, ' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const confidencePercent = prediction ? Math.round(prediction.result.confidence_score * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundGray} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Analysis Detail</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        {prediction && (
          <>
            <View style={styles.imageCard}>
              <Image
                source={{ uri: prediction.imageUrl }}
                style={styles.analysisImage}
                resizeMode="cover"
              />
              <View style={styles.imageBadge}>
                <Icon name="scan" size={16} color="#10B981" />
              </View>
            </View>

            {/* Condition Info */}
            <View style={styles.conditionSection}>
              <View style={styles.conditionHeader}>
                <Text style={styles.conditionName}>
                  {formatConditionName(prediction.result.predicted_label)}
                </Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{confidencePercent}% Match</Text>
                </View>
              </View>
              <Text style={styles.analysisDate}>
                Analyzed on {formatDate(prediction.createdAt)}
              </Text>
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>CONFIDENCE</Text>
                <Text style={[styles.infoValue, styles.infoValueGreen]}>{confidencePercent}%</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>REVIEW STATUS</Text>
                <Text style={[
                  styles.infoValue, 
                  reviewRequest 
                    ? (reviewRequest.status === 'reviewed' ? styles.infoValueGreen : styles.infoValueYellow) 
                    : styles.infoValueGray
                ]}>
                  {reviewRequest ? (reviewRequest.status === 'reviewed' ? 'Reviewed' : 'Pending') : 'Not Reviewed'}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>CONDITION</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {formatConditionName(prediction.result.predicted_label).split(' ')[0]}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>ANALYZED</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {new Date(prediction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Treatment Recommendations Section */}
        {prediction && (
          <>
            {loadingTreatment ? (
              <View style={styles.treatmentLoading}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.treatmentLoadingText}>Loading recommendations...</Text>
              </View>
            ) : treatment ? (
              <View style={styles.treatmentSection}>
                <View style={styles.treatmentHeader}>
                  <Icon name="medkit" size={20} color="#10B981" />
                  <Text style={styles.treatmentTitle}>Treatment & Prevention</Text>
                </View>

                {/* Treatments */}
                {treatment.treatments && treatment.treatments.length > 0 && (
                  <View style={styles.treatmentSubSection}>
                    <Text style={styles.treatmentSubTitle}>Treatments</Text>
                    {treatment.treatments.map((item, index) => (
                      <View key={index} style={styles.treatmentItem}>
                        <Icon name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.treatmentItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Prevention */}
                {treatment.prevention && treatment.prevention.length > 0 && (
                  <View style={styles.treatmentSubSection}>
                    <Text style={styles.treatmentSubTitle}>Prevention Tips</Text>
                    {treatment.prevention.map((tip, index) => (
                      <View key={index} style={styles.treatmentItem}>
                        <Icon name="shield-checkmark" size={16} color="#3B82F6" />
                        <Text style={styles.treatmentItemText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noTreatmentCard}>
                <Icon name="information-circle-outline" size={24} color="#9CA3AF" />
                <Text style={styles.noTreatmentText}>
                  No specific treatment recommendations available for this condition yet.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Doctor Review Section */}
        {reviewRequest && reviewRequest.status === 'reviewed' && (
          <>
            <View style={styles.doctorCard}>
              <View style={styles.doctorAvatar}>
                <Icon name="person" size={24} color="#6B7280" />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>
                  Dr. {reviewRequest.dermatologistUsername || 'Specialist'}
                </Text>
                <Text style={styles.doctorTitle}>Board Certified Dermatologist</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={22} color="#3B82F6" />
              </View>
            </View>

            {reviewRequest.comment && (
              <View style={styles.reviewCard}>
                <Text style={styles.reviewText}>
                  "{reviewRequest.comment}"
                </Text>
              </View>
            )}
          </>
        )}

        {/* Pending Review */}
        {reviewRequest && reviewRequest.status === 'pending' && (
          <View style={styles.pendingCard}>
            <View style={styles.pendingHeader}>
              <View style={styles.doctorAvatar}>
                <Icon name="person" size={24} color="#6B7280" />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>
                  Dr. {reviewRequest.dermatologistUsername || 'Specialist'}
                </Text>
                <Text style={styles.doctorTitle}>Review Pending</Text>
              </View>
              <View style={styles.pendingBadge}>
                <Icon name="time-outline" size={22} color="#F59E0B" />
              </View>
            </View>
            <Text style={styles.pendingText}>
              The dermatologist is reviewing your case. You'll receive a notification once the review is complete.
            </Text>
          </View>
        )}

        {/* Request Review Button (if no review exists) */}
        {prediction && !reviewRequest && (
          <TouchableOpacity 
            style={styles.requestReviewButton}
            onPress={() => navigation.navigate('SelectDermatologist', { predictionId: prediction.id })}
          >
            <Icon name="medical-outline" size={20} color="#10B981" />
            <Text style={styles.requestReviewText}>Request Expert Review</Text>
          </TouchableOpacity>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.downloadButton, downloading && styles.buttonDisabled]}
          onPress={handleDownload}
          disabled={downloading || !prediction}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Icon name="download-outline" size={20} color={colors.white} />
          )}
          <Text style={styles.downloadButtonText}>{downloading ? 'Downloading...' : 'Download Report'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Header
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  spacer: {
    width: 40,
  },

  // Image Section
  imageCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
    position: 'relative',
    ...shadows.small,
  },
  analysisImage: {
    width: '100%',
    aspectRatio: 1.3,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imageBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Condition Section
  conditionSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conditionName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  matchBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  analysisDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  infoCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.small,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  infoValueGreen: {
    color: '#10B981',
  },
  infoValueYellow: {
    color: '#F59E0B',
  },
  infoValueGray: {
    color: '#6B7280',
  },

  // Doctor Card
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.lg,
    ...shadows.small,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
  doctorTitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  verifiedBadge: {
    marginLeft: spacing.sm,
  },

  // Review Card
  reviewCard: {
    backgroundColor: '#E6F7F1',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  reviewText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
    lineHeight: 22,
  },

  // Pending Card
  pendingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.small,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pendingBadge: {
    marginLeft: spacing.sm,
  },
  pendingText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Request Review Button
  requestReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  requestReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 100,
    backgroundColor: colors.white,
    gap: spacing.md,
    ...shadows.medium,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 20,
  },

  // Treatment Section
  treatmentLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.small,
  },
  treatmentLoadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  treatmentSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.small,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  treatmentSubSection: {
    marginTop: spacing.md,
  },
  treatmentSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  treatmentItemText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  noTreatmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  noTreatmentText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
