import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { request } from "./src/api/client";
import { Shell } from "./src/layout/Shell";
import { AuthScreen } from "./src/screens/AuthScreen";
import { Dashboard } from "./src/screens/Dashboard";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ScanScreen } from "./src/screens/ScanScreen";
import { styles } from "./src/styles/styles";

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [catalogos, setCatalogos] = useState({ enfermedades: [], dietas: [], alergias: [] });
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [booting, setBooting] = useState(false);

  const token = session?.token;
  const user = session?.user;

  async function hydrate(authData) {
    setSession(authData);
    setBooting(true);
    try {
      const [catalogData, profileData, historyData] = await Promise.all([
        request("/catalogos", {}, authData.token),
        request("/perfil", {}, authData.token),
        request("/historial", {}, authData.token)
      ]);
      setCatalogos(catalogData);
      setProfile(profileData.perfil);
      setHistory(historyData.items);
    } catch (error) {
      Alert.alert("Error cargando BioTag", error.message);
    } finally {
      setBooting(false);
    }
  }

  async function saveProfile(payload) {
    try {
      const data = await request(
        "/perfil",
        { method: "PUT", body: JSON.stringify(payload) },
        token
      );
      setProfile(data.perfil);
      Alert.alert("Perfil guardado", "Tus preferencias ya se usan en los analisis.");
    } catch (error) {
      Alert.alert("No se pudo guardar", error.message);
    }
  }

  async function scan(code) {
    try {
      const data = await request(
        "/scan",
        { method: "POST", body: JSON.stringify({ codigo_barras: code }) },
        token
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

  if (!session) return <AuthScreen onAuth={hydrate} />;

  return (
    <Shell
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={() => setSession(null)}
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
