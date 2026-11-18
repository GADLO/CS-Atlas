export function createTargetRepository(db) {
  return {
    resolveTarget(targetType, targetSlug) {
      if (targetType === 'entity') {
        const row = db.prepare('SELECT slug, name, type FROM entities WHERE slug = ?').get(targetSlug);
        return row ? { targetType, targetSlug: row.slug, targetLabel: row.name, entityType: row.type } : null;
      }
      if (targetType === 'question') {
        const row = db.prepare('SELECT slug, short_title FROM questions WHERE slug = ?').get(targetSlug);
        return row ? { targetType, targetSlug: row.slug, targetLabel: row.short_title } : null;
      }
      if (targetType === 'ai_module') {
        const row = db.prepare('SELECT slug, title FROM ai_modules WHERE slug = ?').get(targetSlug);
        return row ? { targetType, targetSlug: row.slug, targetLabel: row.title } : null;
      }
      if (targetType === 'era') {
        const row = db.prepare('SELECT slug, name FROM eras WHERE slug = ?').get(targetSlug);
        return row ? { targetType, targetSlug: row.slug, targetLabel: row.name } : null;
      }
      return null;
    },
  };
}
