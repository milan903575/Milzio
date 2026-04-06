import express from 'express';
import userRouter from './modules/users/user.routes.js';
import productRouter from './modules/products/product.routes.js';
import aiRouter from './modules/ai/ai.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the main page');
});

router.use('/users', userRouter);

router.use('/products', productRouter);

router.use('/MilzioAI', aiRouter);

export default router;