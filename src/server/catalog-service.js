const { query } = require("./db");

async function getCatalogs() {
  const [enfermedades, dietas, alergias] = await Promise.all([
    query("select * from enfermedad order by nombre"),
    query("select * from dieta order by nombre"),
    query("select * from alergia order by nombre")
  ]);

  return {
    enfermedades: enfermedades.rows,
    dietas: dietas.rows,
    alergias: alergias.rows
  };
}

module.exports = {
  getCatalogs
};
