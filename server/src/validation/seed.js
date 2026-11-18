import fs from 'node:fs';
import path from 'node:path';

export const TYPES = ['hardware', 'software', 'model', 'ai'];
export const CATEGORIES = {
  hardware: ['计算', '存储', '互连', '输入输出', '供电散热', '封装基板'],
  software: ['指令集', '工具链', '系统软件', '应用与基准'],
  model: ['性能模型', '存储模型', '并行模型', '数据表示'],
  ai: ['AI 概念', 'AI 硬件', 'AI 系统'],
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
export const SCENE_KEYS = [
  'tube-mainframe', 'mainframe', 'supercomputer', 'desktop', 'mobile-soc',
  'rack-server', 'gpu-accelerator', 'chiplet-package', 'datapath', 'memory-hierarchy',
  'mechanical-analytical-engine', 'mechanical-pascal', 'mechanical-leibniz', 'mechanical-jacquard', 'mechanical-hollerith',
];
export const RELATION_KINDS = [
  'contains', 'uses', 'implements', 'depends', 'measures', 'accelerates',
  'stores', 'connects', 'runs-on', 'managed-by', 'influences',
];
export const INSTRUCTION_FORMATS = ['R', 'I', 'S', 'B', 'U', 'J'];
export const INSTRUCTION_CATEGORIES = ['算术', '逻辑', '访存', '分支', '跳转', '立即数', '系统'];
export const QUESTION_STATUS = ['planned', 'drafted', 'reviewed', 'published'];

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
  for (const key of ['eras', 'entities', 'events', 'questions', 'aiModules', 'lenses', 'timelineNodes', 'relations', 'instructions', 'chapters']) {
    if (!Array.isArray(data[key])) push(`缺少数组 ${key}`);
  }
  if (errors.length) return errors;

  const eraSlugs = new Map();
  data.eras.forEach((era, index) => {
    const at = `eras[${index}]`;
    for (const field of ['slug', 'name', 'tagline', 'keyIdea', 'accent']) {
      if (typeof era[field] !== 'string' || !era[field].trim()) push(`${at}.${field} 缺失`);
    }
    if (!Number.isInteger(era.startYear) || !Number.isInteger(era.endYear)) push(`${at} 年份必须为整数`);
    if (era.startYear > era.endYear) push(`${at} 起始年份晚于结束年份`);
    if (!Array.isArray(era.narrative) || era.narrative.length < 2) push(`${at}.narrative 至少两段`);
    if (era.accent && !HEX.test(era.accent)) push(`${at}.accent 需为 #RRGGBB`);
    if (eraSlugs.has(era.slug)) push(`${at}.slug 重复：${era.slug}`);
    eraSlugs.set(era.slug, era);
  });

  if (data.eras.length !== 4) push('eras 必须正好 4 条（四个时期）');

  const lensSlugs = new Map();
  data.lenses.forEach((lens, index) => {
    const at = `lenses[${index}]`;
    for (const field of ['slug', 'title', 'titleEn', 'group', 'coreQuestion', 'summary', 'accent']) {
      if (typeof lens[field] !== 'string' || !lens[field].trim()) push(`${at}.${field} 缺失`);
    }
    if (!Number.isInteger(lens.number) || lens.number < 1 || lens.number > 10) push(`${at}.number 必须为 1–10`);
    if (!['classic', 'frontier'].includes(lens.group)) push(`${at}.group 非法`);
    if (lens.accent && !HEX.test(lens.accent)) push(`${at}.accent 需为 #RRGGBB`);
    if (lensSlugs.has(lens.slug)) push(`${at}.slug 重复：${lens.slug}`);
    lensSlugs.set(lens.slug, lens);
  });
  if (data.lenses.length !== 10) push('lenses 必须正好 10 条');

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
    if (entity.eraSlug && !eraSlugs.has(entity.eraSlug)) push(`${at}.eraSlug 不存在：${entity.eraSlug}`);
    if (entity.sceneKey && !SCENE_KEYS.includes(entity.sceneKey)) push(`${at}.sceneKey 非法：${entity.sceneKey}`);
    if (!Array.isArray(entity.description) || entity.description.length < 2) push(`${at}.description 至少两段`);
    if (!Array.isArray(entity.specs) || entity.specs.length < 3) push(`${at}.specs 至少三条`);
    if (!Array.isArray(entity.highlights) || entity.highlights.length < 2) push(`${at}.highlights 至少两条`);
    if (!Array.isArray(entity.tags) || entity.tags.length < 2) push(`${at}.tags 至少两个`);
    if (!entity.book || typeof entity.book.chapter !== 'number' || !entity.book.pages) push(`${at}.book 不完整`);
    if (!Array.isArray(entity.sources) || entity.sources.length < 1) push(`${at}.sources 至少一条`);
    if (entity.type === 'hardware' && (!Array.isArray(entity.significance) || entity.significance.length < 2)) {
      push(`${at}.significance 至少两条（hardware）`);
    }
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

  const eventSlugs = new Set();
  data.events.forEach((event, index) => {
    const at = `events[${index}]`;
    for (const field of ['slug', 'lane', 'title', 'summary']) {
      if (!event[field]) push(`${at}.${field} 缺失`);
    }
    if (eventSlugs.has(event.slug)) push(`${at}.slug 重复：${event.slug}`);
    eventSlugs.add(event.slug);
    if (!['hardware', 'software', 'ai', 'idea'].includes(event.lane)) push(`${at}.lane 非法`);
    if (!Number.isInteger(event.year)) push(`${at}.year 必须为整数`);
    if (event.eraSlug && !eraSlugs.has(event.eraSlug)) push(`${at}.eraSlug 不存在`);
    for (const slug of event.entitySlugs ?? []) {
      if (!slugs.has(slug)) push(`${at} 实体不存在：${slug}`);
    }
    if (!Array.isArray(event.sources) || event.sources.length < 1) push(`${at}.sources 至少一条`);
  });

  const aiSlugs = new Set();
  data.aiModules.forEach((module, index) => {
    const at = `aiModules[${index}]`;
    for (const field of ['slug', 'title', 'level', 'summary']) {
      if (!module[field]) push(`${at}.${field} 缺失`);
    }
    if (aiSlugs.has(module.slug)) push(`${at}.slug 重复：${module.slug}`);
    aiSlugs.add(module.slug);
    if (!Array.isArray(module.sections) || module.sections.length < 1) push(`${at}.sections 至少一节`);
    for (const slug of module.entitySlugs ?? []) {
      if (!slugs.has(slug)) push(`${at} 实体不存在：${slug}`);
    }
  });

  const questionNumbers = new Set();
  const questionSlugs = new Set();
  data.questions.forEach((question, index) => {
    const at = `questions[${index}]`;
    for (const field of ['slug', 'title', 'shortTitle', 'question', 'oneLineAnswer', 'summary', 'status']) {
      if (!question[field]) push(`${at}.${field} 缺失`);
    }
    if (!Number.isInteger(question.number) || question.number < 1 || question.number > 7) {
      push(`${at}.number 必须为 1–7`);
    }
    if (questionNumbers.has(question.number)) push(`${at}.number 重复`);
    questionNumbers.add(question.number);
    if (questionSlugs.has(question.slug)) push(`${at}.slug 重复`);
    questionSlugs.add(question.slug);
    if (!QUESTION_STATUS.includes(question.status)) push(`${at}.status 非法`);
    if (!Array.isArray(question.answerSections) || question.answerSections.length < 1) push(`${at}.answerSections 至少一段`);
    for (const slug of question.entitySlugs ?? []) {
      if (!slugs.has(slug)) push(`${at} 实体不存在：${slug}`);
    }
    for (const slug of question.modelSlugs ?? []) {
      if (!slugs.has(slug)) push(`${at} 模型不存在：${slug}`);
    }
    for (const slug of question.aiModuleSlugs ?? []) {
      if (!aiSlugs.has(slug)) push(`${at} AI 模块不存在：${slug}`);
    }
    for (const anchor of question.timelineAnchors ?? []) {
      if (anchor.eraSlug && !eraSlugs.has(anchor.eraSlug)) push(`${at} 时代锚点不存在：${anchor.eraSlug}`);
      if (anchor.machineSlug && !slugs.has(anchor.machineSlug)) push(`${at} 机器锚点不存在：${anchor.machineSlug}`);
      if (anchor.eventSlug && !eventSlugs.has(anchor.eventSlug)) push(`${at} 事件锚点不存在：${anchor.eventSlug}`);
    }
    for (const key of question.sceneKeys ?? []) {
      if (!SCENE_KEYS.includes(key)) push(`${at} 展品不存在：${key}`);
    }
    if (question.status === 'published') {
      if ((question.answerSections ?? []).length < 2) push(`${at} published 需要至少两段答案`);
      if ((question.timelineAnchors ?? []).length < 2) push(`${at} published 需要至少两个时间线锚点`);
      if (!(question.sceneKeys ?? []).length && !question.calculator && !question.interaction) {
        push(`${at} published 需要 3D/计算器/交互`);
      }
      if ((question.quiz ?? []).length < 3) push(`${at} published 需要三道自测`);
      if ((question.sources ?? []).length < 3) push(`${at} published 需要三条来源`);
    }
  });
  if (data.questions.length !== 7) push('questions 必须正好 7 条');

  const nodeSlugs = new Set();
  data.timelineNodes.forEach((node, index) => {
    const at = `timelineNodes[${index}]`;
    for (const field of ['slug', 'periodSlug', 'lane', 'title', 'summary', 'body']) {
      if (typeof node[field] !== 'string' || !node[field].trim()) push(`${at}.${field} 缺失`);
    }
    if (nodeSlugs.has(node.slug)) push(`${at}.slug 重复：${node.slug}`);
    nodeSlugs.add(node.slug);
    if (!eraSlugs.has(node.periodSlug)) push(`${at}.periodSlug 不存在：${node.periodSlug}`);
    if (!['hardware', 'software', 'algorithm'].includes(node.lane)) push(`${at}.lane 非法`);
    if (!Number.isInteger(node.year)) push(`${at}.year 必须为整数`);
    if (!Number.isInteger(node.generation) || node.generation < 0 || node.generation > 4) push(`${at}.generation 必须为 0–4`);
    if (node.entitySlug && !slugs.has(node.entitySlug)) push(`${at}.entitySlug 不存在：${node.entitySlug}`);
    if (node.sceneKey && !SCENE_KEYS.includes(node.sceneKey)) push(`${at}.sceneKey 非法：${node.sceneKey}`);
    for (const lensSlug of node.lensSlugs ?? []) {
      if (!lensSlugs.has(lensSlug)) push(`${at}.lensSlugs 不存在：${lensSlug}`);
    }
    for (const questionSlug of node.questionSlugs ?? []) {
      if (!questionSlugs.has(questionSlug)) push(`${at}.questionSlugs 不存在：${questionSlug}`);
    }
    for (const modelSlug of node.modelSlugs ?? []) {
      if (!slugs.has(modelSlug)) push(`${at}.modelSlugs 不存在：${modelSlug}`);
    }
    for (const moduleSlug of node.aiModuleSlugs ?? []) {
      if (!aiSlugs.has(moduleSlug)) push(`${at}.aiModuleSlugs 不存在：${moduleSlug}`);
    }
    if (!Array.isArray(node.sources) || node.sources.length < 1) push(`${at}.sources 至少一条`);
    if (typeof node.frontier !== 'boolean') push(`${at}.frontier 必须为布尔值`);
  });
  for (const lens of data.lenses) {
    if (!data.timelineNodes.some((node) => (node.lensSlugs ?? []).includes(lens.slug))) {
      push(`lens ${lens.slug} 没有任何节点`);
    }
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
    ai: data.entities.filter((e) => e.type === 'ai').length,
    relations: data.relations.length,
    eras: data.eras.length,
    timelineNodes: data.timelineNodes.length,
    lenses: data.lenses.length,
    events: data.events.length,
    questions: data.questions.length,
    aiModules: data.aiModules.length,
    instructions: data.instructions.length,
    chapters: data.chapters.length,
  };
}
