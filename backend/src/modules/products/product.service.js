import productRepository from './product.repository.js';
import AppError from '../../utils/app.error.js';

async function getAllProducts() {
  return await productRepository.getAllProducts();
}

async function getProducts(filters) {
  return await productRepository.getProducts(filters);
}

async function getProductById(id) {
  const product = await productRepository.getProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
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