import { rowToAnnotation } from './mappers.js';

export function createAnnotationRepository(db) {
  function getAnnotation(id) {
    const row = db
      .prepare(
        `SELECT a.id, a.entity_slug, a.kind, a.content, a.created_at,
                e.name AS entity_name, e.type AS entity_type, e.icon AS entity_icon, e.accent AS entity_accent
         FROM annotations a LEFT JOIN entities e ON e.slug = a.entity_slug WHERE a.id = ?`,
      )
      .get(id);
    return rowToAnnotation(row);
  }

  return {
    listAnnotations({ entitySlug } = {}) {
      const sql = `
        SELECT a.id, a.entity_slug, a.kind, a.content, a.created_at,
               e.name AS entity_name, e.type AS entity_type, e.icon AS entity_icon, e.accent AS entity_accent
        FROM annotations a LEFT JOIN entities e ON e.slug = a.entity_slug
        ${entitySlug ? 'WHERE a.entity_slug = ?' : ''}
        ORDER BY a.created_at DESC, a.id DESC`;
      const rows = entitySlug ? db.prepare(sql).all(entitySlug) : db.prepare(sql).all();
      return rows.map(rowToAnnotation);
    },

    addAnnotation({ entitySlug, kind, content = '' }) {
      if (kind === 'favorite') {
        const existing = db
          .prepare("SELECT * FROM annotations WHERE entity_slug = ? AND kind = 'favorite'")
          .get(entitySlug);
        if (existing) {
          return getAnnotation(existing.id);
        }
      }
      const result = db
        .prepare('INSERT INTO annotations (entity_slug, kind, content) VALUES (?, ?, ?)')
        .run(entitySlug, kind, content);
      return getAnnotation(Number(result.lastInsertRowid));
    },

    getAnnotation,

    deleteAnnotation(id) {
      return db.prepare('DELETE FROM annotations WHERE id = ?').run(id).changes > 0;
    },
  };
}
