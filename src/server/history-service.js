const { query } = require("./db");

async function createScanHistory({ userId, barcode, product, analysis }) {
  const history = await query(
    `insert into historial_escaneo
     (id_usuario, codigo_barras, nombre_producto, marca, resultado, explicacion, datos_producto_snapshot)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      userId,
      barcode,
      product.product_name || "Producto sin nombre",
      product.brands || "",
      analysis.resultado,
      analysis.explicacion,
      product
    ]
  );

  return history.rows[0];
}

async function getUserHistory(userId) {
  const result = await query(
    "select * from historial_escaneo where id_usuario = $1 order by fecha desc limit 50",
    [userId]
  );

  return result.rows;
}

module.exports = {
  createScanHistory,
  getUserHistory
};
