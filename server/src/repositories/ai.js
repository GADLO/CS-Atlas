import { rowToAiModule } from './mappers.js';

export function createAiRepository(db) {
  function resolveEntities(slugs) {
    if (!slugs.length) return [];
    return db
      .prepare(
        `SELECT slug, name, name_en, type, category, icon, accent, summary
         FROM entities WHERE slug IN (${slugs.map(() => '?').join(', ')})`,
      )
      .all(...slugs)
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
  }

  return {
    listAiModules() {
      return db
        .prepare('SELECT * FROM ai_modules ORDER BY sort_order')
        .all()
        .map((row) => {
          const module = rowToAiModule(row);
          return {
            id: module.id,
            slug: module.slug,
            sortOrder: module.sortOrder,
            title: module.title,
            level: module.level,
            durationMin: module.durationMin,
            summary: module.summary,
            objectives: module.objectives,
            calculator: module.calculator,
            entitySlugs: module.entitySlugs,
          };
        });
    },

    getAiModule(slug) {
      const row = db.prepare('SELECT * FROM ai_modules WHERE slug = ?').get(slug);
      if (!row) return null;
      const module = rowToAiModule(row);
      return { ...module, entities: resolveEntities(module.entitySlugs) };
    },

    getAiModuleSummary(slug) {
      const row = db.prepare('SELECT slug, title, level, summary FROM ai_modules WHERE slug = ?').get(slug);
      if (!row) return null;
      return { slug: row.slug, label: row.title, level: row.level, summary: row.summary };
    },
  };
}
