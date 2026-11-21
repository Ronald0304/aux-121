const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'portfolio.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  // migración: bases creadas antes de que existiera skills.level
  const cols = db.prepare('PRAGMA table_info(skills)').all().map((c) => c.name);
  const pcols = db.prepare('PRAGMA table_info(projects)').all().map((c) => c.name);
  if (!pcols.includes('code')) db.exec("ALTER TABLE projects ADD COLUMN code TEXT NOT NULL DEFAULT ''");
  if (!pcols.includes('image')) db.exec("ALTER TABLE projects ADD COLUMN image TEXT NOT NULL DEFAULT ''");
  if (!cols.includes('level')) db.exec('ALTER TABLE skills ADD COLUMN level INTEGER NOT NULL DEFAULT 70');
}

function isEmpty() {
  return db.prepare('SELECT COUNT(*) AS n FROM profile').get().n === 0;
}

module.exports = { db, init, isEmpty, DB_PATH };
