const router = require('express').Router();
const controller = require('./user.controller')
const authMiddleware = require('../../middleware/auth.middleware');
const authzMiddleware = require('../../middleware/authz.middleware');

router.get('/', authMiddleware.authMiddleware, authzMiddleware.authorize('admin'), controller.getAllUsers);

router.get('/profile', authMiddleware.authMiddleware, controller.getUser);

router.post('/register', controller.createUser);

router.post('/login', controller.loginUser);



module.exports = router;