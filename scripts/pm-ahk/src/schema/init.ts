export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS initiatives (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  description TEXT,
  status      TEXT    NOT NULL DEFAULT 'pending'
              CHECK(status IN ('pending','discovery','strategy','spec','review','approved','blocked','done')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS actions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  initiative_id INTEGER NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  agent         TEXT    NOT NULL,
  action_type   TEXT    NOT NULL DEFAULT 'action',
  content       TEXT    NOT NULL DEFAULT '',
  status        TEXT    NOT NULL DEFAULT 'in_progress'
                CHECK(status IN ('in_progress','completed','blocked')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  completed_at  TEXT,
  summary       TEXT
);

CREATE TABLE IF NOT EXISTS action_files (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  action_id INTEGER NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  file_path TEXT    NOT NULL,
  operation TEXT    NOT NULL CHECK(operation IN ('read','created','modified','deleted')),
  notes     TEXT
);

CREATE TABLE IF NOT EXISTS action_tools (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  action_id      INTEGER NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  tool_name      TEXT    NOT NULL,
  args_json      TEXT,
  result_summary TEXT,
  called_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS criteria (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  initiative_id INTEGER NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  criterion     TEXT    NOT NULL,
  met           INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_initiatives_status ON initiatives(status);
CREATE INDEX IF NOT EXISTS idx_actions_initiative ON actions(initiative_id);
CREATE INDEX IF NOT EXISTS idx_criteria_initiative ON criteria(initiative_id);
`
