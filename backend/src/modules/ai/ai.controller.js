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

const aiController = {
  chat
};

export default aiController;