import pool from '../../config/db.js';

async function getAllUsers() {
  const query = `
    SELECT id, name, email
    FROM users
    ORDER BY id DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function getUserByEmail(email) {
  const query = `
    SELECT id, name, email, password, role
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const values = [email];
  const result = await pool.query(query, values);

  return result.rows[0] || null;
}

async function createUser(name, email, password) {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, role
  `;

  const values = [name, email, password];
  const result = await pool.query(query, values);

  return result.rows[0];
}

const userRepository = {
  getAllUsers,
  getUserByEmail,
  createUser,
};

export default userRepository;