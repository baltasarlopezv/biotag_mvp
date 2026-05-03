import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { resultColors } from "../constants/results";
import { styles } from "../styles/styles";

export function ScanResult({ item, compact }) {
  const colors = resultColors[item.resultado] || resultColors.Apto;
  return (
    <View style={[styles.resultCard, compact && styles.resultCompact]}>
      <View style={[styles.resultIcon, { backgroundColor: colors.bg }]}>
        <Ionicons name={colors.icon} size={22} color={colors.fg} />
      </View>
      <View style={styles.resultBody}>
        <Text style={styles.productName}>{item.nombre_producto || "Producto"}</Text>
        <Text style={styles.brand}>{item.marca || item.codigo_barras}</Text>
        <Text style={[styles.resultLabel, { color: colors.fg }]}>{item.resultado}</Text>
        <Text style={styles.explanation}>{item.explicacion}</Text>
      </View>
    </View>
  );
}
