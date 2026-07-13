import express from 'express';
import orderController from './order.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import orderValidator from './order.validator.js';

const router = express.Router();

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getUserOrders);
router.get('/:orderId', authenticate, validate(orderValidator.getOrderByIdSchema), orderController.getOrderById);

export default router;