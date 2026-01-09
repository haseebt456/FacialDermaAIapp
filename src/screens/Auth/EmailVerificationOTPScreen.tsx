import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { authService } from "../../services/authService";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import ScreenContainer from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../styles/theme";

export default function EmailVerificationOTPScreen({ route, navigation }: any) {
  const presetEmail = route?.params?.email || "";
  const [email, setEmail] = useState(presetEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!email.trim() || !otp.trim()) {
      Alert.alert("Required", "Please enter email and OTP");
      return;
    }
    if (otp.length !== 6) {
      Alert.alert("Invalid", "OTP should be 6 digits");
      return;
    }

    setLoading(true);
    const result = await authService.verifyEmailOtp(email.trim(), otp.trim());
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Email verified. You can now log in.", [
        { text: "OK", onPress: () => navigation.navigate("Auth") },
      ]);
    } else {
      Alert.alert("Verification Failed", result.error);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email to resend");
      return;
    }
    setResending(true);
    const result = await authService.resendVerificationEmail(email.trim());
    setResending(false);

    if (result.success) {
      Alert.alert("Sent", "A new verification email/OTP has been sent.");
    } else {
      Alert.alert("Unable to send", result.error);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email with OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your email. Check spam if you don't see it.
        </Text>

        <CustomInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomInput
          label="OTP"
          placeholder="6-digit code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />

        <CustomButton
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          fullWidth
          size="large"
        />

        <CustomButton
          title="Resend Code"
          onPress={handleResend}
          loading={resending}
          variant="ghost"
          fullWidth
        />

        <CustomButton
          title="Back to Login"
          onPress={() => navigation.navigate("Auth")}
          variant="ghost"
          fullWidth
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
    marginBottom: spacing.lg,
  },
});
