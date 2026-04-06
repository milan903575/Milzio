import aiService from './ai.service.js';

async function chat(req, res) {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message || !userId) {
    return res.status(400).json({ message: 'Message and userId are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.flushHeaders();

  try {
    await aiService.chat(message, userId, res);

    res.write('event: done\ndata: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).end(err.message);
    } else {
      res.write('event: error\ndata: Something went wrong\n\n');
      res.end();
    }
  }
}

const aiController = {
  chat
};

export default aiController;