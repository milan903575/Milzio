const router = require('express').Router();
const controller = require('./product.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const authzMiddleware = require('../../middleware/authz.middleware');

router.get('/', controller.getAllProducts);

router.get('/:id', controller.getProduct);

router.post('/', authMiddleware.authMiddleware, authzMiddleware.authorize('vendor'), controller.createProduct);

module.exports = router;
