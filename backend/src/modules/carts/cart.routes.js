import express from 'express';
import cartController from './cart.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import cartValidator from './cart.validator.js';

const router = express.Router();

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, validate(cartValidator.addItemSchema), cartController.addItem);
router.patch('/items/:itemId', authenticate, validate(cartValidator.updateItemSchema), cartController.updateItem);
router.delete('/items/:itemId', authenticate, validate(cartValidator.removeItemSchema), cartController.removeItem);
router.delete('/', authenticate, cartController.clearCart);

export default router;