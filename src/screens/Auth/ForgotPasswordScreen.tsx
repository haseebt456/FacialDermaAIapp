import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { authService } from "../../services/authService";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import ScreenContainer from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../styles/theme";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address");
      return;
    }

    setLoading(true);
    const result = await authService.forgotPassword(email);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Code Sent",
        "A verification code has been sent to your email",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("VerifyOTP", { email }),
          },
        ]
      );
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive a verification code
        </Text>

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomButton
          title="Send Code"
          onPress={handleSendOTP}
          loading={loading}
          fullWidth
          size="large"
        />

        <CustomButton
          title="Back to Login"
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
});
