import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { authService } from "../../services/authService";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { colors, spacing, typography } from "../../styles/theme";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🔬</Text>
          <Text style={styles.title}>FacialDerma AI</Text>
          <Text style={styles.subtitle}>Welcome back! Please login to continue</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email or Username"
            placeholder="Enter your email or username"
            value={emailOrUsername}
            onChangeText={(text) => {
              setEmailOrUsername(text);
              setErrors({ ...errors, emailOrUsername: "" });
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.emailOrUsername}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: "" });
            }}
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  loginButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
