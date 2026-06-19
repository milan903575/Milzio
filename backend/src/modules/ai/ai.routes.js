import express from 'express';
import authenticate from '../../middleware/auth.middleware.js';
import aiController from './ai.controller.js';

const router = express.Router();

router.get('/chat/history', authenticate, aiController.getChatHistory);

router.post('/chat', authenticate, aiController.chat);

router.delete('/chat', authenticate, aiController.deleteChat);

export default router;