const jwt = require("jsonwebtoken");
const { verifyToken } = require("@clerk/backend");
const { getUserByClerkId } = require("./user-service");

const jwtSecret = process.env.JWT_SECRET || "dev-secret";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function getAuthorizedParties() {
  return (process.env.CLERK_AUTHORIZED_PARTIES || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function verifyClerkSession(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const options = {
      secretKey: process.env.CLERK_SECRET_KEY,
      jwtKey: process.env.CLERK_JWT_KEY
    };
    const authorizedParties = getAuthorizedParties();
    if (authorizedParties.length > 0) options.authorizedParties = authorizedParties;

    req.clerkClaims = await verifyToken(token, options);
    next();
  } catch (error) {
    console.error("Clerk token verification failed:", error.message);
    res.status(401).json({ error: "Sesion invalida" });
  }
}

function signToken(user) {
  return jwt.sign(
    { id_usuario: user.id_usuario, email: user.email },
    jwtSecret,
    { expiresIn: "30d" }
  );
}

function auth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Sesion invalida" });
  }
}

async function clerkAuth(req, res, next) {
  await verifyClerkSession(req, res, async () => {
    try {
      const user = await getUserByClerkId(req.clerkClaims.sub);
      if (!user) {
        return res.status(409).json({ error: "Usuario no sincronizado" });
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });
}

module.exports = {
  auth,
  clerkAuth,
  verifyClerkSession,
  signToken
};
