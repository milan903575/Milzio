import { API_BASE } from './utils/config.js';

const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sendButton = document.querySelector('.send-btn');

let isSending = false;

function renderMarkdown(text) {
  const rawHtml = marked.parse(text);
  return DOMPurify.sanitize(rawHtml);
}

async function sendMessage(prefilledText = '') {
  if (isSending) return;

  const message = prefilledText || chatInput.value.trim();
  if (!message) return;

  isSending = true;
  sendButton.disabled = true;

  if (!prefilledText) {
    chatInput.value = '';
    chatInput.style.height = 'auto';
  }

  addMessage('user', message);
  const assistantBubble = addAssistantMessage();

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/api/MilzioAI/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (response.status === 401) {
      assistantBubble.innerHTML = `
        <span style="display:flex;align-items:center;gap:6px;">
          <iconify-icon icon="mdi:lock-outline" width="16" style="color:currentColor"></iconify-icon>
          Please <a href="../authentication.html" style="text-decoration:underline;font-weight:600;">login</a> to use the chat feature.
        </span>`;
      return;
    }

    if (!response.ok || !response.body) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        const parsed = parseSSE(chunk);
        if (!parsed) continue;

        if (parsed.event === 'token') {
          fullText += parsed.data.content || '';
          assistantBubble.innerHTML = renderMarkdown(fullText);
          scrollToBottom();
        }

        if (parsed.event === 'done') {
          assistantBubble.innerHTML = renderMarkdown(fullText);
          console.log('Usage:', parsed.data.usage);
        }

        if (parsed.event === 'error') {
          assistantBubble.textContent = parsed.data.message || 'Something went wrong.';
        }
      }
    }
  } catch (error) {
    assistantBubble.textContent = 'Sorry, something went wrong. Please try again.';
    console.error('Chat error:', error);
  } finally {
    isSending = false;
    sendButton.disabled = false;
    chatInput.focus();
  }
}

function parseSSE(block) {
  const lines = block.split('\n');
  let event = 'message';
  let dataLines = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!dataLines.length) return null;

  try {
    return {
      event,
      data: JSON.parse(dataLines.join('\n')),
    };
  } catch {
    return null;
  }
}

function addMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `msg ${role === 'user' ? 'user' : 'bot'}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.innerHTML =
    role === 'user'
      ? '<iconify-icon icon="mdi:account" width="14" style="color:#ffffff"></iconify-icon>'
      : '<iconify-icon icon="mdi:robot-outline" width="14" style="color:#ffffff"></iconify-icon>';

  const content = document.createElement('div');

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  if (role === 'user') {
    bubble.textContent = text;
  } else {
    bubble.innerHTML = renderMarkdown(text);
  }

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = 'Just now';

  content.appendChild(bubble);
  content.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(content);
  chatMessages.appendChild(wrapper);

  scrollToBottom();
  return bubble;
}

function addAssistantMessage() {
  return addMessage('assistant', '...');
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.querySelectorAll('.suggestion-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    sendMessage(chip.dataset.msg || '');
  });
});

sendButton.addEventListener('click', (event) => {
  event.preventDefault();
  sendMessage();
});

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 80)}px`;
});