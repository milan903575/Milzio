const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/Milzio.db');

const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('customer', 'vendor', 'admin')) DEFAULT 'customer'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    description TEXT,
    image TEXT,
    category TEXT,
    price_cents INTEGER NOT NULL,
    original_price_cents INTEGER,
    rating_stars REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    keywords TEXT
  )
`).run();

module.exports = db;