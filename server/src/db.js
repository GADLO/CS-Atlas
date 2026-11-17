import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { loadSeedData } from './data.js';

export const DEFAULT_DB_PATH = path.resolve('data/cs-atlas.db');

const SCHEMA = `
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
`;

const json = (value) => JSON.stringify(value ?? null);

function rowToEntity(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    name: row.name,
    nameEn: row.name_en,
    category: row.category,
    layer: row.layer,
    summary: row.summary,
    description: JSON.parse(row.description),
    specs: JSON.parse(row.specs),
    highlights: JSON.parse(row.highlights),
    tags: JSON.parse(row.tags),
    book: JSON.parse(row.book),
    accent: row.accent,
    icon: row.icon,
    scene: row.scene || null,
    formula: row.formula || null,
    variables: row.variables ? JSON.parse(row.variables) : [],
    calculator: row.calculator || null,
  };
}

function rowToInstruction(row) {
  if (!row) return null;
  return {
    id: row.id,
    mnemonic: row.mnemonic,
    name: row.name,
    format: row.format,
    opcode: row.opcode,
    funct3: row.funct3,
    funct7: row.funct7,
    category: row.category,
    description: row.description,
    operation: row.operation,
    example: row.example,
  };
}

function rowToChapter(row) {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    titleEn: row.title_en,
    pages: row.pages,
    summary: row.summary,
    sections: JSON.parse(row.sections),
    keyIdeas: JSON.parse(row.key_ideas),
  };
}

export function openDatabase(dbPath = DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}

