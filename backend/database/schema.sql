-- GovGuide database schema (SQLite)
-- Roles are constrained at the application layer (see models/User.js) and by CHECK constraints below.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('USER', 'ADMIN')) DEFAULT 'USER',
  phone         TEXT,
  status        TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DISABLED')) DEFAULT 'ACTIVE',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT
);

CREATE TABLE IF NOT EXISTS schemes (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  description         TEXT NOT NULL,
  category           TEXT NOT NULL,
  benefits           TEXT NOT NULL,        -- JSON array of strings
  eligibility        TEXT NOT NULL,        -- JSON array of strings
  documents          TEXT NOT NULL,        -- JSON array of strings
  application_steps  TEXT NOT NULL,        -- JSON array of strings
  government_level   TEXT NOT NULL CHECK (government_level IN ('CENTRAL', 'STATE')) DEFAULT 'CENTRAL',
  state               TEXT DEFAULT 'All India',
  official_url        TEXT,
  benefit_summary      TEXT,
  min_age             INTEGER,
  max_age             INTEGER,
  max_income          INTEGER,
  occupation_tags     TEXT,                -- JSON array
  gender              TEXT DEFAULT 'ANY',
  status               TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED')) DEFAULT 'ACTIVE',
  is_demo_data        INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheme_id  INTEGER NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, scheme_id)
);

CREATE TABLE IF NOT EXISTS recently_viewed (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheme_id  INTEGER NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  viewed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  detail     TEXT,
  timestamp  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
