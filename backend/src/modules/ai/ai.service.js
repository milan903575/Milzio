require('dotenv').config();

const model = 'llama3.2';

async function chat(userMessage, history, res) {
  res.write(':' + ' '.repeat(1024) + '\n\n');
  res.flush?.();

  const ollamaRes = await fetch(process.env.OLLAMA_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are Milzio AI, a smart shopping assistant. Help users find products, compare items and give recommendations.'
        },
        ...history,
        { role: 'user', content: userMessage }
      ],
      stream: true
    })
  });

  if (!ollamaRes.ok) {
    throw new Error(`Ollama error: ${ollamaRes.status}`);
  }

  let fullResponse = '';
  const reader = ollamaRes.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const token = parsed.message?.content || '';
        if (token) {
          const safeToken = token.replace(/\n/g, '\\n');
          res.write(`data: ${safeToken}\n\n`);
          res.flush?.();
          fullResponse += token;
        }
      } catch (e) {
        // skip malformed chunks
      }
    }
  }

  return fullResponse;
}

module.exports = { chat };
