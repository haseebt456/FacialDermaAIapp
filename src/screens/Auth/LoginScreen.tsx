import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Alert } from "react-native";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Please enter both email and password");
      return;
    }

    // Right now we just navigate — no backend yet
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FacialDerma AI</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#222" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#2A6EF1",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
