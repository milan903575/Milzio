import aiService from './ai.service.js';

async function chat(req, res) {
  const { message, mode } = req.body;
  const userId = req.user?.id;

  if (!message || !userId) {
    return res.status(400).json({ message: 'Message and userId are required' });
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.flushHeaders();

    await aiService.chat(message, userId, res, mode);

    if (!res.writableEnded) {
      return res.end();
    }
  } catch (err) {
    console.error('Chat error:', err);

    if (!res.headersSent) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!res.writableEnded) {
      res.write('event: error\n');
      res.write(`data: ${JSON.stringify({ message: 'Something went wrong' })}\n\n`);
      return res.end();
    }
  }
}

async function getChatHistory(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const chats = await aiService.getChatHistory(userId);
    return res.status(200).json(chats);
  } catch (error) {
    console.error('Get chat history error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

async function deleteChat(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await aiService.deleteChat(userId);
    return res.status(200).json({
      message: result.deleted ? 'Chat deleted successfully' : 'No chat found to delete',
      ...result,
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

const aiController = {
  chat,
  getChatHistory,
  deleteChat,
};

export default aiController;