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

async function upsertClerkUser({ clerkUserId, email, nombre, apellido }) {
  const normalizedEmail = `${email || ""}`.toLowerCase();
  const existing = await getUserByClerkId(clerkUserId);
  if (existing) {
    const result = await query(
      `update usuario
       set email = $2,
           nombre = coalesce(nullif($3, ''), nombre),
           apellido = coalesce(nullif($4, ''), apellido)
       where clerk_user_id = $1
       returning id_usuario, clerk_user_id, email, nombre, apellido, created_at`,
      [clerkUserId, normalizedEmail, nombre || "", apellido || ""]
    );

    return result.rows[0];
  }

  const result = await query(
    `insert into usuario (clerk_user_id, email, nombre, apellido)
     values ($1, $2, $3, $4)
     on conflict (email) do update
       set clerk_user_id = coalesce(usuario.clerk_user_id, excluded.clerk_user_id),
           nombre = coalesce(nullif(excluded.nombre, ''), usuario.nombre),
           apellido = coalesce(nullif(excluded.apellido, ''), usuario.apellido)
       where usuario.clerk_user_id is null
          or usuario.clerk_user_id = excluded.clerk_user_id
     returning id_usuario, clerk_user_id, email, nombre, apellido, created_at`,
    [clerkUserId, normalizedEmail, nombre || "", apellido || ""]
  );

  if (!result.rows[0]) {
    throw new Error("El email ya esta vinculado a otro usuario de Clerk");
  }

  return result.rows[0];
}

async function getUserByClerkId(clerkUserId) {
  const result = await query(
    `select id_usuario, clerk_user_id, email, nombre, apellido, created_at
     from usuario
     where clerk_user_id = $1`,
    [clerkUserId]
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
  getUserByClerkId,
  upsertClerkUser,
  getUserByEmail
};
