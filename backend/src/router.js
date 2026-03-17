const router = require('express').Router();

const userRouter = require('./modules/users/user.routes');
const productRouter = require('./modules/products/product.routes');

router.get('/', (req, res) => {
  res.send('Welcome to the main page');
});

router.use('/users', userRouter);

router.use('/products', productRouter);

module.exports = router;