PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profile (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  surname      TEXT NOT NULL,
  given_name   TEXT NOT NULL,
  born_year    INTEGER,
  role         TEXT NOT NULL,
  location     TEXT,
  summary      TEXT NOT NULL,
  note         TEXT,
  email        TEXT,
  github       TEXT,
  linkedin     TEXT,
  available    INTEGER NOT NULL DEFAULT 1,
  since_year   INTEGER
);

CREATE TABLE IF NOT EXISTS projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  accession    TEXT NOT NULL,
  call_number  TEXT NOT NULL,
  title        TEXT NOT NULL,
  subtitle     TEXT,
  year         INTEGER NOT NULL,
  category     TEXT NOT NULL,
  summary      TEXT NOT NULL,
  details      TEXT,
  stack        TEXT NOT NULL DEFAULT '',
  url          TEXT,
  repo         TEXT,
  sort         INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stamps (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  visitor      TEXT NOT NULL,
  day          TEXT NOT NULL DEFAULT (date('now')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (project_id, visitor, day)
);

CREATE TABLE IF NOT EXISTS experience (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  org          TEXT NOT NULL,
  role         TEXT NOT NULL,
  start_date   TEXT NOT NULL,
  end_date     TEXT,
  description  TEXT NOT NULL,
  sort         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  heading      TEXT NOT NULL,
  subheading   TEXT NOT NULL,
  items        TEXT NOT NULL,
  see_also     TEXT,
  sort         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS guestbook (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  note         TEXT NOT NULL,
  approved     INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  is_read      INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stamps_project ON stamps(project_id);
