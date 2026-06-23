import express from 'express';
import orderController from './order.controller.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getUserOrders);
router.get('/:orderId', authenticate, orderController.getOrderById);

export default router;