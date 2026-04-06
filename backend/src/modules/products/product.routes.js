import express from 'express';
import productController from './product.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authz.middleware.js';

const router = express.Router();

router.get('/', productController.getAllProducts);

router.get('/:id', productController.getProduct);

router.post('/', authenticate, authorize('vendor'), productController.createProduct);

export default router;
