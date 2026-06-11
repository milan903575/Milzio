import pool from '../../config/db.js';

async function saveMessage(userId, role, content) {
  const query = `
    INSERT INTO ai_chats (user_id, role, content)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, role, content, created_at
  `;

  const values = [userId, role, content];
  const result = await pool.query(query, values);

  return result.rows[0];
}

async function getRecentHistory(userId, limit = 6) {
  const query = `
    SELECT role, content
    FROM ai_chats
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const values = [userId, limit];
  const result = await pool.query(query, values);

  return result.rows;
}

async function deleteChat(userId) {
  const query = `
    DELETE FROM ai_chats
    WHERE user_id = $1
  `;

  const result = await pool.query(query, [userId]);

  return {
    deleted: result.rowCount > 0,
    count: result.rowCount,
  };
}

const aiRepository = {
  saveMessage,
  getRecentHistory,
  deleteChat,
};

export default aiRepository;