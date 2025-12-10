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

export default function SignupScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [license, setLicense] = useState(""); // License for dermatologists
  const [role, setRole] = useState<'patient' | 'dermatologist'>('patient');
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

    // License is required for dermatologists
    if (role === 'dermatologist' && !license.trim()) {
      newErrors.license = "License number is required for dermatologists";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    const signupData: any = {
      username: username.trim(),
      email: email.trim(),
      password,
      role,
    };

    // Add license for dermatologists
    if (role === 'dermatologist') {
      signupData.license = license.trim();
    }

    const result = await authService.signup(signupData);
    setLoading(false);

    if (result.success) {
      const message = role === 'dermatologist'
        ? "Registration successful! Please verify your email. Your account will be activated after admin approval."
        : "Registration successful! Please check your email to verify your account.";
      
      Alert.alert(
        "Success",
        message,
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
    <ScreenContainer
      backgroundColor={colors.backgroundGray}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🔬</Text>
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join FacialDerma AI and start your journey</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.roleSelector}>
          <Text style={styles.roleLabel}>I am a:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'patient' && styles.roleButtonActive,
              ]}
              onPress={() => setRole('patient')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'patient' && styles.roleButtonTextActive,
                ]}
              >
                👤 Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'dermatologist' && styles.roleButtonActive,
              ]}
              onPress={() => setRole('dermatologist')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'dermatologist' && styles.roleButtonTextActive,
                ]}
              >
                👨‍⚕️ Dermatologist
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomInput
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrors({ ...errors, username: "" });
          }}
          autoCapitalize="none"
          leftIcon="👤"
          error={errors.username}
          helperText="No spaces allowed"
        />

        <CustomInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({ ...errors, email: "" });
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="✉️"
          error={errors.email}
        />

        <CustomInput
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors({ ...errors, password: "" });
          }}
          secureTextEntry
          leftIcon="🔒"
          error={errors.password}
          helperText="At least 6 characters"
        />

        <CustomInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors({ ...errors, confirmPassword: "" });
          }}
          secureTextEntry
          leftIcon="✔️"
          error={errors.confirmPassword}
        />

        {role === 'dermatologist' && (
          <CustomInput
            label="Medical License Number"
            placeholder="Enter your PMC license number"
            value={license}
            onChangeText={(text) => {
              setLicense(text);
              setErrors({ ...errors, license: "" });
            }}
            autoCapitalize="characters"
            leftIcon="🏥"
            error={errors.license}
            helperText="e.g., PMC-12345-KPK"
          />
        )}

        <CustomButton
          title="Create Account"
          onPress={handleSignup}
          loading={loading}
          fullWidth
          size="large"
          style={styles.signupButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Sign In</Text>
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
  roleSelector: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: colors.primary,
  },
  signupButton: {
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
