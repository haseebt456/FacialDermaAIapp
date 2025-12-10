import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { authService } from "../../services/authService";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import ScreenContainer from "../../components/ScreenContainer";
import { colors, spacing, typography, shadows } from "../../styles/theme";

export default function LoginScreen({ navigation }: any) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    
    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await authService.login({
      emailOrUsername: emailOrUsername.trim(),
      password,
    });
    setLoading(false);

    if (result.success) {
      // Wait a bit for AsyncStorage to update, then the AppNavigator will handle the switch
      setTimeout(() => {
        // The AppNavigator will automatically switch to Main stack when it detects the token
      }, 100);
    } else {
      Alert.alert("Login Failed", result.error);
    }
  };

  return (
    <ScreenContainer
      backgroundColor={colors.backgroundGray}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🔬</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to FacialDerma AI</Text>
      </View>

      <View style={styles.form}>
        <CustomInput
          label="Email or Username"
          placeholder="Enter your email or username"
          value={emailOrUsername}
          onChangeText={(text) => {
            setEmailOrUsername(text);
            setErrors({ ...errors, emailOrUsername: "" });
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="👤"
          error={errors.emailOrUsername}
        />

        <CustomInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors({ ...errors, password: "" });
          }}
          secureTextEntry
          leftIcon="🔒"
          error={errors.password}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <CustomButton
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          fullWidth
          size="large"
          style={styles.loginButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    justifyContent: "center",
    padding: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  logo: {
    fontSize: 56,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: spacing.sm,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
  },
});
