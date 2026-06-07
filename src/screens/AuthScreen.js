import { useSignIn, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useState } from "react";
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

const AUTH_GRADIENT_COLORS = ["#e9f8ef", "#f9fbf8"];
const PASSWORD_RULES = [
  { label: "Minimo 8 caracteres", test: (value) => value.length >= 8 },
  { label: "Una letra mayuscula", test: (value) => /[A-Z]/.test(value) },
  { label: "Una letra minuscula", test: (value) => /[a-z]/.test(value) },
  { label: "Un numero", test: (value) => /\d/.test(value) },
  { label: "Un simbolo", test: (value) => /[^A-Za-z0-9]/.test(value) }
];

function getClerkError(error, fallback) {
  return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || error?.message || fallback;
}

const AuthHeader = memo(function AuthHeader() {
  return (
    <>
      <Image source={{ uri: logoUrl }} style={styles.logo} />
      <Text style={styles.authTitle}>BioTag</Text>
      <Text style={styles.authSubtitle}>
        Tu asistente nutricional personalizado para escanear alimentos y recibir alertas segun tu perfil.
      </Text>
    </>
  );
});

const ClerkCaptchaSlot = memo(function ClerkCaptchaSlot() {
  return <View nativeID="clerk-captcha" />;
});

const PasswordCriteria = memo(function PasswordCriteria({ checks }) {
  return (
    <View style={styles.passwordCriteria}>
      {checks.map((check) => (
        <View key={check.label} style={styles.passwordCriteriaItem}>
          <Ionicons
            name={check.passed ? "checkbox-outline" : "square-outline"}
            size={18}
            color={check.passed ? "#0b6b4f" : "#9db8ae"}
          />
          <Text
            style={[
              styles.passwordCriteriaText,
              check.passed && styles.passwordCriteriaTextPassed
            ]}
          >
            {check.label}
          </Text>
        </View>
      ))}
    </View>
  );
});

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
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(password)
  }));
  const passwordMeetsRules = passwordChecks.every((check) => check.passed);

  async function finalize(flow) {
    if (flow.status !== "complete") return false;
    await flow.finalize({ navigate: () => null });
    return true;
  }

  async function submit() {
    try {
      setLoading(true);
      if (mode === "register") {
        if (!passwordMeetsRules) {
          Alert.alert(
            "Contrasena incompleta",
            "Completa todos los criterios de la contrasena antes de crear la cuenta."
          );
          return;
        }

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
    setShowPassword(false);
  }

  return (
    <LinearGradient colors={AUTH_GRADIENT_COLORS} style={styles.authBg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.authWrap}
      >
        <AuthHeader />

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
                autoCorrect={false}
                keyboardType="number-pad"
                placeholder="Codigo de verificacion"
                value={code}
                onChangeText={setCode}
                maxLength={40}
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
                    autoCorrect={false}
                    placeholder="Nombre"
                    value={nombre}
                    onChangeText={setNombre}
                    maxLength={40}
                    style={[styles.input, styles.rowInput]}
                  />
                  <TextInput
                    autoCorrect={false}
                    placeholder="Apellido"
                    value={apellido}
                    onChangeText={setApellido}
                    maxLength={40}
                    style={[styles.input, styles.rowInput]}
                  />
                </View>
              ) : null}

              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="Email"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                maxLength={120}
                style={styles.input}
              />
              <View style={styles.passwordInputWrap}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                  placeholder="Contrasena"
                  secureTextEntry={!showPassword}
                  textContentType={mode === "register" ? "newPassword" : "password"}
                  value={password}
                  onChangeText={setPassword}
                  maxLength={128}
                  style={[styles.input, styles.passwordInput]}
                />
                <Pressable
                  accessibilityLabel={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  accessibilityRole="button"
                  onPress={() => setShowPassword((current) => !current)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#60736c"
                  />
                </Pressable>
              </View>
              {mode === "register" ? <PasswordCriteria checks={passwordChecks} /> : null}
              <PrimaryButton
                icon="arrow-forward"
                label={mode === "register" ? "Crear perfil" : "Entrar"}
                disabled={mode === "register" && !passwordMeetsRules}
                loading={loading}
                onPress={submit}
              />
              {mode === "register" ? <ClerkCaptchaSlot /> : null}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
