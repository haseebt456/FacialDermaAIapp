import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { authService } from "../services/authService";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import Loading from "../components/Loading";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing, typography, shadows } from "../styles/theme";

export default function EditProfileScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await authService.getStoredUser();
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert("Required", "Please fill all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Invalid", "Please enter a valid email address");
      return;
    }

    setSaving(true);
    const result = await authService.updateProfile({ username, email });
    setSaving(false);

    if (result.success) {
      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <CustomButton
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="small"
        />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.container}>
        <CustomInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomButton
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
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
