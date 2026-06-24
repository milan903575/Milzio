import express from 'express';
import userRouter from './modules/users/user.routes.js';
import productRouter from './modules/products/product.routes.js';
import aiRouter from './modules/ai/ai.routes.js';
import cartRouter from './modules/carts/cart.routes.js';
import orderRouter from './modules/orders/order.routes.js';
import paymentRouter from './modules/payments/payment.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the main page');
});

router.use('/users', userRouter);

router.use('/products', productRouter);

router.use('/MilzioAI', aiRouter);

router.use('/carts', cartRouter);

router.use('/orders', orderRouter);

router.use('/payments', paymentRouter);

export default router;