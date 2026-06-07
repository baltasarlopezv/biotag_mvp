const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const VALID_RESULTS = new Set(["Apto", "Precaucion", "No recomendado"]);

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function compactObject(source) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
  );
}

function getProductName(product) {
  return product.product_name_es || product.product_name || "Producto sin nombre";
}

function getIngredients(product) {
  return product.ingredients_text_es || product.ingredients_text || "";
}

function cleanTag(tag) {
  return `${tag}`.replace(/^[a-z]{2}:/, "").replace(/-/g, " ");
}

function mapNamedItems(items = []) {
  return items.map((item) => item.nombre).filter(Boolean);
}

function buildHealthProfile(profile) {
  if (!profile) {
    return {
      enfermedades: [],
      dietas: [],
      alergias: []
    };
  }

  return compactObject({
    edad: profile.edad,
    peso: profile.peso,
    altura: profile.altura,
    enfermedades: mapNamedItems(profile.enfermedades),
    dietas: mapNamedItems(profile.dietas),
    alergias: mapNamedItems(profile.alergias)
  });
}

function buildProductContext(product) {
  const nutriments = product.nutriments || {};

  return compactObject({
    codigo_barras: product.code,
    nombre: getProductName(product),
    marca: product.brands || "",
    categoria: product.categories?.split(",")?.[0]?.trim() || "",
    categoria_tags: (product.categories_tags || []).map(cleanTag),
    porcion: product.serving_size || "",
    ingredientes: getIngredients(product),
    alergenos_declarados: product.allergens || "",
    alergenos_tags: (product.allergens_tags || []).map(cleanTag),
    trazas_declaradas: product.traces || "",
    trazas_tags: (product.traces_tags || []).map(cleanTag),
    sellos_certificaciones: product.labels || "",
    sellos_tags: (product.labels_tags || []).map(cleanTag),
    niveles_nutricionales: compactObject(product.nutrient_levels || {}),
    tabla_nutricional_100g: compactObject({
      calorias: toNumber(nutriments["energy-kcal_100g"]),
      grasas_g: toNumber(nutriments.fat_100g),
      grasas_saturadas_g: toNumber(nutriments["saturated-fat_100g"]),
      sodio_g: toNumber(nutriments.sodium_100g),
      sal_g: toNumber(nutriments.salt_100g),
      carbohidratos_g: toNumber(nutriments.carbohydrates_100g),
      azucares_g: toNumber(nutriments.sugars_100g),
      fibra_g: toNumber(nutriments.fiber_100g),
      proteinas_g: toNumber(nutriments.proteins_100g)
    }),
    tabla_nutricional_porcion: compactObject({
      calorias: toNumber(nutriments["energy-kcal_serving"]),
      grasas_g: toNumber(nutriments.fat_serving),
      grasas_saturadas_g: toNumber(nutriments["saturated-fat_serving"]),
      sodio_g: toNumber(nutriments.sodium_serving),
      sal_g: toNumber(nutriments.salt_serving),
      carbohidratos_g: toNumber(nutriments.carbohydrates_serving),
      azucares_g: toNumber(nutriments.sugars_serving),
      fibra_g: toNumber(nutriments.fiber_serving),
      proteinas_g: toNumber(nutriments.proteins_serving)
    })
  });
}

function extractOutputText(response) {
  return (response.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini no devolvio JSON valido");
    return JSON.parse(match[0]);
  }
}

function normalizeAnalysis(rawAnalysis) {
  const resultado = VALID_RESULTS.has(rawAnalysis.resultado) ? rawAnalysis.resultado : "Precaucion";
  const recomendacion = `${rawAnalysis.recomendacion || rawAnalysis.explicacion || ""}`.trim();
  const alertas = Array.isArray(rawAnalysis.alertas)
    ? rawAnalysis.alertas.map((item) => `${item}`.trim()).filter(Boolean).slice(0, 4)
    : [];
  const score = Number(rawAnalysis.score);

  return {
    resultado,
    explicacion: recomendacion || "No se pudo generar una recomendacion clara.",
    score_ia: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null,
    recomendacion_ia: recomendacion || null,
    alertas_ia: alertas
  };
}

async function analyzeProduct(product, profile) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar GEMINI_API_KEY para generar recomendaciones con Gemini");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const payload = {
    perfil_salud: buildHealthProfile(profile),
    producto: buildProductContext(product)
  };

  const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "Sos un asistente de salud alimentaria para una app de escaneo de productos. " +
              "Usa solo los datos enviados. No diagnostiques ni des consejo medico. " +
              "Evalua compatibilidad entre perfil de salud, alergias, dietas y datos del producto. " +
              "Devolve solo JSON valido con: resultado ('Apto', 'Precaucion' o 'No recomendado'), " +
              "score (0 a 100), recomendacion (maximo 180 caracteres, breve y accionable), " +
              "alertas (array de hasta 4 strings cortos)."
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify(payload) }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 220,
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "No pudo generar la recomendacion");
  }

  const outputText = extractOutputText(data);
  if (!outputText) throw new Error("No devolvio una recomendacion");

  return normalizeAnalysis(parseJsonResponse(outputText));
}

module.exports = {
  analyzeProduct
};
