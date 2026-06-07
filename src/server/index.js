const { createClerkClient } = require("@clerk/backend");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const { analyzeProduct } = require("./product-analysis");
const { asyncHandler } = require("./async-handler");
const { clerkAuth, signToken, verifyClerkSession } = require("./auth");
const { createScanHistory, getUserHistory, markScanAnalysisError, updateScanAnalysis } = require("./history-service");
const {
  acceptCurrentLegal,
  createUser,
  deleteUserById,
  getUserByEmail,
  hasAcceptedCurrentLegal,
  upsertClerkUser
} = require("./user-service");
const { getCatalogs } = require("./catalog-service");
const { fetchProduct } = require("./product-service");
const { getProfile, saveProfile } = require("./profile-service");

dotenv.config();

const app = express();
const port = process.env.API_PORT || 4000;
const DELETE_ACCOUNT_CONFIRMATION = "eliminar la cuenta";

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

const webDistPath = path.join(__dirname, "../../dist");
const webIndexPath = path.join(webDistPath, "index.html");

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "BioTag API" });
});

app.use(express.static(webDistPath));

app.get("/", (_req, res) => {
  res.sendFile(webIndexPath, (error) => {
    if (!error) return;

    res.status(200).send(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>BioTag API</title>
          <style>
            body {
              background: #f7fbf8;
              color: #123c2f;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              margin: 0;
              padding: 40px 20px;
            }
            main {
              background: #fff;
              border: 1px solid #e1ece7;
              border-radius: 18px;
              margin: 0 auto;
              max-width: 640px;
              padding: 28px;
            }
            code {
              background: #eef6f1;
              border-radius: 8px;
              display: block;
              margin-top: 10px;
              padding: 12px;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>BioTag API esta funcionando</h1>
            <p>Para ver la app mobile en este navegador, primero genera la version web:</p>
            <code>npx expo export --platform web</code>
            <p>Despues deja corriendo la API y abre de nuevo <strong>http://localhost:4000</strong>.</p>
          </main>
        </body>
      </html>
    `);
  });
});

app.post("/auth/register", asyncHandler(async (req, res) => {
  const { email, password, nombre, apellido } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son requeridos" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ email, passwordHash, nombre, apellido });
  res.status(201).json({ user, token: signToken(user) });
}));

app.post("/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }

  delete user.password_hash;
  res.json({ user, token: signToken(user) });
}));

app.post("/auth/sync", verifyClerkSession, asyncHandler(async (req, res) => {
  const { email, nombre, apellido } = req.body;
  if (!email) return res.status(400).json({ error: "Email requerido" });

  const user = await upsertClerkUser({
    clerkUserId: req.clerkClaims.sub,
    email,
    nombre,
    apellido
  });

  res.json({ user });
}));

function requireAcceptedLegal(req, res, next) {
  if (hasAcceptedCurrentLegal(req.user)) return next();
  return res.status(428).json({
    code: "LEGAL_ACCEPTANCE_REQUIRED",
    error: "Tenes que aceptar los terminos y la politica de privacidad para continuar"
  });
}

app.post("/legal/accept", clerkAuth, asyncHandler(async (req, res) => {
  const user = await acceptCurrentLegal({ userId: req.user.id_usuario });
  res.json({ user });
}));

async function deleteClerkAccount(clerkUserId) {
  if (!clerkUserId) return false;
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("Falta configurar CLERK_SECRET_KEY para eliminar la cuenta de autenticacion");
  }

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  await clerk.users.deleteUser(clerkUserId);
  return true;
}

app.delete("/account", clerkAuth, asyncHandler(async (req, res) => {
  const confirmation = `${req.body?.confirmation || ""}`.trim();
  if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
    return res.status(400).json({
      code: "INVALID_ACCOUNT_DELETE_CONFIRMATION",
      error: `Escribi "${DELETE_ACCOUNT_CONFIRMATION}" para eliminar tu cuenta`
    });
  }

  const clerkUserId = req.user.clerk_user_id;
  let clerkDeleted = false;
  try {
    clerkDeleted = await deleteClerkAccount(clerkUserId);
  } catch (error) {
    if (error?.status !== 404) throw error;
  }

  await deleteUserById(req.user.id_usuario);
  res.json({ ok: true, clerk_deleted: clerkDeleted });
}));

app.get("/catalogos", clerkAuth, requireAcceptedLegal, asyncHandler(async (_req, res) => {
  res.json(await getCatalogs());
}));

app.get("/perfil", clerkAuth, requireAcceptedLegal, asyncHandler(async (req, res) => {
  res.json({ perfil: await getProfile(req.user.id_usuario) });
}));

app.put("/perfil", clerkAuth, requireAcceptedLegal, asyncHandler(async (req, res) => {
  const {
    edad,
    peso,
    altura,
    enfermedades = [],
    dietas = [],
    alergias = []
  } = req.body;

  const perfil = await saveProfile({
    userId: req.user.id_usuario,
    edad,
    peso,
    altura,
    enfermedades,
    dietas,
    alergias
  });

  res.json({ perfil });
}));

async function runScanAnalysis({ userId, historyId, product, profile }) {
  try {
    const analysis = await analyzeProduct(product, profile);
    await updateScanAnalysis({ userId, historyId, analysis });
  } catch (error) {
    console.error("No se pudo generar el analisis IA", error);
    try {
      await markScanAnalysisError({ userId, historyId, error });
    } catch (updateError) {
      console.error("No se pudo guardar el error del analisis IA", updateError);
    }
  }
}

app.post("/scan", clerkAuth, requireAcceptedLegal, asyncHandler(async (req, res) => {
  const { codigo_barras } = req.body;
  if (!codigo_barras) return res.status(400).json({ error: "Falta codigo_barras" });

  const profile = await getProfile(req.user.id_usuario);
  const product = await fetchProduct(codigo_barras);
  const item = await createScanHistory({
    userId: req.user.id_usuario,
    barcode: codigo_barras,
    product
  });

  res.status(202).json({ item });
  void runScanAnalysis({
    userId: req.user.id_usuario,
    historyId: item.id_historial,
    product,
    profile
  });
}));

app.get("/historial", clerkAuth, requireAcceptedLegal, asyncHandler(async (req, res) => {
  res.json({ items: await getUserHistory(req.user.id_usuario) });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === "PRODUCT_NOT_FOUND" || error.status === 404) {
    return res.status(404).json({
      code: "PRODUCT_NOT_FOUND",
      error: "Producto no encontrado"
    });
  }
  if (error.code === "23505") {
    return res.status(409).json({ error: "Ya existe un registro con esos datos" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`BioTag API listening on http://0.0.0.0:${port}`);
});
