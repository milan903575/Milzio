import express from 'express';
import paymentController from './payment.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import paymentValidator from './payment.validator.js';

const router = express.Router();

router.post('/create-order', authenticate, validate(paymentValidator.createGatewayOrderSchema), paymentController.createGatewayOrder);
router.post('/verify', authenticate, validate(paymentValidator.verifyPaymentSchema), paymentController.verifyPayment);

export default router;