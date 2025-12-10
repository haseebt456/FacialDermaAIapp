import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { authService } from "../../services/authService";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import ScreenContainer from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../styles/theme";

export default function VerifyOTPScreen({ route, navigation }: any) {
  const { email } = route.params;
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp.trim()) {
      Alert.alert("Required", "Please enter the verification code");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Invalid", "Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    const result = await authService.verifyOTP(email, otp);
    setLoading(false);

    if (result.success) {
      // Navigate to ResetPassword with email and otp (API requires both)
      navigation.navigate("ResetPassword", {
        email,
        otp,
      });
    } else {
      Alert.alert("Verification Failed", result.error);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const result = await authService.forgotPassword(email);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "A new code has been sent to your email");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <CustomInput
          placeholder="Enter 6-digit code"
          value={otp}
          onChangeText={setOTP}
          keyboardType="number-pad"
          maxLength={6}
        />

        <CustomButton
          title="Verify Code"
          onPress={handleVerify}
          loading={loading}
          fullWidth
          size="large"
        />

        <CustomButton
          title="Resend Code"
          onPress={handleResend}
          variant="ghost"
          fullWidth
          size="medium"
        />

        <CustomButton
          title="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          fullWidth
          size="medium"
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
  email: {
    fontWeight: "700",
    color: colors.primary,
  },
});
