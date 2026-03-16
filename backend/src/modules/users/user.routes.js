const router = require('express').Router();
const controller = require('./user.controller')


router.get('/', controller.getAllUsers);

router.post('/register', controller.createUser);

router.post('/login', controller.loginUser);



module.exports = router;