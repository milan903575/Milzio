const repository = require('./product.repository');

async function getAllProducts() {
  return await repository.getAllProducts();
}

async function getProductById(id) {
  return await repository.getProductById(id);
}

async function createProduct(data) {
  return await repository.createProduct(data);
}
module.exports = {
  getAllProducts,
  getProductById,
  createProduct
};
