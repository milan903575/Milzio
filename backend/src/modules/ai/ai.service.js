import 'dotenv/config';
import Groq from 'groq-sdk';
import aiRepository from './ai.repository.js';
import productRepository from '../products/product.repository.js';
import AppError from '../../utils/app.error.js';
import {
  SEARCH_FILTER_PROMPT,
  SEARCH_RESPONSE_PROMPT,
  GENERAL_RESPONSE_PROMPT,
  ANALYZE_FILTER_PROMPT,
  ANALYZE_RESPONSE_PROMPT,
} from './ai.prompts.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const model = 'llama-3.1-8b-instant';

function sendEvent(res, event, payload) {
  if (!res || typeof res.write !== 'function') {
    throw new AppError('Invalid Express response object passed to sendEvent', 500);
  }

  if (res.writableEnded) return;

  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  res.flush?.();
}

async function getRecentConversationHistory(userId, limit = 6) {
  try {
    const rows = (await aiRepository.getRecentHistory(userId, limit)) || [];

    return rows
      .filter((item) => item && item.role && item.content)
      .map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: String(item.content),
      }))
      .reverse();
  } catch (error) {
    console.error('History fetch error:', error);
    return [];
  }
}

// Primary user-facing operation — must not hide failures.
async function getChatHistory(userId) {
  const rows = (await aiRepository.getRecentHistory(userId, 50)) || [];

  return rows
    .filter((item) => item && item.role && item.content)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content),
      created_at: item.created_at,
    }))
    .reverse();
}

async function extractFilters(userMessage, prompt) {
  const completion = await groq.chat.completions.create({
    model,
    stream: false,
    temperature: 0,
    max_completion_tokens: 200,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: userMessage },
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
  const normalizedFilters = {
    ...filters,
    brand: Array.isArray(filters.brand) ? filters.brand[0] : filters.brand,
  };

  return await productRepository.getProducts(normalizedFilters);
}

async function streamLLMResponse(systemPrompt, userContent, res, history = []) {
  let fullResponse = '';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userContent },
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
    meta: { mode: 'general' },
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

  if (products.length === 0) {
    const fullResponse =
      'No matching products found. Please try a clearer keyword, a broader search term, or paste the exact product brand or name.';

    sendEvent(res, 'token', { content: fullResponse });

    return {
      fullResponse,
      meta: {
        mode: 'search',
        filters: effectiveFilters,
        total: 0,
      },
    };
  }

  const history = await getRecentConversationHistory(userId, 6);

  const topProducts = products.slice(0, 5).map((product) => ({
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: `₹${(product.price_cents / 100).toFixed(0)}`,
    rating: product.rating_stars,
    ratingCount: product.rating_count,
    stock: product.stock,
    keywords: product.keywords,
  }));

  const fullResponse = await streamLLMResponse(
    SEARCH_RESPONSE_PROMPT,
    `User message: ${userMessage}\n\nProducts:\n${JSON.stringify(topProducts, null, 2)}`,
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

async function handleAnalyzeMode(userMessage, userId, res) {
  const filters = await extractFilters(userMessage, ANALYZE_FILTER_PROMPT);
  let products = await fetchProductsByFilters(filters);
  let effectiveFilters = { ...filters };

  if (products.length === 0) {
    const retryKeywords = filters.keywords || userMessage;
    if (retryKeywords) {
      effectiveFilters = { keywords: retryKeywords };
      products = await fetchProductsByFilters(effectiveFilters);
    }
  }

  if (products.length === 0) {
    const fullResponse =
      "I couldn't find a matching product to analyze. Please paste the exact product or model name.";

    sendEvent(res, 'token', { content: fullResponse });

    return {
      fullResponse,
      meta: {
        mode: 'analyze',
        filters: effectiveFilters,
        total: 0,
      },
    };
  }

  const product = {
    name: products[0].name,
    brand: products[0].brand,
    category: products[0].category,
    price: `₹${(products[0].price_cents / 100).toFixed(0)}`,
    rating: products[0].rating_stars,
    ratingCount: products[0].rating_count,
    stock: products[0].stock,
    keywords: products[0].keywords,
    description: products[0].description ?? null,
  };

  const fullResponse = await streamLLMResponse(
    ANALYZE_RESPONSE_PROMPT,
    `User message: ${userMessage}\n\nProduct:\n${JSON.stringify(product, null, 2)}`,
    res,
    []
  );

  return {
    fullResponse,
    meta: {
      mode: 'analyze',
      filters: effectiveFilters,
      total: products.length,
    },
  };
}

async function chat(userMessage, userId, res, mode = 'search') {
  // Non-critical: message logging shouldn't block the chat response.
  try {
    await aiRepository.saveMessage(userId, 'user', userMessage);
  } catch (error) {
    console.error('Failed to save user message:', error.message);
  }

  let result;

  if (mode === 'general') {
    result = await handleGeneralMode(userMessage, userId, res);
  } else if (mode === 'analyze') {
    result = await handleAnalyzeMode(userMessage, userId, res);
  } else {
    result = await handleSearchMode(userMessage, userId, res);
  }

  try {
    await aiRepository.saveMessage(userId, 'assistant', result.fullResponse);
  } catch (error) {
    console.error('Failed to save assistant message:', error.message);
  }

  sendEvent(res, 'done', result.meta);
  return result.fullResponse;
}

async function deleteChat(userId) {
  return await aiRepository.deleteChat(userId);
}

const aiService = {
  chat,
  getChatHistory,
  deleteChat,
};

export default aiService;