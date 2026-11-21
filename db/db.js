const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'portfolio.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
}

function isEmpty() {
  return db.prepare('SELECT COUNT(*) AS n FROM profile').get().n === 0;
}

module.exports = { db, init, isEmpty, DB_PATH };
