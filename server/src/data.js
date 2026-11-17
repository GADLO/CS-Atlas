import fs from 'node:fs';
import path from 'node:path';

export const TYPES = ['hardware', 'software', 'model'];
export const CATEGORIES = {
  hardware: ['计算', '存储', '互连', '输入输出', '供电散热', '封装基板'],
  software: ['指令集', '工具链', '系统软件', '应用与基准'],
  model: ['性能模型', '存储模型', '并行模型', '数据表示'],
};
export const LAYERS = [
  '应用层',
  '系统软件层',
  '指令集层',
  '微架构层',
  '逻辑层',
  '器件层',
  '系统层',
];
export const ICONS = [
  'cpu', 'chip', 'board', 'memory', 'disk', 'gpu', 'bus', 'io', 'power',
  'register', 'alu', 'control', 'pipeline', 'cache', 'isa', 'tool', 'os',
  'app', 'benchmark', 'model', 'network',
];
export const RELATION_KINDS = [
  'contains', 'uses', 'implements', 'depends', 'measures', 'accelerates',
  'stores', 'connects', 'runs-on', 'managed-by',
];
export const INSTRUCTION_FORMATS = ['R', 'I', 'S', 'B', 'U', 'J'];
export const INSTRUCTION_CATEGORIES = ['算术', '逻辑', '访存', '分支', '跳转', '立即数', '系统'];

const HEX = /^#[0-9a-fA-F]{6}$/;

export function loadSeedData(file = path.resolve('data/seed.json')) {
  const raw = fs.readFileSync(file, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(`seed.json 不是合法 JSON：${error.message}`);
  }
  const errors = validateSeed(data);
  if (errors.length) {
    throw new Error(`seed.json 校验失败（${errors.length} 处）：\n- ${errors.slice(0, 20).join('\n- ')}`);
  }
  return data;
}

export function validateSeed(data) {
  const errors = [];
  const push = (msg) => errors.push(msg);
  if (!data || typeof data !== 'object') return ['根节点必须是对象'];
  for (const key of ['entities', 'relations', 'instructions', 'chapters']) {
    if (!Array.isArray(data[key])) push(`缺少数组 ${key}`);
  }
  if (errors.length) return errors;

  const slugs = new Map();
  data.entities.forEach((entity, index) => {
    const at = `entities[${index}]`;
    for (const field of ['slug', 'type', 'name', 'name_en', 'category', 'layer', 'summary', 'icon', 'accent']) {
      if (typeof entity[field] !== 'string' || !entity[field].trim()) push(`${at}.${field} 缺失`);
    }
    if (!TYPES.includes(entity.type)) push(`${at}.type 非法：${entity.type}`);
    if (entity.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entity.slug)) push(`${at}.slug 需为 kebab-case`);
    if (slugs.has(entity.slug)) push(`${at}.slug 重复：${entity.slug}`);
    slugs.set(entity.slug, entity);
    if (entity.category && CATEGORIES[entity.type] && !CATEGORIES[entity.type].includes(entity.category)) {
      push(`${at}.category 非法：${entity.category}`);
    }
    if (entity.layer && !LAYERS.includes(entity.layer)) push(`${at}.layer 非法：${entity.layer}`);
    if (entity.icon && !ICONS.includes(entity.icon)) push(`${at}.icon 非法：${entity.icon}`);
    if (entity.accent && !HEX.test(entity.accent)) push(`${at}.accent 需为 #RRGGBB`);
    if (!Array.isArray(entity.description) || entity.description.length < 2) push(`${at}.description 至少两段`);
    if (!Array.isArray(entity.specs) || entity.specs.length < 3) push(`${at}.specs 至少三条`);
    if (!Array.isArray(entity.highlights) || entity.highlights.length < 2) push(`${at}.highlights 至少两条`);
    if (!Array.isArray(entity.tags) || entity.tags.length < 2) push(`${at}.tags 至少两个`);
    if (!entity.book || typeof entity.book.chapter !== 'number' || !entity.book.pages) push(`${at}.book 不完整`);
    if (entity.type === 'model') {
      if (!entity.formula) push(`${at}.formula 缺失（model）`);
      if (!Array.isArray(entity.variables) || entity.variables.length < 1) push(`${at}.variables 缺失（model）`);
    }
  });

  const pairs = new Set();
  const touched = new Set();
  data.relations.forEach((relation, index) => {
    const at = `relations[${index}]`;
    if (!slugs.has(relation.source)) push(`${at}.source 不存在：${relation.source}`);
    if (!slugs.has(relation.target)) push(`${at}.target 不存在：${relation.target}`);
    if (relation.source === relation.target) push(`${at} 不能自指`);
    if (!RELATION_KINDS.includes(relation.kind)) push(`${at}.kind 非法：${relation.kind}`);
    if (!relation.label) push(`${at}.label 缺失`);
    const pair = `${relation.source}>${relation.target}`;
    if (pairs.has(pair)) push(`${at} 重复关系：${pair}`);
    pairs.add(pair);
    touched.add(relation.source);
    touched.add(relation.target);
  });
  for (const slug of slugs.keys()) {
    if (!touched.has(slug)) push(`实体 ${slug} 没有任何关系`);
  }

  const mnemonics = new Set();
  data.instructions.forEach((instruction, index) => {
    const at = `instructions[${index}]`;
    for (const field of ['mnemonic', 'name', 'format', 'opcode', 'category', 'description', 'operation', 'example']) {
      if (!instruction[field]) push(`${at}.${field} 缺失`);
    }
    if (!INSTRUCTION_FORMATS.includes(instruction.format)) push(`${at}.format 非法`);
    if (!INSTRUCTION_CATEGORIES.includes(instruction.category)) push(`${at}.category 非法`);
    if (!/^[01]{7}$/.test(instruction.opcode || '')) push(`${at}.opcode 必须 7 位二进制`);
    if (instruction.funct3 != null && !/^[01]{3}$/.test(instruction.funct3)) push(`${at}.funct3 必须 3 位二进制`);
    if (instruction.funct7 != null && !/^[01]{7}$/.test(instruction.funct7)) push(`${at}.funct7 必须 7 位二进制`);
    if (mnemonics.has(instruction.mnemonic)) push(`${at}.mnemonic 重复`);
    mnemonics.add(instruction.mnemonic);
  });
  if (data.instructions.length < 20) push('指令数量少于 20');

  if (data.chapters.length < 7) push('章节少于 7');
  data.chapters.forEach((chapter, index) => {
    const at = `chapters[${index}]`;
    if (typeof chapter.number !== 'number') push(`${at}.number 缺失`);
    if (!chapter.title || !chapter.summary) push(`${at} 标题或摘要缺失`);
    if (!Array.isArray(chapter.sections) || chapter.sections.length < 3) push(`${at}.sections 少于 3`);
    for (const section of chapter.sections || []) {
      for (const slug of section.entities || []) {
        if (!slugs.has(slug)) push(`${at} 小节 ${section.id} 引用了不存在的实体 ${slug}`);
      }
    }
  });

  return errors;
}

export function counts(data) {
  return {
    entities: data.entities.length,
    hardware: data.entities.filter((e) => e.type === 'hardware').length,
    software: data.entities.filter((e) => e.type === 'software').length,
    model: data.entities.filter((e) => e.type === 'model').length,
    relations: data.relations.length,
    instructions: data.instructions.length,
    chapters: data.chapters.length,
  };
}
