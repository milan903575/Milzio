const db = require('./db');

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT
)
`).run();


db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Milan', 'milan@gmail.com', 'milan123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Shreyas', 'shreyas@gmail.com', 'shreyas123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Arjun', 'arjun@gmail.com', 'arjun123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Priya', 'priya@gmail.com', 'priya123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Rahul', 'rahul@gmail.com', 'rahul123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Sneha', 'sneha@gmail.com', 'sneha123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Karan', 'karan@gmail.com', 'karan123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Neha', 'neha@gmail.com', 'neha123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Vikram', 'vikram@gmail.com', 'vikram123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Ananya', 'ananya@gmail.com', 'ananya123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Rohan', 'rohan@gmail.com', 'rohan123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Divya', 'divya@gmail.com', 'divya123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Aditya', 'aditya@gmail.com', 'aditya123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Meera', 'meera@gmail.com', 'meera123')`).run();
db.prepare(`INSERT OR IGNORE INTO users (name, email, password) VALUES ('Siddharth', 'siddharth@gmail.com', 'sid123')`).run();

