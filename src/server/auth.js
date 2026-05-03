const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "dev-secret";

function signToken(user) {
  return jwt.sign(
    { id_usuario: user.id_usuario, email: user.email },
    jwtSecret,
    { expiresIn: "30d" }
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Sesion invalida" });
  }
}

module.exports = {
  auth,
  signToken
};
