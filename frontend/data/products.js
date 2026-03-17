export function getProduct(productId) {
  let matchingProduct;

  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });
  return matchingProduct;
}

export let products = [];

export async function loadProducts(fun) {

  const response = await fetch('http://localhost:3000/api/products/');
  products = await response.json();
  fun();
}

