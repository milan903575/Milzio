import express from 'express';
import userController from './user.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authz.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import userValidator from './user.validator.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get('/profile', authenticate, userController.getUser);
router.post('/register', validate(userValidator.createUserSchema), userController.createUser);
router.post('/login', validate(userValidator.loginUserSchema), userController.loginUser);

export default router;