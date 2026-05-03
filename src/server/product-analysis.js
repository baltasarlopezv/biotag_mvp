function analyzeProduct(product, profile) {
  const ingredients = `${product.ingredients || ""}`.toLowerCase();
  const nutriments = product.nutriments || {};
  const warnings = [];
  const positives = [];

  const hasDiabetes = profile?.enfermedades?.some((item) => item.nombre === "Diabetes");
  const hasHipertension = profile?.enfermedades?.some((item) => item.nombre === "Hipertension");
  const isSinTacc = profile?.dietas?.some((item) => item.nombre === "Sin TACC");

  if (hasDiabetes && Number(nutriments.sugars_100g || 0) > 12) {
    warnings.push("alto contenido de azucares para tu perfil");
  }

  if (hasHipertension && Number(nutriments.salt_100g || 0) > 1) {
    warnings.push("alto contenido de sal para hipertension");
  }

  if (isSinTacc && /(trigo|avena|cebada|centeno|gluten)/i.test(ingredients)) {
    warnings.push("puede contener gluten");
  }

  for (const allergy of profile?.alergias || []) {
    if (ingredients.includes(allergy.nombre.toLowerCase())) {
      warnings.push(`contiene ${allergy.nombre}`);
    }
  }

  if (Number(nutriments.sugars_100g || 0) <= 5) positives.push("bajo en azucares");
  if (Number(nutriments.salt_100g || 0) <= 0.3) positives.push("bajo en sal");

  if (warnings.length > 0) {
    return {
      resultado: "No recomendado",
      explicacion: `Detectamos ${warnings.join(", ")}. Revisalo antes de consumirlo.`
    };
  }

  return {
    resultado: "Apto",
    explicacion: positives.length
      ? `Producto compatible con tu perfil: ${positives.join(", ")}.`
      : "No encontramos alertas relevantes para tu perfil."
  };
}

module.exports = {
  analyzeProduct
};
