import productRepository from './product.repository.js';

async function getAllProducts() {
  return await productRepository.getAllProducts();
}

async function getProducts(filters) {
  return await productRepository.getProducts(filters);
}

async function getProductById(id) {
  return await productRepository.getProductById(id);
}

async function createProduct(data) {
  return await productRepository.createProduct(data);
}
const productService = {
  getAllProducts,
  getProducts,
  getProductById,
  createProduct
};

export default productService;
