import express from 'express';
import authenticate from '../../middleware/auth.middleware.js';
import aiController from './ai.controller.js';

const router = express.Router();

router.post('/chat', authenticate, aiController.chat);

export default router;