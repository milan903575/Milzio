import express from 'express';
import productController from './product.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authz.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import productValidator from './product.validator.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/query', validate(productValidator.getProductsSchema), productController.getProducts);
router.get('/:id', validate(productValidator.getProductSchema), productController.getProduct);
router.post('/', authenticate, authorize('vendor'), validate(productValidator.createProductSchema), productController.createProduct);

export default router;