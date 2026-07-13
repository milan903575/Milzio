import express from 'express';
import authenticate from '../../middleware/auth.middleware.js';
import aiController from './ai.controller.js';
import validate from '../../middleware/validate.middleware.js';
import aiValidator from './ai.validator.js';

const router = express.Router();

router.get('/chat/history', authenticate, aiController.getChatHistory);
router.post('/chat', authenticate, validate(aiValidator.chatSchema), aiController.chat);
router.delete('/chat', authenticate, aiController.deleteChat);

export default router;