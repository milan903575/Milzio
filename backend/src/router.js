const router = require('express').Router();

const userRouter = require('./modules/users/user.routes');

router.get('/', (req, res) => {
  res.send('Welcome to the main page');
});

router.use('/users', userRouter);

module.exports = router;