// src/modules/payments/payment.routes.js

import express from 'express';
import paymentController from './payment.controller.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order', authenticate, paymentController.createGatewayOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);

export default router;