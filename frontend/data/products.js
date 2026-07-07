import { API_BASE } from "../scripts/utils/config.js";

export let products = [];

export function getProduct(productId) {
  let matchingProduct;

  products.forEach((product) => {
    if (product.id === Number(productId)) {
      matchingProduct = product;
    }
  });
  return matchingProduct;
}

export async function loadProducts() {
  const response = await fetch(`${API_BASE}/api/products/`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to load products');
  }

  products = result.data;
}