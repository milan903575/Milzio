const router = require('express').Router();
const controller = require('./user.controller')
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', authMiddleware.authMiddleware, controller.getAllUsers);

router.post('/register', controller.createUser);

router.post('/login', controller.loginUser);



module.exports = router;