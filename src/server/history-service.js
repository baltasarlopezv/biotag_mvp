const { query } = require("./db");

const NUTRIMENT_KEYS = [
  "energy-kcal_100g",
  "energy-kj_100g",
  "carbohydrates_100g",
  "sugars_100g",
  "added-sugars_100g",
  "fat_100g",
  "saturated-fat_100g",
  "proteins_100g",
  "fiber_100g",
  "salt_100g",
  "sodium_100g",
  "energy-kcal_serving",
  "energy-kj_serving",
  "carbohydrates_serving",
  "sugars_serving",
  "added-sugars_serving",
  "fat_serving",
  "saturated-fat_serving",
  "proteins_serving",
  "fiber_serving",
  "salt_serving",
  "sodium_serving"
];

function isPresent(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function compactObject(source) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => isPresent(value))
  );
}

function pickObject(source = {}, keys) {
  return compactObject(
    Object.fromEntries(keys.map((key) => [key, source[key]]))
  );
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getProductImage(product) {
  return (
    product.image_url ||
    product.image_front_url ||
    product.selected_images?.front?.display?.es ||
    product.selected_images?.front?.display?.en ||
    product.selected_images?.front?.small?.es ||
    product.selected_images?.front?.small?.en ||
    null
  );
}

function getProductName(product) {
  return product.product_name_es || product.product_name || "Producto sin nombre";
}

function getIngredients(product) {
  return product.ingredients_text_es || product.ingredients_text || "";
}

function getCategory(product) {
  const firstTag = product.categories_tags?.[0];
  if (firstTag) return firstTag.replace(/^[a-z]{2}:/, "").replace(/-/g, " ");
  return product.categories?.split(",")?.[0]?.trim() || "";
}

function getNutrition(product) {
  const nutriments = product.nutriments || {};
  return {
    calorias_100g: toNumber(nutriments["energy-kcal_100g"]),
    grasas_100g: toNumber(nutriments.fat_100g),
    grasas_saturadas_100g: toNumber(nutriments["saturated-fat_100g"]),
    sodio_100g: toNumber(nutriments.sodium_100g),
    sal_100g: toNumber(nutriments.salt_100g),
    carbohidratos_100g: toNumber(nutriments.carbohydrates_100g),
    azucares_100g: toNumber(nutriments.sugars_100g),
    fibra_100g: toNumber(nutriments.fiber_100g),
    proteinas_100g: toNumber(nutriments.proteins_100g),
    porcion: product.serving_size || "",
    calorias_porcion: toNumber(nutriments["energy-kcal_serving"]),
    grasas_porcion: toNumber(nutriments.fat_serving),
    grasas_saturadas_porcion: toNumber(nutriments["saturated-fat_serving"]),
    sodio_porcion: toNumber(nutriments.sodium_serving),
    sal_porcion: toNumber(nutriments.salt_serving),
    carbohidratos_porcion: toNumber(nutriments.carbohydrates_serving),
    azucares_porcion: toNumber(nutriments.sugars_serving),
    fibra_porcion: toNumber(nutriments.fiber_serving),
    proteinas_porcion: toNumber(nutriments.proteins_serving)
  };
}

function createProductSnapshot(product) {
  return compactObject({
    code: product.code,
    product_name_es: product.product_name_es,
    product_name: product.product_name,
    brands: product.brands,
    product_type: product.product_type,
    countries: product.countries,
    origins: product.origins,
    quantity: product.quantity,
    product_quantity: product.product_quantity,
    product_quantity_unit: product.product_quantity_unit,
    serving_size: product.serving_size,
    serving_quantity: product.serving_quantity,
    serving_quantity_unit: product.serving_quantity_unit,
    categories: product.categories,
    categories_tags: product.categories_tags,
    ingredients_text_es: product.ingredients_text_es,
    ingredients_text: product.ingredients_text,
    allergens: product.allergens,
    allergens_tags: product.allergens_tags,
    nutriments: pickObject(product.nutriments, NUTRIMENT_KEYS),
    nutrient_levels: product.nutrient_levels,
    nutriscore_grade: product.nutriscore_grade,
    nutriscore_score: product.nutriscore_score,
    nutriscore_version: product.nutriscore_version,
    packaging: product.packaging,
    packaging_text_es: product.packaging_text_es,
    packaging_tags: product.packaging_tags,
    image_front_url: product.image_front_url || getProductImage(product),
    image_nutrition_url: product.image_nutrition_url,
    image_ingredients_url: product.image_ingredients_url,
    completeness: product.completeness,
    data_quality_warnings_tags: product.data_quality_warnings_tags
  });
}

function toJsonb(value) {
  return JSON.stringify(value ?? null);
}

async function createScanHistory({ userId, barcode, product, analysis }) {
  const safeAnalysis = analysis || {};
  const nutrition = getNutrition(product);
  const history = await query(
    `insert into historial_escaneo
     (
       id_usuario, codigo_barras, nombre_producto, marca, imagen, categoria,
       ingredientes, alergenos, alergenos_tags,
       calorias_100g, grasas_100g, grasas_saturadas_100g, sodio_100g, sal_100g,
       carbohidratos_100g, azucares_100g, fibra_100g, proteinas_100g,
       porcion, calorias_porcion, grasas_porcion, grasas_saturadas_porcion,
       sodio_porcion, sal_porcion, carbohidratos_porcion, azucares_porcion,
       fibra_porcion, proteinas_porcion, score_ia, recomendacion_ia, alertas_ia, ia_estado, ia_error,
       resultado, explicacion, datos_producto_snapshot
     )
     values (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9,
       $10, $11, $12, $13, $14,
       $15, $16, $17, $18,
       $19, $20, $21, $22,
       $23, $24, $25, $26,
       $27, $28, $29, $30, $31, $32, $33,
       $34, $35, $36
     )
     returning *`,
    [
      userId,
      barcode,
      getProductName(product),
      product.brands || "",
      getProductImage(product),
      getCategory(product),
      getIngredients(product),
      product.allergens || "",
      toJsonb(product.allergens_tags || []),
      nutrition.calorias_100g,
      nutrition.grasas_100g,
      nutrition.grasas_saturadas_100g,
      nutrition.sodio_100g,
      nutrition.sal_100g,
      nutrition.carbohidratos_100g,
      nutrition.azucares_100g,
      nutrition.fibra_100g,
      nutrition.proteinas_100g,
      nutrition.porcion,
      nutrition.calorias_porcion,
      nutrition.grasas_porcion,
      nutrition.grasas_saturadas_porcion,
      nutrition.sodio_porcion,
      nutrition.sal_porcion,
      nutrition.carbohidratos_porcion,
      nutrition.azucares_porcion,
      nutrition.fibra_porcion,
      nutrition.proteinas_porcion,
      safeAnalysis.score_ia ?? null,
      safeAnalysis.recomendacion_ia ?? null,
      toJsonb(safeAnalysis.alertas_ia || []),
      safeAnalysis.ia_estado || "pendiente",
      safeAnalysis.ia_error || null,
      safeAnalysis.resultado ?? null,
      safeAnalysis.explicacion ?? null,
      toJsonb(createProductSnapshot(product))
    ]
  );

  return history.rows[0];
}

async function updateScanAnalysis({ userId, historyId, analysis }) {
  const result = await query(
    `update historial_escaneo
     set score_ia = $3,
         recomendacion_ia = $4,
         alertas_ia = $5,
         resultado = $6,
         explicacion = $7,
         ia_estado = 'listo',
         ia_error = null
     where id_usuario = $1 and id_historial = $2
     returning *`,
    [
      userId,
      historyId,
      analysis.score_ia,
      analysis.recomendacion_ia,
      toJsonb(analysis.alertas_ia || []),
      analysis.resultado,
      analysis.explicacion
    ]
  );

  return result.rows[0] || null;
}

async function markScanAnalysisError({ userId, historyId, error }) {
  const result = await query(
    `update historial_escaneo
     set ia_estado = 'error',
         ia_error = $3
     where id_usuario = $1 and id_historial = $2
     returning *`,
    [userId, historyId, `${error?.message || error || "No se pudo generar la recomendacion"}`]
  );

  return result.rows[0] || null;
}

async function getUserHistory(userId) {
  const result = await query(
    "select * from historial_escaneo where id_usuario = $1 order by fecha desc limit 50",
    [userId]
  );

  return result.rows;
}

module.exports = {
  createScanHistory,
  updateScanAnalysis,
  markScanAnalysisError,
  getUserHistory
};
