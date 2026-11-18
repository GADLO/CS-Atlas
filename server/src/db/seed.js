const json = (value) => JSON.stringify(value ?? null);

function upsert(db, table, slugColumn, columns, values) {
  const placeholders = columns.map(() => '?').join(', ');
  const updates = columns
    .filter((column) => column !== slugColumn)
    .map((column) => `${column} = excluded.${column}`)
    .join(', ');
  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT(${slugColumn}) DO UPDATE SET ${updates}
  `;
  db.prepare(sql).run(...values);
}

function pruneBySlug(db, table, slugs) {
  if (slugs.length === 0) {
    db.exec(`DELETE FROM ${table}`);
    return;
  }
  const placeholders = slugs.map(() => '?').join(', ');
  db.prepare(`DELETE FROM ${table} WHERE slug NOT IN (${placeholders})`).run(...slugs);
}

export function seedDatabase(db, data) {
  const meta = data.meta || {};

  const insertInstruction = db.prepare(`
    INSERT INTO instructions (mnemonic, name, format, opcode, funct3, funct7, category, description, operation, example)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertChapter = db.prepare(`
    INSERT INTO chapters (number, title, title_en, pages, summary, sections, key_ideas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRelation = db.prepare(
    'INSERT INTO relations (source_slug, target_slug, kind, label) VALUES (?, ?, ?, ?)',
  );
  const insertLensNode = db.prepare('INSERT OR IGNORE INTO lens_nodes (lens_slug, node_slug) VALUES (?, ?)');
  const insertQuestionNode = db.prepare('INSERT OR IGNORE INTO question_nodes (question_slug, node_slug) VALUES (?, ?)');
  const upsertMeta = db.prepare(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  );

  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM relations; DELETE FROM lens_nodes; DELETE FROM question_nodes;');

    for (const [index, era] of data.eras.entries()) {
      upsert(
        db,
        'eras',
        'slug',
        [
          'slug', 'name', 'start_year', 'end_year', 'sort_order', 'tagline', 'key_idea',
          'hero_machine_slug', 'narrative', 'transition', 'accent',
        ],
        [
          era.slug,
          era.name,
          era.startYear,
          era.endYear,
          era.sortOrder ?? index,
          era.tagline,
          era.keyIdea,
          era.heroMachine ?? null,
          json(era.narrative),
          era.transition ? json(era.transition) : null,
          era.accent,
        ],
      );
    }

    for (const [index, entity] of data.entities.entries()) {
      upsert(
        db,
        'entities',
        'slug',
        [
          'slug', 'type', 'name', 'name_en', 'category', 'layer', 'era_slug', 'year',
          'maker', 'form_factor', 'scene_key', 'scene_config', 'summary', 'description',
          'specs', 'highlights', 'tags', 'significance', 'book', 'sources', 'accent',
          'icon', 'formula', 'variables', 'calculator', 'sort_order',
        ],
        [
          entity.slug,
          entity.type,
          entity.name,
          entity.name_en,
          entity.category,
          entity.layer,
          entity.eraSlug ?? null,
          entity.year ?? null,
          entity.maker ?? null,
          entity.formFactor ?? null,
          entity.sceneKey ?? null,
          entity.sceneConfig ? json(entity.sceneConfig) : null,
          entity.summary,
          json(entity.description),
          json(entity.specs),
          json(entity.highlights),
          json(entity.tags),
          entity.significance ? json(entity.significance) : null,
          entity.book ? json(entity.book) : null,
          entity.sources ? json(entity.sources) : null,
          entity.accent,
          entity.icon,
          entity.formula ?? null,
          entity.variables ? json(entity.variables) : null,
          entity.calculator ?? null,
          index,
        ],
      );
    }

    for (const event of data.events) {
      upsert(
        db,
        'events',
        'slug',
        [
          'slug', 'year', 'date_label', 'lane', 'title', 'summary', 'era_slug',
          'importance', 'entity_slugs', 'sources',
        ],
        [
          event.slug,
          event.year,
          event.dateLabel ?? null,
          event.lane,
          event.title,
          event.summary,
          event.eraSlug ?? null,
          event.importance ?? 2,
          json(event.entitySlugs ?? []),
          json(event.sources ?? []),
        ],
      );
    }

    for (const question of data.questions) {
      upsert(
        db,
        'questions',
        'slug',
        [
          'slug', 'number', 'sort_order', 'title', 'short_title', 'question',
          'one_line_answer', 'summary', 'answer_sections', 'key_concepts',
          'timeline_anchors', 'entity_slugs', 'model_slugs', 'ai_module_slugs',
          'scene_keys', 'calculator', 'interaction', 'book', 'misconceptions',
          'quiz', 'sources', 'status',
        ],
        [
          question.slug,
          question.number,
          question.sortOrder ?? question.number,
          question.title,
          question.shortTitle,
          question.question,
          question.oneLineAnswer,
          question.summary,
          json(question.answerSections ?? []),
          json(question.keyConcepts ?? []),
          json(question.timelineAnchors ?? []),
          json(question.entitySlugs ?? []),
          json(question.modelSlugs ?? []),
          json(question.aiModuleSlugs ?? []),
          json(question.sceneKeys ?? []),
          question.calculator ?? null,
          question.interaction ? json(question.interaction) : null,
          question.book ? json(question.book) : null,
          json(question.misconceptions ?? []),
          json(question.quiz ?? []),
          json(question.sources ?? []),
          question.status ?? 'planned',
        ],
      );
    }

    for (const module of data.aiModules) {
      upsert(
        db,
        'ai_modules',
        'slug',
        [
          'slug', 'sort_order', 'title', 'level', 'duration_min', 'summary',
          'objectives', 'sections', 'entity_slugs', 'calculator', 'quiz', 'sources',
        ],
        [
          module.slug,
          module.sortOrder ?? 0,
          module.title,
          module.level,
          module.durationMin ?? null,
          module.summary,
          json(module.objectives ?? []),
          json(module.sections ?? []),
          json(module.entitySlugs ?? []),
          module.calculator ?? null,
          json(module.quiz ?? []),
          json(module.sources ?? []),
        ],
      );
    }

    for (const lens of data.lenses) {
      upsert(
        db,
        'lenses',
        'slug',
        ['number', 'slug', 'title', 'title_en', 'lens_group', 'core_question', 'summary', 'accent', 'sort_order'],
        [
          lens.number,
          lens.slug,
          lens.title,
          lens.titleEn,
          lens.group,
          lens.coreQuestion,
          lens.summary,
          lens.accent,
          lens.sortOrder ?? lens.number,
        ],
      );
    }

    for (const timelineNode of data.timelineNodes) {
      upsert(
        db,
        'timeline_nodes',
        'slug',
        [
          'slug', 'period_slug', 'lane', 'year', 'title', 'summary', 'body',
          'generation', 'frontier', 'entity_slug', 'scene_key', 'model_slugs', 'ai_module_slugs',
          'sources', 'sort_order',
        ],
        [
          timelineNode.slug,
          timelineNode.periodSlug,
          timelineNode.lane,
          timelineNode.year,
          timelineNode.title,
          timelineNode.summary,
          timelineNode.body,
          timelineNode.generation ?? 0,
          timelineNode.frontier ? 1 : 0,
          timelineNode.entitySlug ?? null,
          timelineNode.sceneKey ?? null,
          json(timelineNode.modelSlugs ?? []),
          json(timelineNode.aiModuleSlugs ?? []),
          json(timelineNode.sources ?? []),
          timelineNode.sortOrder ?? 0,
        ],
      );
    }

    pruneBySlug(db, 'questions', data.questions.map((question) => question.slug));
    pruneBySlug(db, 'ai_modules', data.aiModules.map((module) => module.slug));
    pruneBySlug(db, 'events', data.events.map((event) => event.slug));
    pruneBySlug(db, 'entities', data.entities.map((entity) => entity.slug));
    pruneBySlug(db, 'timeline_nodes', data.timelineNodes.map((node) => node.slug));
    pruneBySlug(db, 'lenses', data.lenses.map((lens) => lens.slug));
    pruneBySlug(db, 'eras', data.eras.map((era) => era.slug));

    for (const timelineNode of data.timelineNodes) {
      for (const lensSlug of timelineNode.lensSlugs ?? []) {
        insertLensNode.run(lensSlug, timelineNode.slug);
      }
      for (const questionSlug of timelineNode.questionSlugs ?? []) {
        insertQuestionNode.run(questionSlug, timelineNode.slug);
      }
    }

    db.exec('DELETE FROM instructions; DELETE FROM chapters;');
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
    for (const relation of data.relations) {
      insertRelation.run(relation.source, relation.target, relation.kind, relation.label);
    }

    const version = String(meta.version ?? 1);
    upsertMeta.run('seed_version', version);
    upsertMeta.run('content_version', String(meta.contentVersion ?? version));
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
