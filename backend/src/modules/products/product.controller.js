const service = require('./product.service');

async function getAllProducts(req, res) {
  const products = await service.getAllProducts();
  return res.status(200).json(products);
}

async function getProduct(req, res) {
  const { id } = req.params;
  const product = await service.getProductById(id);
  if (!product) return res.status(404).json({
    message: 'Product not found'
  });
  return res.status(200).json(product);
}

async function createProduct(req, res) {
  const data = req.body;
  await service.createProduct(data);
  return res.status(201).json({
    message: 'Product created',
    data: {
      name: data.name,
      price: data.price_cents
    }
  });
}

module.exports = {
  getAllProducts,
  getProduct,
  createProduct
};
