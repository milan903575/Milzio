const router = require('express').Router();

const userRouter = require('./modules/users/user.routes');
const productRouter = require('./modules/products/product.routes');
const aiRouter = require('../src/modules/ai/ai.routes');

router.get('/', (req, res) => {
  res.send('Welcome to the main page');
});

router.use('/users', userRouter);

router.use('/products', productRouter);

router.use('/MilzioAI', aiRouter);

module.exports = router;