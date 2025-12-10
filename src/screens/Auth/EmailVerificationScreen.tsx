import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { authService } from "../../services/authService";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import ScreenContainer from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../styles/theme";

export default function EmailVerificationScreen({ route, navigation }: any) {
  const { token } = route.params || {};
  const [verifying, setVerifying] = useState(!!token);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmailAsync = async () => {
      const result = await authService.verifyEmail(token);
      setVerifying(false);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Verification failed");
      }
    };

    if (token) {
      verifyEmailAsync();
    }
  }, [token]);

  if (verifying) {
    return <Loading fullScreen message="Verifying your email..." />;
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {success ? (
          <>
            <Text style={styles.icon}>✅</Text>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your email has been successfully verified. You can now log in.
            </Text>
            <CustomButton
              title="Go to Login"
              onPress={() => navigation.navigate("Login")}
              fullWidth
              size="large"
            />
          </>
        ) : (
          <>
            <Text style={styles.icon}>❌</Text>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>{error}</Text>
            <CustomButton
              title="Back to Login"
              onPress={() => navigation.navigate("Login")}
              fullWidth
              size="large"
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
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
