class ProductNotFoundError extends Error {
  constructor(barcode) {
    super("Producto no encontrado");
    this.name = "ProductNotFoundError";
    this.code = "PRODUCT_NOT_FOUND";
    this.status = 404;
    this.barcode = barcode;
  }
}

async function fetchProduct(barcode) {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
  if (response.status === 404) throw new ProductNotFoundError(barcode);
  if (!response.ok) throw new Error("No se pudo consultar el producto");

  const data = await response.json();
  if (data.status === 0 || !data.product) throw new ProductNotFoundError(barcode);

  return data.product;
}

module.exports = {
  ProductNotFoundError,
  fetchProduct
};
