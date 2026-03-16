const db = require('../../config/db');

function getAllUsers() {
  const stmt = db.prepare(`SELECT name, email from users`);
  return stmt.all();
}

function getUserByEmail(email) {
  const stmt = db.prepare(`
    select name, email, password 
    from users
    where email = ?
    `);
  return stmt.get(email);
}

function createUser(name, email, password) {
  const stmt = db.prepare(`
    insert into users(name, email, password) values(?, ?, ?)
    `);
  return stmt.run(name, email, password);
}

module.exports = {
  getAllUsers,
  getUserByEmail,
  createUser
};