import productService from './product.service.js';
import { sendSuccess } from '../../utils/response.helper.js';

async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    return sendSuccess(res, 200, 'Products fetched', products);
  } catch (err) {
    next(err);
  }
}

async function getProducts(req, res, next) {
  try {
    const { id, name, brand, category, minPrice, maxPrice, keywords } = req.query;
    const products = await productService.getProducts({ id, name, brand, category, minPrice, maxPrice, keywords });
    return sendSuccess(res, 200, 'Products fetched', products);
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    return sendSuccess(res, 200, 'Product fetched', product);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const data = req.body;
    await productService.createProduct(data);
    return sendSuccess(res, 201, 'Product created', {
      name: data.name,
      price: data.price_cents
    });
  } catch (err) {
    next(err);
  }
}

const productController = {
  getAllProducts,
  getProducts,
  getProduct,
  createProduct
};

export default productController;