import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { authService } from "../services/authService";
import Card from "../components/Card";
import ScreenContainer from "../components/ScreenContainer";
import CustomButton from "../components/CustomButton";
import { colors, spacing, typography, shadows } from "../styles/theme";

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const result = await authService.getCurrentUser();
    if (result.success) {
      setUser(result.data);
    } else {
      const storedUser = await authService.getStoredUser();
      setUser(storedUser);
    }
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
    <ScreenContainer
      backgroundColor={colors.backgroundGray}
      withKeyboardAvoid={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username || "User"}</Text>
        <Text style={styles.role}>
          {user?.role === 'dermatologist' ? 'Dermatologist' : 'Patient'}
        </Text>
      </View>

      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user?.username || "-"}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || "-"}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>
            {user?.role === 'dermatologist' ? 'Dermatologist' : 'Patient'}
          </Text>
        </View>
      </Card>

      <Card style={styles.menuCard}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.menuText}>✏️ Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.menuText}>🔑 Change Password</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.menuText}>🔔 Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.logoutContainer}>
        <CustomButton
          title="Logout"
          icon="🚪"
          onPress={handleLogout}
          variant="danger"
          size="large"
          fullWidth
        />
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScreenContainer>
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
  avatarContainer: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
    fontSize: 40,
  },
  username: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  role: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  menuCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.text,
  },
  menuArrow: {
    ...typography.h2,
    color: colors.textLight,
  },
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  version: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});
