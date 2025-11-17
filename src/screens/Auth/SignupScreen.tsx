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

export default function SignupScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.includes(" ")) {
      newErrors.username = "Username cannot contain spaces";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await authService.signup({
      username: username.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Success",
        "Account created successfully! Please login.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } else {
      Alert.alert("Signup Failed", result.error);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join FacialDerma AI today</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors({ ...errors, username: "" });
            }}
            autoCapitalize="none"
            error={errors.username}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: "" });
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: "" });
            }}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors({ ...errors, confirmPassword: "" });
            }}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.link}>Login</Text>
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
  signupButton: {
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
