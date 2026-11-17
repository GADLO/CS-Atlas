const json = (value) => JSON.stringify(value ?? null);

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
