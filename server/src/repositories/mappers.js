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

export function rowToAnnotation(row) {
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
}
