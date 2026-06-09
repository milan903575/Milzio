import productService from './product.service.js';

async function getAllProducts(req, res) {
  const products = await productService.getAllProducts();
  return res.status(200).json(products);
}

async function getProducts(req, res) {
  const { id, name, brand, category, minPrice, maxPrice, keywords } = req.query;

  const products = await productService.getProducts({ id, name, brand, category, minPrice, maxPrice, keywords });
  return res.status(200).json(products);
}

async function getProduct(req, res) {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  if (!product) return res.status(404).json({
    message: 'Product not found'
  });
  return res.status(200).json(product);
}

async function createProduct(req, res) {
  const data = req.body;
  await productService.createProduct(data);
  return res.status(201).json({
    message: 'Product created',
    data: {
      name: data.name,
      price: data.price_cents
    }
  });
}

const productController = {
  getAllProducts,
  getProducts,
  getProduct,
  createProduct
};

export default productController;
