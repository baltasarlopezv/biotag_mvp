import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { request } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { logoUrl } from "../constants/assets";
import { styles } from "../styles/styles";

export function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("demo@biotag.app");
  const [password, setPassword] = useState("biotag123");
  const [nombre, setNombre] = useState("Demo");
  const [apellido, setApellido] = useState("BioTag");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      const body =
        mode === "register"
          ? { email, password, nombre, apellido }
          : { email, password };
      const data = await request(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      onAuth(data);
    } catch (error) {
      Alert.alert("No pudimos iniciar", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#e9f8ef", "#f9fbf8"]} style={styles.authBg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.authWrap}
      >
        <Image source={{ uri: logoUrl }} style={styles.logo} />
        <Text style={styles.authTitle}>BioTag</Text>
        <Text style={styles.authSubtitle}>
          Tu asistente nutricional personalizado para escanear alimentos y recibir alertas segun tu perfil.
        </Text>

        <View style={styles.authCard}>
          <View style={styles.segment}>
            <Pressable
              onPress={() => setMode("login")}
              style={[styles.segmentItem, mode === "login" && styles.segmentActive]}
            >
              <Text style={mode === "login" ? styles.segmentTextActive : styles.segmentText}>
                Ingresar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("register")}
              style={[styles.segmentItem, mode === "register" && styles.segmentActive]}
            >
              <Text style={mode === "register" ? styles.segmentTextActive : styles.segmentText}>
                Crear cuenta
              </Text>
            </Pressable>
          </View>

          {mode === "register" ? (
            <View style={styles.row}>
              <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={[styles.input, styles.rowInput]}
              />
              <TextInput
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
                style={[styles.input, styles.rowInput]}
              />
            </View>
          ) : null}

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <PrimaryButton
            icon="arrow-forward"
            label={mode === "register" ? "Crear perfil" : "Entrar"}
            loading={loading}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
