import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { authService } from "../services/authService";
import { reviewService } from "../services/reviewService";
import Card from "../components/Card";
import CustomButton from "../components/CustomButton";
import Loading from "../components/Loading";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing, typography, shadows } from "../styles/theme";

export default function DermatologistHomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ pending: 0, completed: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await authService.getStoredUser();
    setUser(userData);

    const requests = await reviewService.listReviewRequests();
    if (requests.success && requests.data) {
      const pending = requests.data.filter((r: any) => r.status === "pending").length;
      const completed = requests.data.filter((r: any) => r.status === "reviewed").length;
      const rejected = requests.data.filter((r: any) => r.status === "rejected").length;
      setStats({ pending, completed, rejected });
    }

    setLoading(false);
  };

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  return (
    <ScreenContainer backgroundColor={colors.backgroundGray} withKeyboardAvoid={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>Dr. {user?.username || "Doctor"}</Text>
        </View>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || "D"}
          </Text>
        </View>
      </View>

      <View style={styles.mainCardContainer}>
        <Card style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.mainCardIcon}>👨‍⚕️</Text>
            </View>
            <View style={styles.mainCardTextContainer}>
              <Text style={styles.cardTitle}>Review Dashboard</Text>
              <Text style={styles.cardDescription}>
                Manage patient review requests
              </Text>
            </View>
          </View>
          <CustomButton
            title="View Requests"
            icon="📋"
            onPress={() => navigation.navigate("DermatologistReviews")}
            size="large"
            fullWidth
          />
        </Card>
      </View>

      <View style={styles.quickActionsTitle}>
        <Text style={styles.sectionTitle}>Statistics</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCardPending}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>

        <Card style={styles.statCardCompleted}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>

        <Card style={styles.statCardRejected}>
          <Text style={styles.statNumber}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </Card>
      </View>

      <View style={styles.quickActionsTitle}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <Card style={styles.gridCard}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>⚙️</Text>
            </View>
            <Text style={styles.gridTitle}>Profile</Text>
            <Text style={styles.gridDescription}>Settings</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate("Notifications")}
          activeOpacity={0.7}
        >
          <Card style={styles.gridCard}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>🔔</Text>
            </View>
            <Text style={styles.gridTitle}>Notifications</Text>
            <Text style={styles.gridDescription}>Alerts</Text>
          </Card>
        </TouchableOpacity>
      </View>
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
  mainCardContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  mainCard: {
    padding: spacing.xl,
  },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  mainCardIcon: {
    fontSize: 32,
  },
  mainCardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  quickActionsTitle: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    marginRight: spacing.sm,
    alignItems: "center",
  },
  statCardPending: {
    flex: 1,
    padding: spacing.lg,
    marginRight: spacing.sm,
    alignItems: "center",
    backgroundColor: "#FFF4E6",
  },
  statCardCompleted: {
    flex: 1,
    padding: spacing.lg,
    marginRight: spacing.sm,
    alignItems: "center",
    backgroundColor: "#E6F7F5",
  },
  statCardRejected: {
    flex: 1,
    padding: spacing.lg,
    marginRight: spacing.sm,
    alignItems: "center",
    backgroundColor: "#FFE6E6",
  },
  statNumber: {
    ...typography.h1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  gridItem: {
    flex: 1,
    marginRight: spacing.md,
  },
  gridCard: {
    alignItems: "center",
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: "center",
  },
  gridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  gridIcon: {
    fontSize: 28,
  },
  gridTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  gridDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
