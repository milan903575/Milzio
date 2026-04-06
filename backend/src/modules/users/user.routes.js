import express from 'express';
import userController from './user.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authz.middleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

router.get('/profile', authenticate, userController.getUser);

router.post('/register', userController.createUser);

router.post('/login', userController.loginUser);


export default router;