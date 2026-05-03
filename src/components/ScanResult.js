import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { resultColors } from "../constants/results";
import { styles } from "../styles/styles";

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Number.isInteger(number) ? `${number}` : `${Number(number.toFixed(2))}`;
}

function formatGram(value) {
  const formatted = formatNumber(value);
  return formatted ? `${formatted} g` : null;
}

function formatSodium(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `${Math.round(number * 1000)} mg`;
}

function cleanTag(tag) {
  return `${tag}`.replace(/^[a-z]{2}:/, "").replace(/-/g, " ");
}

function NutritionRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.nutritionRow}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{value}</Text>
    </View>
  );
}

export function ScanResult({ item, compact }) {
  const colors = resultColors[item.resultado] || resultColors.Apto;
  const allergens = Array.isArray(item.alergenos_tags)
    ? item.alergenos_tags
    : item.alergenos
      ? item.alergenos.split(",")
      : [];
  const aiAlerts = Array.isArray(item.alertas_ia) ? item.alertas_ia : [];
  const hasNutrition = [
    item.calorias_100g,
    item.grasas_100g,
    item.grasas_saturadas_100g,
    item.sodio_100g,
    item.carbohidratos_100g,
    item.azucares_100g,
    item.fibra_100g,
    item.proteinas_100g
  ].some((value) => value !== null && value !== undefined);

  const summary = (
    <View style={[styles.resultSummary, compact && styles.resultCompact]}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.productImage} resizeMode="contain" />
      ) : (
        <View style={[styles.resultIcon, { backgroundColor: colors.bg }]}>
          <Ionicons name={colors.icon} size={22} color={colors.fg} />
        </View>
      )}
      <View style={styles.resultBody}>
        <Text style={styles.productName}>{item.nombre_producto || "Producto"}</Text>
        <Text style={styles.brand}>{item.marca || item.codigo_barras}</Text>
        <Text style={[styles.resultLabel, { color: colors.fg }]}>{item.resultado}</Text>
        <Text style={styles.explanation}>{item.explicacion}</Text>
      </View>
    </View>
  );

  if (compact) return summary;

  return (
    <View style={styles.historyProductCard}>
      {summary}

      <View style={[styles.recommendationBox, { borderColor: colors.bg }]}>
        <View style={styles.recommendationHeader}>
          <Ionicons name={colors.icon} size={18} color={colors.fg} />
          <Text style={[styles.recommendationTitle, { color: colors.fg }]}>
            {item.score_ia !== null && item.score_ia !== undefined
              ? `Score ${item.score_ia}/100`
              : item.resultado}
          </Text>
        </View>
        <Text style={styles.recommendationText}>
          {item.recomendacion_ia || item.explicacion || "Todavia no hay recomendacion cargada."}
        </Text>
        {aiAlerts.length > 0 ? (
          <View style={styles.alertList}>
            {aiAlerts.map((alert) => (
              <Text key={String(alert)} style={styles.alertText}>- {String(alert)}</Text>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.detailSection}>
        <View style={styles.detailSectionHeader}>
          <View style={styles.detailTitleRow}>
            <Ionicons name="flask-outline" size={18} color="#0b6b4f" />
            <Text style={styles.detailSectionTitle}>Ingredientes</Text>
          </View>
          {item.categoria ? <Text style={styles.categoryPill}>{item.categoria}</Text> : null}
        </View>
        <Text style={styles.detailText}>{item.ingredientes || "Sin ingredientes informados."}</Text>
      </View>

      <View style={styles.detailSection}>
        <View style={styles.detailSectionHeader}>
          <View style={styles.detailTitleRow}>
            <Ionicons name="bar-chart-outline" size={18} color="#0b6b4f" />
            <Text style={styles.detailSectionTitle}>Tabla nutricional</Text>
          </View>
          <Text style={styles.detailMeta}>Valores por 100g</Text>
        </View>
        {hasNutrition ? (
          <View>
            <NutritionRow label="Calorias" value={formatNumber(item.calorias_100g) ? `${formatNumber(item.calorias_100g)} kcal` : null} />
            <NutritionRow label="Grasas totales" value={formatGram(item.grasas_100g)} />
            <NutritionRow label="Grasas saturadas" value={formatGram(item.grasas_saturadas_100g)} />
            <NutritionRow label="Sodio" value={formatSodium(item.sodio_100g)} />
            <NutritionRow label="Carbohidratos" value={formatGram(item.carbohidratos_100g)} />
            <NutritionRow label="Azucares" value={formatGram(item.azucares_100g)} />
            <NutritionRow label="Fibra" value={formatGram(item.fibra_100g)} />
            <NutritionRow label="Proteinas" value={formatGram(item.proteinas_100g)} />
          </View>
        ) : (
          <Text style={styles.detailText}>Sin tabla nutricional informada.</Text>
        )}
      </View>

      <View style={styles.detailSection}>
        <View style={styles.detailTitleRow}>
          <Ionicons name="warning-outline" size={18} color="#d97706" />
          <Text style={styles.detailSectionTitle}>Alergenos</Text>
        </View>
        {allergens.length > 0 ? (
          <View style={styles.allergenWrap}>
            {allergens.map((allergen) => (
              <Text key={allergen} style={styles.allergenPill}>{cleanTag(allergen)}</Text>
            ))}
          </View>
        ) : (
          <Text style={styles.detailText}>Sin alergenos informados.</Text>
        )}
      </View>
    </View>
  );
}
