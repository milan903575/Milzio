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
    SELECT role, content, created_at
    FROM ai_chats
    WHERE user_id = $1
      AND is_deleted = FALSE
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const values = [userId, limit];
  const result = await pool.query(query, values);

  return result.rows;
}

async function deleteChat(userId) {
  const query = `
    UPDATE ai_chats
    SET is_deleted = TRUE
    WHERE user_id = $1
      AND is_deleted = FALSE
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