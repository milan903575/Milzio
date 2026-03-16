const Database = require('better-sqlite3');

const db = new Database('Milzio.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('customer', 'vendor', 'admin')) DEFAULT 'customer'
  )
`).run();


module.exports = db;