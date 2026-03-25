const router = require('express').Router();
const controller = require('./ai.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.post('/chat', authMiddleware.authMiddleware, controller.chat);

module.exports = router;