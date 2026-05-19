import 'dotenv/config';
import Groq from 'groq-sdk';
import aiRepository from './ai.repository.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const model = 'llama-3.1-8b-instant';

function sendEvent(res, event, payload) {
  if (res.writableEnded) return;

  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  res.flush?.();
}

async function chat(userMessage, userId, res) {
  const rawHistory = aiRepository.getRecentHistory(userId, 6);
  const history = rawHistory.reverse();

  aiRepository.saveMessage(userId, 'user', userMessage);

  let fullResponse = '';
  let usageInfo = null;

  const stream = await groq.chat.completions.create({
    model,
    stream: true,
    stream_options: { include_usage: true },
    max_completion_tokens: 1000,
    messages: [
      {
        role: 'system',
        content:
          'You are **Milzio AI**, a smart, warm, and helpful assistant for **Milzio** — an online store.\n\n**Your role goes beyond just selling.** You help users:\n- Discover and compare products on Milzio\n- Find the best deals and make confident purchase decisions\n- Get **practical guidance** related to products — such as cooking tips, usage instructions, care guides, recipe ideas, or how-to advice (e.g., *"How do I use this air fryer?"* or *"What can I cook with a cast iron pan?"*)\n- Understand which product suits their specific needs before buying\n\n**Before diving into detailed product recommendations, confirm intent:**\n- *"Are you looking to buy this, or would you like some guidance on how to use it?"*\n- *"Would you like me to help you find this on Milzio?"*\n\nRespond helpfully based on their answer. If they just need guidance, help them — and naturally suggest relevant products at the end if it makes sense.\n\n**STRICT BOUNDARY — Non-negotiable:** You are ONLY allowed to discuss topics directly related to products, shopping, cooking, usage guides, and product comparisons. If a user asks about ANYTHING outside this scope — including but not limited to technology (e.g., Node.js, programming), politics, news, medical advice, finance, or general trivia — you must FULLY decline. Do NOT provide even a brief overview or partial answer. Instead, respond with something like:\n- *"That\'s outside what I can help with! I\'m here to make your shopping experience amazing. Can I help you find a product or guide you on using something? 😊"*\n\n**Tone:** Warm, conversational, and genuinely helpful — like a knowledgeable friend who loves both shopping and helping you get the most out of what you buy. Never robotic, never pushy.\n\n**Always use markdown** to improve user experience — use **bold**, *italics*, bullet points, numbered lists, tables, and headers wherever they make responses clearer and easier to read.',
      },
      ...history,
      { role: 'user', content: userMessage },
    ],
  });

  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content || '';
    const usage = chunk.x_groq?.usage || chunk.usage || null;

    if (token) {
      fullResponse += token;
      sendEvent(res, 'token', { content: token });
    }

    if (usage) {
      usageInfo = {
        prompt_tokens: usage.prompt_tokens ?? 0,
        completion_tokens: usage.completion_tokens ?? 0,
        total_tokens: usage.total_tokens ?? 0,
      };
    }
  }

  aiRepository.saveMessage(userId, 'assistant', fullResponse);

  if (usageInfo) {
    console.log('Groq token usage:', usageInfo);
  }

  sendEvent(res, 'done', { usage: usageInfo });

  return fullResponse;
}

const aiService = {
  chat
};

export default aiService;
