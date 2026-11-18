-- 002_time_first.sql
-- Add periods-by-node model, chapter lenses and question/node mappings.

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
