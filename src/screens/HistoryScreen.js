import { ScrollView, Text, View } from "react-native";
import { ScanResult } from "../components/ScanResult";
import { styles } from "../styles/styles";

export function HistoryScreen({ history }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Historial</Text>
      <Text style={styles.screenSubtitle}>Ultimos productos analizados.</Text>
      {history.map((item) => (
        <ScanResult key={item.id_historial} item={item} />
      ))}
      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin registros</Text>
          <Text style={styles.emptyText}>Los escaneos guardados van a aparecer aca.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
