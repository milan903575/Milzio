import 'dotenv/config';
import Groq from 'groq-sdk';
import aiRepository from './ai.repository.js';
import {
  SEARCH_FILTER_PROMPT,
  SEARCH_RESPONSE_PROMPT,
  GENERAL_RESPONSE_PROMPT,
  COMPARE_FILTER_PROMPT,
  COMPARE_RESPONSE_PROMPT,
} from './ai.prompts.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const model = 'llama-3.1-8b-instant';
const API_BASE = process.env.SERVER_URL;

function sendEvent(res, event, payload) {
  if (!res || typeof res.write !== 'function') {
    throw new Error('Invalid Express response object passed to sendEvent');
  }

  if (res.writableEnded) return;

  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  res.flush?.();
}

function normalizeHistoryRows(rows = []) {
  return rows
    .filter((item) => item && item.role && item.content)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content),
    }));
}

async function getRecentConversationHistory(userId, limit = 6) {
  try {
    const rows = aiRepository.getRecentHistory(userId, limit) || [];
    return normalizeHistoryRows(rows).reverse();
  } catch (error) {
    console.error('History fetch error:', error);
    return [];
  }
}

async function extractFilters(userMessage, prompt) {
  const completion = await groq.chat.completions.create({
    model,
    stream: false,
    temperature: 0,
    max_completion_tokens: 200,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() || '{}';

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function fetchProductsByFilters(filters) {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.brand?.length) {
    params.set('brand', filters.brand.join(','));
  }

  if (filters.minPrice) {
    params.set('minPrice', filters.minPrice);
  }

  if (filters.maxPrice) {
    params.set('maxPrice', filters.maxPrice);
  }

  if (filters.keywords) {
    params.set('keywords', filters.keywords);
  }

  const url = `${API_BASE}/api/products/query?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  return await response.json();
}

function buildProductContext(products, limit = 3) {
  return products.slice(0, limit).map((product) => ({
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: `₹${(product.price_cents / 100).toFixed(0)}`,
    rating: product.rating_stars,
    ratingCount: product.rating_count,
    stock: product.stock,
    keywords: product.keywords,
  }));
}

async function streamLLMResponse(systemPrompt, userContent, res, history = []) {
  let fullResponse = '';

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...history,
    {
      role: 'user',
      content: userContent,
    },
  ];

  const stream = await groq.chat.completions.create({
    model,
    stream: true,
    max_completion_tokens: 600,
    messages,
  });

  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content || '';

    if (!token) continue;

    fullResponse += token;
    sendEvent(res, 'token', { content: token });
  }

  return fullResponse;
}

async function handleGeneralMode(userMessage, userId, res) {
  const history = await getRecentConversationHistory(userId, 6);

  const fullResponse = await streamLLMResponse(
    GENERAL_RESPONSE_PROMPT,
    userMessage,
    res,
    history
  );

  return {
    fullResponse,
    meta: {
      mode: 'general',
    },
  };
}

async function handleSearchMode(userMessage, userId, res) {
  const filters = await extractFilters(userMessage, SEARCH_FILTER_PROMPT);
  let products = await fetchProductsByFilters(filters);
  let effectiveFilters = { ...filters };

  if (products.length === 0) {
    const retryKeywords = filters.keywords || userMessage;

    if (retryKeywords) {
      effectiveFilters = { keywords: retryKeywords };
      products = await fetchProductsByFilters(effectiveFilters);
    }
  }

  const history = await getRecentConversationHistory(userId, 6);
  const productContext = JSON.stringify(buildProductContext(products, 3), null, 2);

  const fullResponse = await streamLLMResponse(
    SEARCH_RESPONSE_PROMPT,
    `User message: ${userMessage}

Filters used:
${JSON.stringify(effectiveFilters, null, 2)}

Products:
${productContext}`,
    res,
    history
  );

  return {
    fullResponse,
    meta: {
      mode: 'search',
      filters: effectiveFilters,
      total: products.length,
    },
  };
}

async function handleCompareMode(userMessage, userId, res) {
  const filters = await extractFilters(userMessage, COMPARE_FILTER_PROMPT);
  let products = await fetchProductsByFilters(filters);
  let effectiveFilters = { ...filters };

  if (products.length === 0) {
    const retryKeywords = filters.keywords || userMessage;

    if (retryKeywords) {
      effectiveFilters = { keywords: retryKeywords };
      products = await fetchProductsByFilters(effectiveFilters);
    }
  }

  const history = await getRecentConversationHistory(userId, 6);
  const productContext = JSON.stringify(buildProductContext(products, 3), null, 2);

  const fullResponse = await streamLLMResponse(
    COMPARE_RESPONSE_PROMPT,
    `User message: ${userMessage}

Filters used:
${JSON.stringify(effectiveFilters, null, 2)}

Products:
${productContext}`,
    res,
    history
  );

  return {
    fullResponse,
    meta: {
      mode: 'compare',
      filters: effectiveFilters,
      total: products.length,
    },
  };
}

async function chat(userMessage, userId, res, mode = 'search') {
  aiRepository.saveMessage(userId, 'user', userMessage);

  let result;

  if (mode === 'general') {
    result = await handleGeneralMode(userMessage, userId, res);
  } else if (mode === 'compare') {
    result = await handleCompareMode(userMessage, userId, res);
  } else {
    result = await handleSearchMode(userMessage, userId, res);
  }

  aiRepository.saveMessage(userId, 'assistant', result.fullResponse);

  sendEvent(res, 'done', result.meta);

  return result.fullResponse;
}

const aiService = {
  chat,
};

export default aiService;