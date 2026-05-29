import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { request } from "./src/api/client";
import { Shell } from "./src/layout/Shell";
import { AuthScreen } from "./src/screens/AuthScreen";
import { Dashboard } from "./src/screens/Dashboard";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ScanScreen } from "./src/screens/ScanScreen";
import { styles } from "./src/styles/styles";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function getPrimaryEmail(user) {
  return user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
}

function isAnalysisPending(item) {
  return item?.ia_estado === "pendiente";
}

function MissingClerkConfigScreen() {
  return (
    <LinearGradient colors={["#e9f8ef", "#f9fbf8"]} style={styles.authBg}>
      <View style={styles.authWrap}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>BioTag</Text>
          <Text style={styles.configErrorTitle}>Falta configurar Clerk</Text>
          <Text style={styles.configErrorText}>
            Agrega EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY en .env para habilitar la autenticacion.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function AppContent() {
  const { getToken, isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const [localUser, setLocalUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [catalogos, setCatalogos] = useState({ enfermedades: [], dietas: [], alergias: [] });
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [booting, setBooting] = useState(true);
  const clerkUserId = clerkUser?.id;
  const clerkEmail = getPrimaryEmail(clerkUser);
  const clerkFirstName = clerkUser?.firstName || "";
  const clerkLastName = clerkUser?.lastName || "";

  const authRequest = useCallback(
    async (path, options = {}) => {
      const token = await getToken();
      return request(path, options, token);
    },
    [getToken]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLocalUser(null);
      setProfile(null);
      setHistory([]);
      setBooting(false);
      return;
    }

    if (!clerkUserId) return;

    let cancelled = false;

    async function hydrate() {
      setBooting(true);
      try {
        const token = await getToken();
        const syncData = await request(
          "/auth/sync",
          {
            method: "POST",
            body: JSON.stringify({
              email: clerkEmail,
              nombre: clerkFirstName,
              apellido: clerkLastName
            })
          },
          token
        );
        if (cancelled) return;
        setLocalUser(syncData.user);

        const [catalogData, profileData, historyData] = await Promise.all([
          request("/catalogos", {}, token),
          request("/perfil", {}, token),
          request("/historial", {}, token)
        ]);
        if (cancelled) return;
        setCatalogos(catalogData);
        setProfile(profileData.perfil);
        setHistory(historyData.items);
      } catch (error) {
        if (!cancelled) Alert.alert("Error cargando BioTag", error.message);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [clerkEmail, clerkFirstName, clerkLastName, clerkUserId, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn || booting || !history.some(isAnalysisPending)) return undefined;

    let cancelled = false;
    const intervalId = setInterval(async () => {
      try {
        const data = await authRequest("/historial");
        if (!cancelled) setHistory(data.items);
      } catch (error) {
        console.log("[ScanAnalysis] No se pudo refrescar el historial", error);
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [authRequest, booting, history, isSignedIn]);

  async function saveProfile(payload) {
    try {
      const data = await authRequest(
        "/perfil",
        { method: "PUT", body: JSON.stringify(payload) }
      );
      setProfile(data.perfil);
      Alert.alert("Perfil guardado", "Tus preferencias ya se usan en los analisis.");
    } catch (error) {
      Alert.alert("No se pudo guardar", error.message);
      throw error;
    }
  }

  async function scan(code) {
    try {
      const data = await authRequest(
        "/scan",
        { method: "POST", body: JSON.stringify({ codigo_barras: code }) }
      );
      setHistory((items) => [data.item, ...items]);
      setActiveTab("history");
    } catch (error) {
      Alert.alert("No se pudo analizar", error.message);
    }
  }

  const screen = useMemo(() => {
    if (activeTab === "scan") return <ScanScreen onScan={scan} />;
    if (activeTab === "profile") {
      return <ProfileScreen catalogos={catalogos} initialProfile={profile} onSave={saveProfile} />;
    }
    if (activeTab === "history") return <HistoryScreen history={history} />;
    return <Dashboard history={history} profile={profile} onScanPress={() => setActiveTab("scan")} />;
  }, [activeTab, catalogos, profile, history]);

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#0b6b4f" />
        <Text style={styles.loadingText}>Cargando autenticacion...</Text>
      </View>
    );
  }

  if (!isSignedIn) return <AuthScreen />;

  return (
    <Shell
      user={localUser || { email: clerkEmail, nombre: clerkFirstName }}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={() => signOut()}
    >
      {booting ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#0b6b4f" />
          <Text style={styles.loadingText}>Cargando BioTag...</Text>
        </View>
      ) : (
        screen
      )}
    </Shell>
  );
}

export default function App() {
  if (!clerkPublishableKey) return <MissingClerkConfigScreen />;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <AppContent />
    </ClerkProvider>
  );
}