export function seedDatabase(db, data) {
  const meta = data.meta || {};
  const insertEntity = db.prepare(`
    INSERT INTO entities
      (slug, type, name, name_en, category, layer, summary, description, specs,
       highlights, tags, book, accent, icon, scene, formula, variables, calculator, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRelation = db.prepare(
    'INSERT INTO relations (source_slug, target_slug, kind, label) VALUES (?, ?, ?, ?)',
  );
  const insertInstruction = db.prepare(`
    INSERT INTO instructions (mnemonic, name, format, opcode, funct3, funct7, category, description, operation, example)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertChapter = db.prepare(`
    INSERT INTO chapters (number, title, title_en, pages, summary, sections, key_ideas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const upsertMeta = db.prepare(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  );

  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM relations; DELETE FROM entities; DELETE FROM instructions; DELETE FROM chapters;');
    data.entities.forEach((entity, index) => {
      insertEntity.run(
        entity.slug,
        entity.type,
        entity.name,
        entity.name_en,
        entity.category,
        entity.layer,
        entity.summary,
        json(entity.description),
        json(entity.specs),
        json(entity.highlights),
        json(entity.tags),
        json(entity.book),
        entity.accent,
        entity.icon,
        entity.scene || null,
        entity.formula || null,
        entity.variables ? json(entity.variables) : null,
        entity.calculator || null,
        index,
      );
    });
    for (const relation of data.relations) {
      insertRelation.run(relation.source, relation.target, relation.kind, relation.label);
    }
    for (const instruction of data.instructions) {
      insertInstruction.run(
        instruction.mnemonic,
        instruction.name,
        instruction.format,
        instruction.opcode,
        instruction.funct3 ?? null,
        instruction.funct7 ?? null,
        instruction.category,
        instruction.description,
        instruction.operation,
        instruction.example,
      );
    }
    for (const chapter of data.chapters) {
      insertChapter.run(
        chapter.number,
        chapter.title,
        chapter.title_en,
        chapter.pages,
        chapter.summary,
        json(chapter.sections),
        json(chapter.key_ideas || []),
      );
    }
    upsertMeta.run('seed_version', String(meta.version ?? 1));
    upsertMeta.run('title', meta.title || '计算机系统图谱');
    upsertMeta.run('subtitle', meta.subtitle || '');
    upsertMeta.run('source', meta.source || '');
    upsertMeta.run('seeded_at', new Date().toISOString());
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function ensureSeed(db, data) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM entities').get().n;
  const version = db.prepare("SELECT value FROM meta WHERE key = 'seed_version'").get()?.value;
  if (count === 0 || version !== String(data.meta?.version ?? 1)) {
    seedDatabase(db, data);
    return true;
  }
  return false;
}

export function createRepository(db) {
  const getEntityStmt = db.prepare('SELECT * FROM entities WHERE slug = ?');
  const getInstructionStmt = db.prepare('SELECT * FROM instructions WHERE mnemonic = ?');

  const repo = {
    db,

    meta() {
      const rows = db.prepare('SELECT key, value FROM meta').all();
      return Object.fromEntries(rows.map((row) => [row.key, row.value]));
    },

    stats() {
      const byType = Object.fromEntries(
        db.prepare('SELECT type, COUNT(*) AS n FROM entities GROUP BY type').all().map((row) => [row.type, row.n]),
      );
      const categories = db
        .prepare('SELECT type, category, COUNT(*) AS n FROM entities GROUP BY type, category ORDER BY type, n DESC')
        .all();
      return {
        entities: db.prepare('SELECT COUNT(*) AS n FROM entities').get().n,
        hardware: byType.hardware || 0,
        software: byType.software || 0,
        model: byType.model || 0,
        relations: db.prepare('SELECT COUNT(*) AS n FROM relations').get().n,
        instructions: db.prepare('SELECT COUNT(*) AS n FROM instructions').get().n,
        chapters: db.prepare('SELECT COUNT(*) AS n FROM chapters').get().n,
        annotations: db.prepare('SELECT COUNT(*) AS n FROM annotations').get().n,
        categories,
      };
    },

    listEntities({ type, q, category, limit = 200 } = {}) {
      const where = [];
      const params = [];
      if (type) {
        where.push('type = ?');
        params.push(type);
      }
      if (category) {
        where.push('category = ?');
        params.push(category);
      }
      if (q) {
        where.push('(name LIKE ? OR name_en LIKE ? OR summary LIKE ? OR tags LIKE ?)');
        const pattern = `%${q}%`;
        params.push(pattern, pattern, pattern, pattern);
      }
      const sql = `SELECT * FROM entities ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY sort_order LIMIT ?`;
      params.push(Math.min(Number(limit) || 200, 500));
      return db.prepare(sql).all(...params).map(rowToEntity);
    },

    getEntity(slug) {
      return rowToEntity(getEntityStmt.get(slug));
    },

    relationsOf(slug) {
      const outgoing = db
        .prepare(
          `SELECT r.kind, r.label, e.slug, e.name, e.name_en, e.type, e.category, e.icon, e.accent, e.summary
           FROM relations r JOIN entities e ON e.slug = r.target_slug
           WHERE r.source_slug = ? ORDER BY r.id`,
        )
        .all(slug);
      const incoming = db
        .prepare(
          `SELECT r.kind, r.label, e.slug, e.name, e.name_en, e.type, e.category, e.icon, e.accent, e.summary
           FROM relations r JOIN entities e ON e.slug = r.source_slug
           WHERE r.target_slug = ? ORDER BY r.id`,
        )
        .all(slug);
      const shape = (row, direction) => ({
        direction,
        kind: row.kind,
        label: row.label,
        entity: {
          slug: row.slug,
          name: row.name,
          nameEn: row.name_en,
          type: row.type,
          category: row.category,
          icon: row.icon,
          accent: row.accent,
          summary: row.summary,
        },
      });
      return [...outgoing.map((row) => shape(row, 'out')), ...incoming.map((row) => shape(row, 'in'))];
    },

    graph() {
      const nodes = db
        .prepare('SELECT slug, name, name_en, type, category, icon, accent, summary FROM entities ORDER BY sort_order')
        .all()
        .map((row) => ({
          slug: row.slug,
          name: row.name,
          nameEn: row.name_en,
          type: row.type,
          category: row.category,
          icon: row.icon,
          accent: row.accent,
          summary: row.summary,
        }));
      const links = db
        .prepare('SELECT source_slug, target_slug, kind, label FROM relations ORDER BY id')
        .all()
        .map((row) => ({ source: row.source_slug, target: row.target_slug, kind: row.kind, label: row.label }));
      return { nodes, links };
    },

    listInstructions({ q, format, category } = {}) {
      const where = [];
      const params = [];
      if (format) {
        where.push('format = ?');
        params.push(format);
      }
      if (category) {
        where.push('category = ?');
        params.push(category);
      }
      if (q) {
        where.push('(mnemonic LIKE ? OR name LIKE ? OR description LIKE ?)');
        const pattern = `%${q}%`;
        params.push(pattern, pattern, pattern);
      }
      const sql = `SELECT * FROM instructions ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id`;
      return db.prepare(sql).all(...params).map(rowToInstruction);
    },

    getInstruction(mnemonic) {
      return rowToInstruction(getInstructionStmt.get(mnemonic));
    },

    listChapters() {
      return db.prepare('SELECT * FROM chapters ORDER BY number').all().map(rowToChapter);
    },

    search(q, limit = 8) {
      const pattern = `%${q}%`;
      const entities = db
        .prepare(
          `SELECT slug, name, name_en, type, category, icon, accent, summary FROM entities
           WHERE name LIKE ? OR name_en LIKE ? OR summary LIKE ? OR tags LIKE ?
           ORDER BY sort_order LIMIT ?`,
        )
        .all(pattern, pattern, pattern, pattern, limit)
        .map((row) => ({
          slug: row.slug,
          name: row.name,
          nameEn: row.name_en,
          type: row.type,
          category: row.category,
          icon: row.icon,
          accent: row.accent,
          summary: row.summary,
        }));
      const instructions = db
        .prepare('SELECT mnemonic, name, format, category FROM instructions WHERE mnemonic LIKE ? OR name LIKE ? LIMIT ?')
        .all(pattern, pattern, limit);
      return { entities, instructions };
    },

    listAnnotations({ entitySlug } = {}) {
      const sql = `
        SELECT a.id, a.entity_slug, a.kind, a.content, a.created_at,
               e.name AS entity_name, e.type AS entity_type, e.icon AS entity_icon, e.accent AS entity_accent
        FROM annotations a LEFT JOIN entities e ON e.slug = a.entity_slug
        ${entitySlug ? 'WHERE a.entity_slug = ?' : ''}
        ORDER BY a.created_at DESC, a.id DESC`;
      const rows = entitySlug ? db.prepare(sql).all(entitySlug) : db.prepare(sql).all();
      return rows.map((row) => ({
        id: row.id,
        entitySlug: row.entity_slug,
        kind: row.kind,
        content: row.content,
        createdAt: row.created_at,
        entity: {
          name: row.entity_name,
          type: row.entity_type,
          icon: row.entity_icon,
          accent: row.entity_accent,
        },
      }));
    },

    addAnnotation({ entitySlug, kind, content = '' }) {
      if (kind === 'favorite') {
        const existing = db
          .prepare("SELECT * FROM annotations WHERE entity_slug = ? AND kind = 'favorite'")
          .get(entitySlug);
        if (existing) {
          return repo.getAnnotation(existing.id);
        }
      }
      const result = db
        .prepare('INSERT INTO annotations (entity_slug, kind, content) VALUES (?, ?, ?)')
        .run(entitySlug, kind, content);
      return repo.getAnnotation(Number(result.lastInsertRowid));
    },

    getAnnotation(id) {
      const row = db
        .prepare(
          `SELECT a.id, a.entity_slug, a.kind, a.content, a.created_at,
                  e.name AS entity_name, e.type AS entity_type, e.icon AS entity_icon, e.accent AS entity_accent
           FROM annotations a LEFT JOIN entities e ON e.slug = a.entity_slug WHERE a.id = ?`,
        )
        .get(id);
      if (!row) return null;
      return {
        id: row.id,
        entitySlug: row.entity_slug,
        kind: row.kind,
        content: row.content,
        createdAt: row.created_at,
        entity: {
          name: row.entity_name,
          type: row.entity_type,
          icon: row.entity_icon,
          accent: row.entity_accent,
        },
      };
    },

    deleteAnnotation(id) {
      return db.prepare('DELETE FROM annotations WHERE id = ?').run(id).changes > 0;
    },
  };

  return repo;
}

export { rowToEntity, rowToInstruction, rowToChapter };
