import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { authService } from "../services/authService";
import { predictionService } from "../services/predictionService";
import { colors, spacing, shadows } from "../styles/theme";
import { useNotifications } from "../contexts/NotificationsContext";
import Icon from "react-native-vector-icons/Ionicons";

interface AnalysisItem {
  id: string;
  title: string;
  date: string;
  status: 'low' | 'attention' | 'normal';
  confidence?: number;
  condition?: string;
  hasReview?: boolean;
}

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();

  const loadRecentAnalyses = useCallback(async () => {
    try {
      const result = await predictionService.getPredictions();
      if (result.success && result.data) {
        const analyses = result.data.slice(0, 3).map((item: any, index: number) => ({
          id: item._id || item.id || `analysis-${index}`,
          title: item.condition ? `${item.condition} Scan` : `Skin Scan #${String(index + 1).padStart(3, '0')}`,
          date: formatDate(item.createdAt || item.date),
          status: getStatusFromCondition(item.condition, item.confidence),
          confidence: item.confidence,
          condition: item.condition,
          hasReview: item.hasReview || false,
        }));
        setRecentAnalyses(analyses);
      }
    } catch (error) {
      console.log('Failed to load recent analyses');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    const userData = await authService.getStoredUser();
    setUser(userData);
  };

  useEffect(() => {
    loadUser();
    loadRecentAnalyses();
  }, [loadRecentAnalyses]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getStatusFromCondition = (condition: string, confidence?: number): 'low' | 'attention' | 'normal' => {
    const lowRiskConditions = ['normal', 'healthy'];
    const highRiskConditions = ['melanoma'];
    
    if (!condition) return 'normal';
    const conditionLower = condition.toLowerCase();
    
    if (lowRiskConditions.some(c => conditionLower.includes(c))) return 'low';
    if (highRiskConditions.some(c => conditionLower.includes(c))) return 'attention';
    if (confidence && confidence < 70) return 'attention';
    return 'low';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'low':
        return { label: 'Low Risk', bgColor: '#E8F5E9', textColor: '#2E7D32' };
      case 'attention':
        return { label: 'Attention', bgColor: '#FFF3E0', textColor: '#E65100' };
      default:
        return { label: 'Normal', bgColor: '#E3F2FD', textColor: '#1565C0' };
    }
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.username) {
      return user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    return 'User';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundGray} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{getUserDisplayName()}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notificationButton}
          >
            <Icon name="notifications-outline" size={24} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Card - AI Analysis */}
        <TouchableOpacity 
          activeOpacity={0.95}
          onPress={() => navigation.navigate("Prediction")}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Icon name="sparkles" size={12} color="#0EA5E9" />
              <Text style={styles.heroBadgeText}>AI-Powered Analysis</Text>
            </View>
            
            <Text style={styles.heroTitle}>Check Your Skin Health</Text>
            <Text style={styles.heroDescription}>
              Upload a photo for instant detection of acne, eczema, or other conditions.
            </Text>
            
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => navigation.navigate("Prediction")}
              activeOpacity={0.8}
            >
              <Icon name="camera-outline" size={18} color="#0284C7" />
              <Text style={styles.heroButtonText}>Start New Scan</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Recent Analysis */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Analysis</Text>
            <TouchableOpacity onPress={() => navigation.navigate("History")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : recentAnalyses.length > 0 ? (
            <View style={styles.analysisListCard}>
              {recentAnalyses.map((item, index) => {
                const statusConfig = getStatusConfig(item.status);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.analysisItem,
                      index < recentAnalyses.length - 1 && styles.analysisItemBorder
                    ]}
                    onPress={() => navigation.navigate("AnalysisDetail", { predictionId: item.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.analysisIconContainer}>
                      <Icon name="scan-outline" size={20} color="#6B7280" />
                    </View>
                    <View style={styles.analysisContent}>
                      <Text style={styles.analysisTitle}>{item.title}</Text>
                      <Text style={styles.analysisDate}>
                        {item.date}
                        {item.confidence && ` • ${Math.round(item.confidence)}% Confidence`}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                      <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Icon name="scan-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No recent analyses</Text>
              <Text style={styles.emptySubtext}>Start your first scan to see results here</Text>
            </View>
          )}
        </View>

        {/* Expert Review Card */}
        <TouchableOpacity 
          style={styles.expertCard}
          onPress={() => navigation.navigate("SelectDermatologist")}
          activeOpacity={0.8}
        >
          <View style={styles.expertContent}>
            <Text style={styles.expertLabel}>Expert Review</Text>
            <Text style={styles.expertDescription}>
              Get a certified dermatologist to review your latest scan results.
            </Text>
          </View>
          <View style={styles.expertArrow}>
            <Icon name="arrow-forward" size={20} color="#D97706" />
          </View>
        </TouchableOpacity>

        {/* Bottom spacing for nav bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0284C7',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundGray,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },

  // Hero Card
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 20,
    padding: spacing.xl,
    backgroundColor: '#0EA5E9',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
    marginLeft: 8,
  },

  // Section
  sectionContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Analysis List
  analysisListCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    ...shadows.small,
    overflow: 'hidden',
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
  },
  analysisItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  analysisIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.small,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Expert Card
  expertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: 16,
    padding: spacing.lg,
  },
  expertContent: {
    flex: 1,
  },
  expertLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 4,
  },
  expertDescription: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  expertArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
