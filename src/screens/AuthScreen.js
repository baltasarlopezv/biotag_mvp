import { useSignIn, useSignUp } from "@clerk/expo";
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
import { PrimaryButton } from "../components/PrimaryButton";
import { logoUrl } from "../constants/assets";
import { styles } from "../styles/styles";

function getClerkError(error, fallback) {
  return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || error?.message || fallback;
}

export function AuthScreen() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [code, setCode] = useState("");
  const [needsEmailCode, setNeedsEmailCode] = useState(false);
  const [loading, setLoading] = useState(false);

  async function finalize(flow) {
    if (flow.status !== "complete") return false;
    await flow.finalize({ navigate: () => null });
    return true;
  }

  async function submit() {
    try {
      setLoading(true);
      if (mode === "register") {
        const { error } = await signUp.password({
          emailAddress: email,
          password,
          firstName: nombre,
          lastName: apellido
        });
        if (error) throw error;

        await signUp.verifications.sendEmailCode();
        setNeedsEmailCode(true);
        return;
      }

      const { error } = await signIn.password({ emailAddress: email, password });
      if (error) throw error;

      const completed = await finalize(signIn);
      if (!completed && signIn.status === "needs_client_trust") {
        await signIn.mfa.sendEmailCode();
        setNeedsEmailCode(true);
        return;
      }
      if (!completed) throw new Error("No se pudo completar el inicio de sesion");
    } catch (error) {
      Alert.alert("No pudimos iniciar", getClerkError(error, "Revisa tus datos e intenta de nuevo."));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    try {
      setLoading(true);
      if (mode === "register") {
        await signUp.verifications.verifyEmailCode({ code });
        if (!(await finalize(signUp))) throw new Error("Codigo invalido o incompleto");
        return;
      }

      await signIn.mfa.verifyEmailCode({ code });
      if (!(await finalize(signIn))) throw new Error("Codigo invalido o incompleto");
    } catch (error) {
      Alert.alert("No pudimos verificar", getClerkError(error, "Revisa el codigo e intenta de nuevo."));
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setCode("");
    setNeedsEmailCode(false);
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
              onPress={() => changeMode("login")}
              style={[styles.segmentItem, mode === "login" && styles.segmentActive]}
            >
              <Text style={mode === "login" ? styles.segmentTextActive : styles.segmentText}>
                Ingresar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => changeMode("register")}
              style={[styles.segmentItem, mode === "register" && styles.segmentActive]}
            >
              <Text style={mode === "register" ? styles.segmentTextActive : styles.segmentText}>
                Crear cuenta
              </Text>
            </Pressable>
          </View>

          {needsEmailCode ? (
            <>
              <Text style={styles.authHint}>Te enviamos un codigo a {email}.</Text>
              <TextInput
                keyboardType="number-pad"
                placeholder="Codigo de verificacion"
                value={code}
                onChangeText={setCode}
                maxLength={20}
                style={styles.input}
              />
              <PrimaryButton
                icon="checkmark"
                label="Verificar email"
                loading={loading}
                onPress={verifyCode}
              />
              <Pressable onPress={() => setNeedsEmailCode(false)} style={styles.authLink}>
                <Text style={styles.authLinkText}>Volver</Text>
              </Pressable>
            </>
          ) : (
            <>
              {mode === "register" ? (
            <View style={styles.row}>
              <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                maxLength={20}
                style={[styles.input, styles.rowInput]}
              />
              <TextInput
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
                maxLength={20}
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
                maxLength={20}
                style={styles.input}
              />
              <TextInput
                placeholder="Contrasena"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                maxLength={20}
                style={styles.input}
              />
              <PrimaryButton
                icon="arrow-forward"
                label={mode === "register" ? "Crear perfil" : "Entrar"}
                loading={loading}
                onPress={submit}
              />
              {mode === "register" ? <View nativeID="clerk-captcha" /> : null}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
