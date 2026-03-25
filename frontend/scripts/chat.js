import { API_BASE } from "./utils/config.js";

let isSending = false;

async function sendMessage(text) {
  if (isSending) return;

  const input = document.getElementById('chatInput');
  const msg = text || input.value.trim();
  if (!msg) return;

  isSending = true;

  if (!text) {
    input.value = '';
    input.style.height = 'auto';
  }

  appendMessage('user', msg);
  const { bubble } = appendStreamingMessage();

  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/api/MilzioAI/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: msg,
      })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    bubble.textContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop();

      for (const part of parts) {
        const line = part.trim();
        if (!line || line.startsWith(':')) continue;

        if (line.includes('[DONE]')) return;

        if (line.startsWith('data: ')) {
          const token = line.slice(6).replace(/\\n/g, '\n');
          bubble.textContent += token;
          scrollToBottom();
        }
      }
    }

  } catch (err) {
    bubble.textContent = 'Sorry, something went wrong. Please try again.';
    console.error('Chat error:', err);
  } finally {
    isSending = false;
  }
}

function scrollToBottom() {
  const messages = document.getElementById('chatMessages');
  messages.scrollTop = messages.scrollHeight;
}

function appendMessage(role, text) {
  const messages = document.getElementById('chatMessages');
  const isUser = role === 'user';

  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `
    <div class="msg-avatar">
      <iconify-icon icon="${isUser ? 'mdi:account' : 'mdi:robot-outline'}" width="14" style="color:#ffffff"></iconify-icon>
    </div>
    <div>
      <div class="msg-bubble">${text}</div>
      <div class="msg-time">Just now</div>
    </div>`;

  messages.appendChild(div);
  scrollToBottom();
}

function appendStreamingMessage() {
  const messages = document.getElementById('chatMessages');

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = '...';

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = 'Just now';

  const wrapper = document.createElement('div');
  wrapper.appendChild(bubble);
  wrapper.appendChild(time);

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.innerHTML = `<iconify-icon icon="mdi:robot-outline" width="14" style="color:#ffffff"></iconify-icon>`;

  const div = document.createElement('div');
  div.className = 'msg bot';
  div.appendChild(avatar);
  div.appendChild(wrapper);

  messages.appendChild(div);
  scrollToBottom();

  return { bubble };
}

document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => sendMessage(chip.dataset.msg));
});

document.querySelector('.send-btn').addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  sendMessage();
});

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

document.getElementById('chatInput').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 80) + 'px';
});