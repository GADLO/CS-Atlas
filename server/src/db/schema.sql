CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL CHECK (type IN ('hardware','software','model')),
  name        TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  category    TEXT NOT NULL,
  layer       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  description TEXT NOT NULL,
  specs       TEXT NOT NULL,
  highlights  TEXT NOT NULL,
  tags        TEXT NOT NULL,
  book        TEXT NOT NULL,
  accent      TEXT NOT NULL,
  icon        TEXT NOT NULL,
  scene       TEXT,
  formula     TEXT,
  variables   TEXT,
  calculator  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS relations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source_slug  TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  target_slug  TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  kind         TEXT NOT NULL,
  label        TEXT NOT NULL,
  UNIQUE (source_slug, target_slug)
);

CREATE TABLE IF NOT EXISTS instructions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mnemonic    TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  format      TEXT NOT NULL,
  opcode      TEXT NOT NULL,
  funct3      TEXT,
  funct7      TEXT,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  operation   TEXT NOT NULL,
  example     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chapters (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  number   INTEGER NOT NULL,
  title    TEXT NOT NULL,
  title_en TEXT NOT NULL,
  pages    TEXT NOT NULL,
  summary  TEXT NOT NULL,
  sections TEXT NOT NULL,
  key_ideas TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS annotations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_slug TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('favorite','note')),
  content     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS annotations_one_favorite
  ON annotations(entity_slug) WHERE kind = 'favorite';
CREATE INDEX IF NOT EXISTS annotations_created ON annotations(created_at DESC);
