const { query } = require("./db");

const CURRENT_TERMS_VERSION = "1.0";
const CURRENT_PRIVACY_VERSION = "1.0";

const USER_PUBLIC_FIELDS = `
  id_usuario, clerk_user_id, email, nombre, apellido, created_at,
  terms_accepted_at, terms_version, privacy_accepted_at, privacy_version
`;

async function createUser({ email, passwordHash, nombre, apellido }) {
  const result = await query(
    `insert into usuario (email, nombre, apellido, password_hash)
     values ($1, $2, $3, $4)
     returning ${USER_PUBLIC_FIELDS}`,
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
       returning ${USER_PUBLIC_FIELDS}`,
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
     returning ${USER_PUBLIC_FIELDS}`,
    [clerkUserId, normalizedEmail, nombre || "", apellido || ""]
  );

  if (!result.rows[0]) {
    throw new Error("El email ya esta vinculado a otro usuario de Clerk");
  }

  return result.rows[0];
}

async function getUserByClerkId(clerkUserId) {
  const result = await query(
    `select ${USER_PUBLIC_FIELDS}
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

async function acceptCurrentLegal({ userId }) {
  const result = await query(
    `update usuario
     set terms_accepted_at = now(),
         terms_version = $2,
         privacy_accepted_at = now(),
         privacy_version = $3
     where id_usuario = $1
     returning ${USER_PUBLIC_FIELDS}`,
    [userId, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION]
  );

  return result.rows[0];
}

async function deleteUserById(userId) {
  const result = await query(
    `delete from usuario
     where id_usuario = $1
     returning id_usuario, clerk_user_id, email`,
    [userId]
  );

  return result.rows[0] || null;
}

function hasAcceptedCurrentLegal(user) {
  return Boolean(
    user?.terms_accepted_at &&
    user?.privacy_accepted_at &&
    user?.terms_version === CURRENT_TERMS_VERSION &&
    user?.privacy_version === CURRENT_PRIVACY_VERSION
  );
}

module.exports = {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  acceptCurrentLegal,
  createUser,
  deleteUserById,
  getUserByClerkId,
  hasAcceptedCurrentLegal,
  upsertClerkUser,
  getUserByEmail
};
