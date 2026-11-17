export function rowToEntity(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    name: row.name,
    nameEn: row.name_en,
    category: row.category,
    layer: row.layer,
    eraSlug: row.era_slug || null,
    year: row.year,
    maker: row.maker || null,
    formFactor: row.form_factor || null,
    sceneKey: row.scene_key || null,
    sceneConfig: row.scene_config ? JSON.parse(row.scene_config) : null,
    summary: row.summary,
    description: JSON.parse(row.description),
    specs: JSON.parse(row.specs),
    highlights: JSON.parse(row.highlights),
    tags: JSON.parse(row.tags),
    significance: row.significance ? JSON.parse(row.significance) : [],
    book: row.book ? JSON.parse(row.book) : null,
    sources: row.sources ? JSON.parse(row.sources) : [],
    accent: row.accent,
    icon: row.icon,
    formula: row.formula || null,
    variables: row.variables ? JSON.parse(row.variables) : [],
    calculator: row.calculator || null,
  };
}

export function rowToInstruction(row) {
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

export function rowToChapter(row) {
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

export function rowToEra(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    startYear: row.start_year,
    endYear: row.end_year,
    sortOrder: row.sort_order,
    tagline: row.tagline,
    keyIdea: row.key_idea,
    heroMachine: row.hero_machine_slug || null,
    narrative: JSON.parse(row.narrative),
    transition: row.transition ? JSON.parse(row.transition) : null,
    accent: row.accent,
  };
}

export function rowToEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    year: row.year,
    dateLabel: row.date_label || null,
    lane: row.lane,
    title: row.title,
    summary: row.summary,
    eraSlug: row.era_slug || null,
    importance: row.importance,
    entitySlugs: row.entity_slugs ? JSON.parse(row.entity_slugs) : [],
    sources: row.sources ? JSON.parse(row.sources) : [],
  };
}

export function rowToQuestion(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    number: row.number,
    sortOrder: row.sort_order,
    title: row.title,
    shortTitle: row.short_title,
    question: row.question,
    oneLineAnswer: row.one_line_answer,
    summary: row.summary,
    answerSections: JSON.parse(row.answer_sections),
    keyConcepts: row.key_concepts ? JSON.parse(row.key_concepts) : [],
    timelineAnchors: row.timeline_anchors ? JSON.parse(row.timeline_anchors) : [],
    entitySlugs: row.entity_slugs ? JSON.parse(row.entity_slugs) : [],
    modelSlugs: row.model_slugs ? JSON.parse(row.model_slugs) : [],
    aiModuleSlugs: row.ai_module_slugs ? JSON.parse(row.ai_module_slugs) : [],
    sceneKeys: row.scene_keys ? JSON.parse(row.scene_keys) : [],
    calculator: row.calculator || null,
    interaction: row.interaction ? JSON.parse(row.interaction) : null,
    book: row.book ? JSON.parse(row.book) : null,
    misconceptions: row.misconceptions ? JSON.parse(row.misconceptions) : [],
    quiz: JSON.parse(row.quiz),
    sources: JSON.parse(row.sources),
    status: row.status,
  };
}

export function rowToAiModule(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    sortOrder: row.sort_order,
    title: row.title,
    level: row.level,
    durationMin: row.duration_min,
    summary: row.summary,
    objectives: JSON.parse(row.objectives),
    sections: JSON.parse(row.sections),
    entitySlugs: row.entity_slugs ? JSON.parse(row.entity_slugs) : [],
    calculator: row.calculator || null,
    quiz: row.quiz ? JSON.parse(row.quiz) : [],
    sources: row.sources ? JSON.parse(row.sources) : [],
  };
}

export function rowToAnnotation(row) {
  if (!row) return null;
  return {
    id: row.id,
    targetType: row.target_type,
    targetSlug: row.target_slug,
    targetLabel: row.target_label,
    kind: row.kind,
    content: row.content,
    createdAt: row.created_at,
  };
}
