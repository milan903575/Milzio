import aiService from './ai.service.js';
import { sendSuccess } from '../../utils/response.helper.js';
import AppError from '../../utils/app.error.js';

async function chat(req, res, next) {
  const { message, mode } = req.body;
  const userId = req.user?.id;

  if (!message || !userId) {
    return next(new AppError('Message and userId are required', 400));
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.flushHeaders();

    await aiService.chat(message, userId, res, mode);

    if (!res.writableEnded) {
      res.end();
    }
  } catch (err) {
    if (!res.headersSent) {
      return next(err);
    }

    if (!res.writableEnded) {
      res.write('event: error\n');
      res.write(`data: ${JSON.stringify({ message: 'Something went wrong' })}\n\n`);
      res.end();
    }
  }
}

async function getChatHistory(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const chats = await aiService.getChatHistory(userId);
    sendSuccess(res, 200, 'Chat history fetched', chats);
  } catch (err) {
    next(err);
  }
}

async function deleteChat(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const result = await aiService.deleteChat(userId);
    sendSuccess(
      res,
      200,
      result.deleted ? 'Chat deleted successfully' : 'No chat found to delete',
      result
    );
  } catch (err) {
    next(err);
  }
}

const aiController = {
  chat,
  getChatHistory,
  deleteChat,
};

export default aiController;