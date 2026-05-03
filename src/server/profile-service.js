const { query } = require("./db");

async function getProfile(userId) {
  const profileResult = await query(
    "select * from perfil_salud where id_usuario = $1",
    [userId]
  );
  const profile = profileResult.rows[0];
  if (!profile) return null;

  const [enfermedades, dietas, alergias] = await Promise.all([
    query(
      `select e.* from enfermedad e
       join perfil_salud_enfermedad pe on pe.id_enfermedad = e.id_enfermedad
       where pe.id_perfil = $1 order by e.nombre`,
      [profile.id_perfil]
    ),
    query(
      `select d.* from dieta d
       join perfil_salud_dieta pd on pd.id_dieta = d.id_dieta
       where pd.id_perfil = $1 order by d.nombre`,
      [profile.id_perfil]
    ),
    query(
      `select a.* from alergia a
       join perfil_salud_alergia pa on pa.id_alergia = a.id_alergia
       where pa.id_perfil = $1 order by a.nombre`,
      [profile.id_perfil]
    )
  ]);

  return {
    ...profile,
    enfermedades: enfermedades.rows,
    dietas: dietas.rows,
    alergias: alergias.rows
  };
}

async function saveProfile({ userId, edad, peso, altura, enfermedades, dietas, alergias }) {
  const profileResult = await query(
    `insert into perfil_salud (id_usuario, edad, peso, altura)
     values ($1, $2, $3, $4)
     on conflict (id_usuario) do update
     set edad = excluded.edad, peso = excluded.peso, altura = excluded.altura
     returning *`,
    [userId, edad || null, peso || null, altura || null]
  );
  const profile = profileResult.rows[0];

  await Promise.all([
    query("delete from perfil_salud_enfermedad where id_perfil = $1", [profile.id_perfil]),
    query("delete from perfil_salud_dieta where id_perfil = $1", [profile.id_perfil]),
    query("delete from perfil_salud_alergia where id_perfil = $1", [profile.id_perfil])
  ]);

  for (const id of enfermedades) {
    await query(
      "insert into perfil_salud_enfermedad (id_perfil, id_enfermedad) values ($1, $2) on conflict do nothing",
      [profile.id_perfil, id]
    );
  }
  for (const id of dietas) {
    await query(
      "insert into perfil_salud_dieta (id_perfil, id_dieta) values ($1, $2) on conflict do nothing",
      [profile.id_perfil, id]
    );
  }
  for (const id of alergias) {
    await query(
      "insert into perfil_salud_alergia (id_perfil, id_alergia) values ($1, $2) on conflict do nothing",
      [profile.id_perfil, id]
    );
  }

  return getProfile(userId);
}

module.exports = {
  getProfile,
  saveProfile
};
