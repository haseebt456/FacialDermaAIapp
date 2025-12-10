import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { authService } from "../services/authService";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing, typography, shadows } from "../styles/theme";

export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Required", "Please fill all fields");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Invalid", "New password must be at least 8 characters");
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert("Invalid", "New password must be different from current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setLoading(true);
    const result = await authService.changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Password changed successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <CustomButton
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="small"
        />
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.container}>
        <CustomInput
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        <CustomInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <CustomInput
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <CustomButton
          title="Change Password"
          onPress={handleChangePassword}
          loading={loading}
          fullWidth
          size="large"
        />
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
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "700",
  },
  spacer: {
    width: 60,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
  },
});
