import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { authService } from "../../services/authService";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import ScreenContainer from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../styles/theme";

export default function ResetPasswordScreen({ route, navigation }: any) {
  // API requires email + otp + newPassword (not token)
  const { email, otp } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Required", "Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Invalid", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(email, otp, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Password reset successfully! You can now login with your new password.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Auth"),
        },
      ]);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password</Text>

        <CustomInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <CustomInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <CustomButton
          title="Reset Password"
          onPress={handleReset}
          loading={loading}
          fullWidth
          size="large"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});
