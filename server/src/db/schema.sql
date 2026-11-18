-- Full current schema (reference).
-- Runtime bootstrapping uses server/src/db/migrations/*.sql via migrations.js.
-- Keep this file in sync for review and manual inspection.

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Runtime migration ledger. Created by migrations.js before applying migrations.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id         TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS eras (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  start_year        INTEGER NOT NULL,
  end_year          INTEGER NOT NULL,
  sort_order        INTEGER NOT NULL,
  tagline           TEXT NOT NULL,
  key_idea          TEXT NOT NULL,
  hero_machine_slug TEXT,
  narrative         TEXT NOT NULL,
  transition        TEXT,
  accent            TEXT NOT NULL,
  CHECK (start_year <= end_year)
);

CREATE TABLE IF NOT EXISTS entities (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  type         TEXT NOT NULL CHECK (type IN ('hardware','software','model','ai')),
  name         TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  category     TEXT NOT NULL,
  layer        TEXT NOT NULL,
  era_slug     TEXT REFERENCES eras(slug) ON DELETE SET NULL,
  year         INTEGER,
  maker        TEXT,
  form_factor  TEXT,
  scene_key    TEXT,
  scene_config TEXT,
  summary      TEXT NOT NULL,
  description  TEXT NOT NULL,
  specs        TEXT NOT NULL,
  highlights   TEXT NOT NULL,
  tags         TEXT NOT NULL,
  significance TEXT,
  book         TEXT,
  sources      TEXT,
  accent       TEXT NOT NULL,
  icon         TEXT NOT NULL,
  formula      TEXT,
  variables    TEXT,
  calculator   TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  year         INTEGER NOT NULL,
  date_label   TEXT,
  lane         TEXT NOT NULL CHECK (lane IN ('hardware','software','ai','idea')),
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL,
  era_slug     TEXT REFERENCES eras(slug) ON DELETE SET NULL,
  importance   INTEGER NOT NULL DEFAULT 2 CHECK (importance BETWEEN 1 AND 3),
  entity_slugs TEXT,
  sources      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT NOT NULL UNIQUE,
  number           INTEGER NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 7),
  sort_order       INTEGER NOT NULL,
  title            TEXT NOT NULL,
  short_title      TEXT NOT NULL,
  question         TEXT NOT NULL,
  one_line_answer  TEXT NOT NULL,
  summary          TEXT NOT NULL,
  answer_sections  TEXT NOT NULL,
  key_concepts     TEXT,
  timeline_anchors TEXT,
  entity_slugs     TEXT,
  model_slugs      TEXT,
  ai_module_slugs  TEXT,
  scene_keys       TEXT,
  calculator       TEXT,
  interaction      TEXT,
  book             TEXT,
  misconceptions   TEXT,
  quiz             TEXT NOT NULL,
  sources          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'planned'
                   CHECK (status IN ('planned','drafted','reviewed','published'))
);

CREATE TABLE IF NOT EXISTS ai_modules (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  sort_order   INTEGER NOT NULL,
  title        TEXT NOT NULL,
  level        TEXT NOT NULL,
  duration_min INTEGER,
  summary      TEXT NOT NULL,
  objectives   TEXT NOT NULL,
  sections     TEXT NOT NULL,
  entity_slugs TEXT,
  calculator   TEXT,
  quiz         TEXT,
  sources      TEXT
);

CREATE TABLE IF NOT EXISTS relations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  source_slug TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  target_slug TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  label       TEXT NOT NULL,
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
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  number    INTEGER NOT NULL,
  title     TEXT NOT NULL,
  title_en  TEXT NOT NULL,
  pages     TEXT NOT NULL,
  summary   TEXT NOT NULL,
  sections  TEXT NOT NULL,
  key_ideas TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS timeline_nodes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  period_slug     TEXT NOT NULL REFERENCES eras(slug) ON DELETE CASCADE,
  lane            TEXT NOT NULL CHECK (lane IN ('hardware','software','algorithm')),
  year            INTEGER NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  body            TEXT NOT NULL,
  generation      INTEGER NOT NULL DEFAULT 0 CHECK (generation BETWEEN 0 AND 4),
  frontier        INTEGER NOT NULL DEFAULT 0 CHECK (frontier IN (0,1)),
  entity_slug     TEXT,
  scene_key       TEXT,
  model_slugs     TEXT,
  ai_module_slugs TEXT,
  sources         TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lenses (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  number        INTEGER NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  title_en      TEXT NOT NULL,
  lens_group    TEXT NOT NULL CHECK (lens_group IN ('classic','frontier')),
  core_question TEXT NOT NULL,
  summary       TEXT NOT NULL,
  accent        TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lens_nodes (
  lens_slug TEXT NOT NULL REFERENCES lenses(slug) ON DELETE CASCADE,
  node_slug TEXT NOT NULL REFERENCES timeline_nodes(slug) ON DELETE CASCADE,
  PRIMARY KEY (lens_slug, node_slug)
);

CREATE TABLE IF NOT EXISTS question_nodes (
  question_slug TEXT NOT NULL REFERENCES questions(slug) ON DELETE CASCADE,
  node_slug     TEXT NOT NULL REFERENCES timeline_nodes(slug) ON DELETE CASCADE,
  PRIMARY KEY (question_slug, node_slug)
);

CREATE INDEX IF NOT EXISTS idx_nodes_period ON timeline_nodes(period_slug, lane, year);
CREATE INDEX IF NOT EXISTS idx_nodes_lane ON timeline_nodes(lane);
CREATE INDEX IF NOT EXISTS idx_lens_nodes_node ON lens_nodes(node_slug);
CREATE INDEX IF NOT EXISTS idx_question_nodes_node ON question_nodes(node_slug);

CREATE TABLE IF NOT EXISTS annotations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type  TEXT NOT NULL CHECK (target_type IN ('entity','question','ai_module','era')),
  target_slug  TEXT NOT NULL,
  target_label TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('favorite','note')),
  content      TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS annotations_one_favorite
  ON annotations(target_type, target_slug) WHERE kind = 'favorite';
CREATE INDEX IF NOT EXISTS annotations_created ON annotations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_entities_type     ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_era      ON entities(era_slug);
CREATE INDEX IF NOT EXISTS idx_entities_year     ON entities(year);
CREATE INDEX IF NOT EXISTS idx_entities_category ON entities(category);
CREATE INDEX IF NOT EXISTS idx_events_year       ON events(year);
CREATE INDEX IF NOT EXISTS idx_events_lane       ON events(lane);
CREATE INDEX IF NOT EXISTS idx_events_era        ON events(era_slug);
CREATE INDEX IF NOT EXISTS idx_questions_number  ON questions(number);
CREATE INDEX IF NOT EXISTS idx_questions_status  ON questions(status);
CREATE INDEX IF NOT EXISTS idx_relations_source  ON relations(source_slug);
CREATE INDEX IF NOT EXISTS idx_relations_target  ON relations(target_slug);
CREATE INDEX IF NOT EXISTS idx_annotations_target ON annotations(target_type, target_slug);
