const db = require('../../config/db');

function saveMessage(userId, role, content) {
  const stmt = db.prepare(`
    INSERT INTO ai_chats (user_id, role, content) VALUES (?, ?, ?)`
  );
  return stmt.run(userId, role, content);
}

function getRecentHistory(userId, limit = 6) {
  const stmt = db.prepare(`
    SELECT role, content 
    FROM ai_chats
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(userId, limit);
}

function deleteChat(userId) {
  const stmt = db.prepare(`
    DELETE FROM ai_chats
    WHERE user_id = ?
  `);
  return stmt.run(userId);
}

module.exports = {
  saveMessage,
  getRecentHistory,
  deleteChat
};