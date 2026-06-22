import express from 'express';
import cartController from './cart.controller.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, cartController.getCart);

router.post('/items', authenticate, cartController.addItem);

router.patch('/items/:itemId', authenticate, cartController.updateItem);

router.delete('/items/:itemId', authenticate, cartController.removeItem);

router.delete('/', authenticate, cartController.clearCart);

export default router;