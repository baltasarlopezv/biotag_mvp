async function fetchProduct(barcode) {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
  if (!response.ok) throw new Error("No se pudo consultar el producto");
  const data = await response.json();
  if (!data.product) {
    return {
      code: barcode,
      product_name: "Producto sin identificar",
      brands: "",
      ingredients_text: "",
      nutriments: {}
    };
  }
  return data.product;
}

module.exports = {
  fetchProduct
};
