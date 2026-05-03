const bcrypt = require("bcryptjs");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const { analyzeProduct } = require("./product-analysis");
const { asyncHandler } = require("./async-handler");
const { auth, signToken } = require("./auth");
const { createScanHistory, getUserHistory } = require("./history-service");
const { createUser, getUserByEmail } = require("./user-service");
const { getCatalogs } = require("./catalog-service");
const { fetchProduct } = require("./product-service");
const { getProfile, saveProfile } = require("./profile-service");

dotenv.config();

const app = express();
const port = process.env.API_PORT || 4000;

app.use(cors());
app.use(express.json());

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

app.get("/catalogos", auth, asyncHandler(async (_req, res) => {
  res.json(await getCatalogs());
}));

app.get("/perfil", auth, asyncHandler(async (req, res) => {
  res.json({ perfil: await getProfile(req.user.id_usuario) });
}));

app.put("/perfil", auth, asyncHandler(async (req, res) => {
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

app.post("/scan", auth, asyncHandler(async (req, res) => {
  const { codigo_barras } = req.body;
  if (!codigo_barras) return res.status(400).json({ error: "Falta codigo_barras" });

  const profile = await getProfile(req.user.id_usuario);
  const product = await fetchProduct(codigo_barras);
  const analysis = analyzeProduct(
    {
      ingredients: product.ingredients_text,
      nutriments: product.nutriments
    },
    profile
  );

  const item = await createScanHistory({
    userId: req.user.id_usuario,
    barcode: codigo_barras,
    product,
    analysis
  });

  res.json({ item });
}));

app.get("/historial", auth, asyncHandler(async (req, res) => {
  res.json({ items: await getUserHistory(req.user.id_usuario) });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === "23505") {
    return res.status(409).json({ error: "Ya existe un registro con esos datos" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`BioTag API listening on http://localhost:${port}`);
});
