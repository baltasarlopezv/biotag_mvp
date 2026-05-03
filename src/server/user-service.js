const { query } = require("./db");

async function createUser({ email, passwordHash, nombre, apellido }) {
  const result = await query(
    `insert into usuario (email, nombre, apellido, password_hash)
     values ($1, $2, $3, $4)
     returning id_usuario, email, nombre, apellido, created_at`,
    [email.toLowerCase(), nombre || "", apellido || "", passwordHash]
  );

  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await query("select * from usuario where email = $1", [
    `${email || ""}`.toLowerCase()
  ]);

  return result.rows[0];
}

module.exports = {
  createUser,
  getUserByEmail
};
