import { API_BASE } from "../scripts/utils/config.js";

export function getProduct(productId) {
  let matchingProduct;

  products.forEach((product) => {
    if (product.id === Number(productId)) {
      matchingProduct = product;
    }
  });
  return matchingProduct;
}

export let products = [];

export async function loadProducts() {
  const response = await fetch(`${API_BASE}/api/products/`);
  products = await response.json();
}