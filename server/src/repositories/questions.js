import { rowToQuestion } from './mappers.js';

function entitySummaries(db, slugs) {
  if (!slugs.length) return [];
  const placeholders = slugs.map(() => '?').join(', ');
  return db
    .prepare(
      `SELECT slug, name, name_en, type, category, icon, accent, summary
       FROM entities WHERE slug IN (${placeholders})`,
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

export function createQuestionRepository(db) {
  function listQuestions({ status } = {}) {
    const sql = `SELECT * FROM questions ${status ? 'WHERE status = ?' : ''} ORDER BY number`;
    const rows = status ? db.prepare(sql).all(status) : db.prepare(sql).all();
    return rows.map((row) => {
      const question = rowToQuestion(row);
      return {
        id: question.id,
        slug: question.slug,
        number: question.number,
        title: question.title,
        shortTitle: question.shortTitle,
        question: question.question,
        oneLineAnswer: question.oneLineAnswer,
        summary: question.summary,
        status: question.status,
        sceneKeys: question.sceneKeys,
        calculator: question.calculator,
      };
    });
  }

  function getQuestion(slug) {
    const row = db.prepare('SELECT * FROM questions WHERE slug = ?').get(slug);
    if (!row) return null;
    const question = rowToQuestion(row);
    const entities = entitySummaries(db, question.entitySlugs);
    const models = entitySummaries(db, question.modelSlugs);
    const aiModules = question.aiModuleSlugs.length
      ? db
          .prepare(
            `SELECT slug, title, level, duration_min, summary FROM ai_modules
             WHERE slug IN (${question.aiModuleSlugs.map(() => '?').join(', ')})`,
          )
          .all(...question.aiModuleSlugs)
          .map((module) => ({
            slug: module.slug,
            title: module.title,
            level: module.level,
            durationMin: module.duration_min,
            summary: module.summary,
          }))
      : [];
    const timelineAnchors = question.timelineAnchors.map((anchor) => {
      const era = anchor.eraSlug
        ? db.prepare('SELECT slug, name FROM eras WHERE slug = ?').get(anchor.eraSlug)
        : null;
      const machine = anchor.machineSlug
        ? db.prepare('SELECT slug, name FROM entities WHERE slug = ?').get(anchor.machineSlug)
        : null;
      const event = anchor.eventSlug
        ? db.prepare('SELECT slug, title, year FROM events WHERE slug = ?').get(anchor.eventSlug)
        : null;
      return {
        ...anchor,
        era: era ? { slug: era.slug, name: era.name } : null,
        machine: machine ? { slug: machine.slug, name: machine.name } : null,
        event: event ? { slug: event.slug, title: event.title, year: event.year } : null,
      };
    });
    return { ...question, entities, models, aiModules, timelineAnchors };
  }

  return {
    listQuestions,
    getQuestion,
    getQuestionSummary(slug) {
      const row = db.prepare('SELECT slug, short_title, one_line_answer, status FROM questions WHERE slug = ?').get(slug);
      if (!row) return null;
      return {
        slug: row.slug,
        label: row.short_title,
        oneLineAnswer: row.one_line_answer,
        status: row.status,
      };
    },
  };
}
