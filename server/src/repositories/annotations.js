import { rowToAnnotation } from './mappers.js';

export function createAnnotationRepository(db) {
  function getAnnotation(id) {
    return rowToAnnotation(db.prepare('SELECT * FROM annotations WHERE id = ?').get(id));
  }

  return {
    listAnnotations({ targetType, targetSlug } = {}) {
      const where = [];
      const params = [];
      if (targetType) {
        where.push('target_type = ?');
        params.push(targetType);
      }
      if (targetSlug) {
        where.push('target_slug = ?');
        params.push(targetSlug);
      }
      const sql = `SELECT * FROM annotations ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC`;
      return db.prepare(sql).all(...params).map(rowToAnnotation);
    },

    addAnnotation({ targetType, targetSlug, targetLabel, kind, content = '' }) {
      if (kind === 'favorite') {
        const existing = db
          .prepare("SELECT * FROM annotations WHERE target_type = ? AND target_slug = ? AND kind = 'favorite'")
          .get(targetType, targetSlug);
        if (existing) return getAnnotation(existing.id);
      }
      const result = db
        .prepare('INSERT INTO annotations (target_type, target_slug, target_label, kind, content) VALUES (?, ?, ?, ?, ?)')
        .run(targetType, targetSlug, targetLabel, kind, content);
      return getAnnotation(Number(result.lastInsertRowid));
    },

    getAnnotation,

    deleteAnnotation(id) {
      return db.prepare('DELETE FROM annotations WHERE id = ?').run(id).changes > 0;
    },
  };
}
