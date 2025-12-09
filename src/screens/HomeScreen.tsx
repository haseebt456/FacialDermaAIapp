import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { authService } from "../services/authService";
import Card from "../components/Card";
import ScreenContainer from "../components/ScreenContainer";
import CustomButton from "../components/CustomButton";
import { colors, spacing, typography, shadows } from "../styles/theme";
import { useNotifications } from "../contexts/NotificationsContext";
import Icon from "react-native-vector-icons/Ionicons";

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await authService.getStoredUser();
    setUser(userData);
  };

  return (
    <ScreenContainer
      backgroundColor={colors.backgroundGray}
      withKeyboardAvoid={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.username || "User"}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.bellButton}
          >
            <Icon name="notifications-outline" size={28} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainCardContainer}>
        <Card style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.mainCardIcon}>🔬</Text>
            </View>
            <View style={styles.mainCardTextContainer}>
              <Text style={styles.cardTitle}>AI Skin Analysis</Text>
              <Text style={styles.cardDescription}>
                Get instant AI-powered skin condition analysis
              </Text>
            </View>
          </View>
          <CustomButton
            title="Start Analysis"
            icon="📸"
            onPress={() => navigation.navigate("Prediction")}
            size="large"
            fullWidth
          />
        </Card>
      </View>

      <View style={styles.quickActionsTitle}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate("History")}
          activeOpacity={0.7}
        >
          <Card style={styles.gridCard}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>📋</Text>
            </View>
            <Text style={styles.gridTitle}>History</Text>
            <Text style={styles.gridDescription}>Past analyses</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('MyReviewRequests')}
          activeOpacity={0.7}
        >
          <Card style={styles.gridCard}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>📝</Text>
            </View>
            <Text style={styles.gridTitle}>Reviews</Text>
            <Text style={styles.gridDescription}>Expert opinions</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <Card style={styles.gridCard}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>👤</Text>
            </View>
            <Text style={styles.gridTitle}>Profile</Text>
            <Text style={styles.gridDescription}>Account settings</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoTitle}>About Our AI</Text>
        </View>
        <Text style={styles.infoText}>
          Our AI system detects: Acne, Melanoma, Rosacea, Warts, and Perioral Dermatitis.
        </Text>
        <View style={styles.disclaimerBox}>
          <Text style={styles.infoNote}>
            ⚠️ This tool assists diagnosis but doesn't replace professional medical advice.
          </Text>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  bellButton: {
    padding: spacing.sm,
  },
  bellIcon: {
    fontSize: 24,
  },
  badge: {
    position: "absolute",
    right: 4,
    top: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
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
    backgroundColor: colors.backgroundGray,
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
    marginTop: spacing.xs,
  },
  gridDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  infoCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "600",
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  disclaimerBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  infoNote: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
});
