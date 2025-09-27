import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/auth/signup")}>
          <Text style={styles.switchText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB", padding: 20 },
  title: { fontSize: 32, fontWeight: "700", color: "#0A2647", marginBottom: 40 },
  card: { width: "100%", backgroundColor: "#FFFFFF", padding: 20, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 16, color: "#0A2647" },
  button: { backgroundColor: "#0A2647", paddingVertical: 14, borderRadius: 20, alignItems: "center", marginBottom: 12 },
  buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  switchText: { textAlign: "center", color: "#1E90FF", fontWeight: "500", marginTop: 6 },
  error: { color: "#FF4D4D", marginBottom: 12, textAlign: "center" },
});
