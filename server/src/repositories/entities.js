import { rowToEntity } from './mappers.js';

export function createEntityRepository(db) {
  const getEntityStmt = db.prepare('SELECT * FROM entities WHERE slug = ?');

  return {
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
  };
}
