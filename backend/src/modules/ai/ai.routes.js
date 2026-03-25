const router = require('express').Router();
const controller = require('./ai.controller');

router.post('/chat', controller.chat);

module.exports = router;