import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { logoUrl } from "../constants/assets";
import { styles } from "../styles/styles";

const tabs = [
  ["home", "Inicio", "home-outline"],
  ["scan", "Scan", "scan-outline"],
  ["profile", "Perfil", "person-outline"],
  ["history", "Historial", "time-outline"]
];

export function Shell({ user, onLogout, activeTab, setActiveTab, children }) {
  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={{ uri: logoUrl }} style={styles.headerLogo} />
          <View>
            <Text style={styles.headerTitle}>BioTag</Text>
            <Text style={styles.headerSub}>{user.nombre || user.email}</Text>
          </View>
        </View>
        <Pressable onPress={onLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={22} color="#173b2f" />
        </Pressable>
      </View>
      <View style={styles.body}>{children}</View>
      <View style={styles.tabs}>
        {tabs.map(([key, label, icon]) => (
          <Pressable key={key} onPress={() => setActiveTab(key)} style={styles.tab}>
            <Ionicons name={icon} size={22} color={activeTab === key ? "#0b6b4f" : "#8a9a94"} />
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
