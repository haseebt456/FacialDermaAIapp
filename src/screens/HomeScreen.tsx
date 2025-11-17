import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { authService } from "../services/authService";
import Card from "../components/Card";
import { colors, spacing, typography, shadows } from "../styles/theme";

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await authService.getStoredUser();
    setUser(userData);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await authService.logout();
            // The AppNavigator will automatically switch to Auth stack when it detects no token
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username || "User"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.mainCard}>
        <Text style={styles.cardTitle}>🔬 Skin Analysis</Text>
        <Text style={styles.cardDescription}>
          Upload or capture a photo to analyze skin conditions using AI technology
        </Text>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => navigation.navigate("Prediction")}
        >
          <Text style={styles.analyzeButtonText}>Start Analysis</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate("History")}
        >
          <Card style={styles.gridCard}>
            <Text style={styles.gridIcon}>📋</Text>
            <Text style={styles.gridTitle}>History</Text>
            <Text style={styles.gridDescription}>View past analyses</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Card style={styles.gridCard}>
            <Text style={styles.gridIcon}>👤</Text>
            <Text style={styles.gridTitle}>Profile</Text>
            <Text style={styles.gridDescription}>Manage account</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>About FacialDerma AI</Text>
        <Text style={styles.infoText}>
          Our AI-powered system can detect various skin conditions including Acne, Melanoma, 
          Rosacea, Warts, and Perioral Dermatitis with high accuracy.
        </Text>
        <Text style={styles.infoNote}>
          ⚠️ Note: This is not a substitute for professional medical advice.
        </Text>
      </Card>
    </ScrollView>
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
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  username: {
    ...typography.h2,
    color: colors.text,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontWeight: "600",
  },
  mainCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  analyzeButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  gridCard: {
    alignItems: "center",
    padding: spacing.lg,
  },
  gridIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  gridTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  gridDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  infoCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  infoNote: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: "600",
  },
});
