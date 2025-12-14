import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, StatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { authService } from "../services/authService";
import { reviewService } from "../services/reviewService";
import Card from "../components/Card";
import Loading from "../components/Loading";
import { colors, spacing, typography, shadows, borderRadius } from "../styles/theme";
import { bottomNavHeight } from "../components/BottomNav";

export default function DermatologistHomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ pending: 0, completed: 0, rejected: 0, total: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const userData = await authService.getStoredUser();
    setUser(userData);

    const requests = await reviewService.listReviewRequests();
    if (requests.success && requests.data) {
      const pending = requests.data.filter((r: any) => r.status === "pending").length;
      const completed = requests.data.filter((r: any) => r.status === "reviewed").length;
      const rejected = requests.data.filter((r: any) => r.status === "rejected").length;
      setStats({ pending, completed, rejected, total: requests.data.length });
      
      // Get recent pending requests (up to 3)
      const pendingRequests = requests.data
        .filter((r: any) => r.status === "pending")
        .slice(0, 3);
      setRecentRequests(pendingRequests);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>Dr. {user?.name || user?.username || "Doctor"}</Text>
        </View>
        <TouchableOpacity 
          style={styles.avatarSmall}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarText}>
            {(user?.name || user?.username)?.charAt(0).toUpperCase() || "D"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Role Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>👨‍⚕️</Text>
        <View style={styles.infoBannerText}>
          <Text style={styles.infoBannerTitle}>Dermatologist Dashboard</Text>
          <Text style={styles.infoBannerDesc}>
            Review patient skin analyses and provide expert consultations
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Review Statistics</Text>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCardWrapper}
          onPress={() => navigation.navigate("DermatologistReviews", { filter: "pending" })}
          activeOpacity={0.7}
        >
          <Card style={styles.statCardPending}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statSubtext}>Awaiting review</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCardWrapper}
          onPress={() => navigation.navigate("DermatologistReviews", { filter: "reviewed" })}
          activeOpacity={0.7}
        >
          <Card style={styles.statCardCompleted}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statSubtext}>Reviews done</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCardWrapper}
          onPress={() => navigation.navigate("DermatologistReviews", { filter: "rejected" })}
          activeOpacity={0.7}
        >
          <Card style={styles.statCardRejected}>
            <Text style={[styles.statNumber, { color: colors.error }]}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
            <Text style={styles.statSubtext}>Declined</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Pending Reviews Section */}
      {stats.pending > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Reviews</Text>
            <TouchableOpacity onPress={() => navigation.navigate("DermatologistReviews")}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>

          {recentRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.requestCard}
              onPress={() => navigation.navigate("DermatologistReviewDetail", { requestId: request.id })}
              activeOpacity={0.7}
            >
              <Card style={styles.requestCardInner}>
                <View style={styles.requestHeader}>
                  <View style={styles.patientAvatar}>
                    <Text style={styles.patientAvatarText}>
                      {request.patientUsername?.charAt(0).toUpperCase() || "P"}
                    </Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.patientName}>{request.patientUsername || "Patient"}</Text>
                    <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                </View>
                <View style={styles.requestFooter}>
                  <Text style={styles.reviewCta}>Tap to review →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Empty State for No Pending */}
      {stats.pending === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            No pending review requests at the moment. Check back later for new patient consultations.
          </Text>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate("DermatologistReviews")}
          activeOpacity={0.7}
        >
          <Card style={styles.actionCard}>
            <View style={[styles.actionIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.actionIcon}>📋</Text>
            </View>
            <Text style={styles.actionTitle}>All Reviews</Text>
            <Text style={styles.actionDesc}>{stats.total} total</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate("Notifications")}
          activeOpacity={0.7}
        >
          <Card style={styles.actionCard}>
            <View style={[styles.actionIconContainer, { backgroundColor: "#FFF4E6" }]}>
              <Text style={styles.actionIcon}>🔔</Text>
            </View>
            <Text style={styles.actionTitle}>Notifications</Text>
            <Text style={styles.actionDesc}>Stay updated</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <Card style={styles.actionCard}>
            <View style={[styles.actionIconContainer, { backgroundColor: "#E8F5E9" }]}>
              <Text style={styles.actionIcon}>⚙️</Text>
            </View>
            <Text style={styles.actionTitle}>Profile</Text>
            <Text style={styles.actionDesc}>Settings</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: bottomNavHeight + spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: "700",
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  username: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "700",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    margin: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  infoBannerIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 2,
  },
  infoBannerDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "700",
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statCardWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statCardPending: {
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  statCardCompleted: {
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  statCardRejected: {
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: "#FFEBEE",
  },
  statNumber: {
    ...typography.h1,
    fontWeight: "700",
    color: "#F9A825",
    marginBottom: 2,
  },
  statLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.text,
  },
  statSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  requestCard: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  requestCardInner: {
    padding: spacing.md,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  patientAvatarText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "700",
  },
  requestInfo: {
    flex: 1,
  },
  patientName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
  },
  requestDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pendingBadge: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  pendingBadgeText: {
    ...typography.caption,
    color: "#F9A825",
    fontWeight: "600",
  },
  requestFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reviewCta: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    textAlign: "right",
  },
  emptyCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
  },
  actionItem: {
    flex: 1,
    marginRight: spacing.sm,
  },
  actionCard: {
    alignItems: "center",
    padding: spacing.md,
    minHeight: 120,
    justifyContent: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  actionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 10,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
