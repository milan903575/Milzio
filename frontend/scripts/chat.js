// scripts/chat.js

const dummyReplies = [
  "Sure! Let me find the best options for you right now.",
  "Great question! Based on ratings and reviews, here are my top picks.",
  "That item is in stock and ships within 2 business days.",
  "I found a few matches across our catalog — here's what stands out.",
  "Happy to help! Here's what I recommend based on your budget."
];

function getBotAvatar() {
  return `<div class="msg-avatar"><iconify-icon icon="mdi:robot-outline" width="14" style="color:#ffffff"></iconify-icon></div>`;
}

function getUserAvatar() {
  return `<div class="msg-avatar"><iconify-icon icon="mdi:account" width="14" style="color:#ffffff"></iconify-icon></div>`;
}

function sendMessage(text) {
  const input = document.getElementById('chatInput');
  const msg = text || input.value.trim();
  if (!msg) return;

  const messages = document.getElementById('chatMessages');

  // Add user message
  const userBubble = `
    <div class="msg user">
      ${getUserAvatar()}
      <div>
        <div class="msg-bubble">${msg}</div>
        <div class="msg-time">Just now</div>
      </div>
    </div>`;
  messages.insertAdjacentHTML('beforeend', userBubble);

  if (!text) { input.value = ''; input.style.height = 'auto'; }
  messages.scrollTop = messages.scrollHeight;

  // Show typing indicator temporarily
  const typingId = 'typing-' + Date.now();
  const typingBubble = `
    <div class="msg bot" id="${typingId}">
      ${getBotAvatar()}
      <div class="typing-wrap">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  messages.insertAdjacentHTML('beforeend', typingBubble);
  messages.scrollTop = messages.scrollHeight;

  // Remove typing and add real reply after delay
  setTimeout(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    const reply = dummyReplies[Math.floor(Math.random() * dummyReplies.length)];
    const botBubble = `
      <div class="msg bot">
        ${getBotAvatar()}
        <div>
          <div class="msg-bubble">${reply}</div>
          <div class="msg-time">Just now</div>
        </div>
      </div>`;
    messages.insertAdjacentHTML('beforeend', botBubble);
    messages.scrollTop = messages.scrollHeight;
  }, 1100);
}

function chipSend(el) {
  sendMessage(el.textContent.trim());
}

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

document.getElementById('chatInput').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 80) + 'px';
});