import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScanResult } from "../components/ScanResult";
import { styles } from "../styles/styles";

export function Dashboard({ history, profile, onScanPress }) {
  const recentItems = history.slice(0, 5);
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.eyebrow}>BioTag Scan</Text>
          <Text style={styles.heroTitle}>Escanea antes de consumir</Text>
          <Text style={styles.heroText}>
            Cruzamos ingredientes, alergias, dietas y condiciones de salud para darte una lectura simple.
          </Text>
        </View>
        <Pressable onPress={onScanPress} style={styles.scanFab}>
          <Ionicons name="barcode-outline" size={30} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>escaneos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile ? "Listo" : "Falta"}</Text>
          <Text style={styles.statLabel}>perfil</Text>
        </View>
      </View>

      {recentItems.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ultimos 5 resultados</Text>
          <View style={styles.recentScanList}>
            {recentItems.map((item, index) => (
              <View
                key={item.id_historial || `${item.codigo_barras || "scan"}-${index}`}
                style={[styles.recentScanItem, index === 0 && styles.recentScanItemFirst]}
              >
                <ScanResult item={item} compact />
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="nutrition-outline" size={34} color="#0b6b4f" />
          <Text style={styles.emptyTitle}>Todavia no hay escaneos</Text>
          <Text style={styles.emptyText}>Carga un codigo de barras para ver el primer analisis.</Text>
        </View>
      )}
    </ScrollView>
  );
}
