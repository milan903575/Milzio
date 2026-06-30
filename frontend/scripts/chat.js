import { API_BASE } from './utils/config.js';

const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sendButton = document.querySelector('.send-btn');
const modeButtons = document.querySelectorAll('.mode-chip');
const deleteChatBtn = document.getElementById('deleteChatBtn');

let isSending = false;
let currentMode = 'general';

function renderMarkdown(text) {
  const rawHtml = marked.parse(text);
  return DOMPurify.sanitize(rawHtml);
}

function setActiveMode(mode) {
  currentMode = mode;

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-checked', String(isActive));
  });
}

function renderWelcomeMessage() {
  chatMessages.innerHTML = `
    <div class="msg bot">
      <div class="msg-avatar">
        <iconify-icon icon="mdi:robot-outline" width="14" style="color:#ffffff"></iconify-icon>
      </div>
      <div>
        <div class="msg-bubble">
          Hey! I'm <strong>Milzio AI</strong>, your shopping assistant.<br><br>
          Ask me anything — general help, product search, or product analysis.
        </div>
      </div>
    </div>
  `;
}

async function loadChatHistory() {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      renderWelcomeMessage();
      return;
    }

    const response = await fetch(`${API_BASE}/api/MilzioAI/chat/history`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      renderWelcomeMessage();
      return;
    }

    if (!response.ok) {
      throw new Error(`History load failed: ${response.status}`);
    }

    const chats = await response.json();

    if (!Array.isArray(chats) || chats.length === 0) {
      renderWelcomeMessage();
      return;
    }

    chatMessages.innerHTML = '';

    chats.forEach((chat) => {
      addMessage(chat.role, chat.content);
    });
  } catch (error) {
    console.error('Load chat history error:', error);
    renderWelcomeMessage();
  }
}

async function sendMessage() {
  if (isSending) return;

  const message = chatInput.value.trim();
  if (!message) return;

  isSending = true;
  sendButton.disabled = true;

  chatInput.value = '';
  chatInput.style.height = 'auto';

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
      body: JSON.stringify({
        message,
        mode: currentMode,
      }),
    });

    if (response.status === 401) {
      assistantBubble.innerHTML = `
        <span style="display:flex;align-items:center;gap:6px;">
          <iconify-icon icon="mdi:lock-outline" width="16" style="color:currentColor"></iconify-icon>
          Please <a href="../authentication.html" style="text-decoration:underline;font-weight:600;">login</a> to use the chat feature.
        </span>
      `;
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

async function deleteChat() {
  const confirmed = window.confirm('Are you sure? This will delete your chat.');
  if (!confirmed) return;

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/api/MilzioAI/chat`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    renderWelcomeMessage();
  } catch (error) {
    console.error('Delete chat error:', error);
    alert('Unable to delete chat right now. Please try again.');
  }
}

function parseSSE(block) {
  const lines = block.split('\n');
  let event = 'message';
  const dataLines = [];

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

  content.appendChild(bubble);
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

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveMode(button.dataset.mode);
  });
});

deleteChatBtn?.addEventListener('click', deleteChat);

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

setActiveMode('general');
loadChatHistory();

(function () {
  const fab = document.getElementById('chatFab');
  const panel = document.querySelector('.chat-panel');
  const backdrop = document.getElementById('chatBackdrop');
  const badge = document.getElementById('chatFabBadge');

  if (!fab || !panel || !backdrop) return;

  // Only run on mobile
  function isMobile() { return window.innerWidth <= 768; }

  function openChat() {
    panel.classList.add('chat-open');
    backdrop.classList.add('active');
    fab.classList.add('active');
    fab.setAttribute('aria-label', 'Close AI chat');
    badge.classList.remove('visible');
  }

  function closeChat() {
    panel.classList.remove('chat-open');
    backdrop.classList.remove('active');
    fab.classList.remove('active');
    fab.setAttribute('aria-label', 'Open AI chat');
  }

  fab.addEventListener('click', () => {
    if (!isMobile()) return;
    panel.classList.contains('chat-open') ? closeChat() : openChat();
  });

  backdrop.addEventListener('click', () => {
    if (!isMobile()) return;
    closeChat();
  });

  // ── Swipe down to close ──
  let startY = 0;
  let isDragging = false;
  let swipeAllowed = false;

  panel.addEventListener('touchstart', (e) => {
    if (!isMobile()) return;
    startY = e.touches[0].clientY;
    isDragging = true;

    // Only allow swipe-to-close if messages are scrolled to the top
    const msgs = document.getElementById('chatMessages');
    swipeAllowed = !msgs || msgs.scrollTop <= 0;
  }, { passive: true });

  panel.addEventListener('touchmove', (e) => {
    if (!isMobile() || !isDragging || !swipeAllowed) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      panel.style.transform = `translateY(${deltaY}px)`;
      panel.style.transition = 'none';
    }
  }, { passive: true });

  panel.addEventListener('touchend', (e) => {
    if (!isMobile() || !isDragging) return;
    isDragging = false;
    const deltaY = e.changedTouches[0].clientY - startY;
    panel.style.transition = '';
    if (swipeAllowed && deltaY > 80) {
      closeChat();
      panel.style.transform = '';
    } else {
      panel.style.transform = '';
    }
  }, { passive: true });

  // ── Show badge when bot sends a new message while chat is closed ──
  const msgContainer = document.getElementById('chatMessages');
  if (msgContainer) {
    const observer = new MutationObserver(() => {
      if (isMobile() && !panel.classList.contains('chat-open')) {
        badge.classList.add('visible');
      }
    });
    observer.observe(msgContainer, { childList: true });
  }
})();