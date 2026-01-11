import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { authService } from "../services/authService";
import Icon from "react-native-vector-icons/Ionicons";
import { colors, spacing, shadows } from "../styles/theme";

interface User {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  name?: string;
  profileImage?: string;
  isVerified?: boolean;
  // Patient fields
  gender?: string;
  age?: number;
  phone?: string;
  // Dermatologist fields
  specialization?: string;
  clinic?: string;
}

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
    
    // Reload user when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation]);

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
          },
        },
      ]
    );
  };

  const MenuItem = ({ 
    icon, 
    label, 
    onPress, 
    iconColor = "#6B7280" 
  }: { 
    icon: string; 
    label: string; 
    onPress: () => void;
    iconColor?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Icon name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  const displayName = user?.name || user?.username || "User";
  const displayEmail = user?.email || "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundGray} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icon name="camera" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              label="Personal Information"
              onPress={() => navigation.navigate('EditProfile')}
              iconColor="#10B981"
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-closed-outline"
              label="Security & Password"
              onPress={() => navigation.navigate('ChangePassword')}
              iconColor="#10B981"
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => navigation.navigate('Notifications')}
              iconColor="#6B7280"
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Help & FAQ"
              onPress={() => Alert.alert('Help & FAQ', 'Contact support@facialdermaai.com for assistance.')}
              iconColor="#6B7280"
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => Alert.alert('Privacy Policy', 'Your data is securely stored and never shared with third parties without consent.')}
              iconColor="#6B7280"
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.2.0</Text>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#10B981",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#10B981",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.backgroundGray,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#9CA3AF",
  },

  // Menu Section
  menuSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    ...shadows.small,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 68,
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },

  // Version
  versionText: {
    fontSize: 12,
    color: "#D1D5DB",
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
