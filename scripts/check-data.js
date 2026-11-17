import { loadSeedData, counts, validateSeed } from '../server/src/validation/seed.js';
import fs from 'node:fs';

const file = process.argv[2] || 'data/seed.json';
if (!fs.existsSync(file)) {
  console.error(`未找到 ${file}`);
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = validateSeed(raw);
if (errors.length) {
  console.error(`✗ ${errors.length} 处问题：`);
  for (const error of errors.slice(0, 50)) console.error(' -', error);
  process.exit(1);
}
const data = loadSeedData(file);
const c = counts(data);
console.log('✓ seed.json 校验通过');
console.log(`  实体 ${c.entities}（硬件 ${c.hardware} / 软件 ${c.software} / 模型 ${c.model} / AI ${c.ai}）`);
console.log(`  时代 ${c.eras} · 事件 ${c.events} · 问题 ${c.questions} · AI 模块 ${c.aiModules}`);
console.log(`  关系 ${c.relations} · 指令 ${c.instructions} · 章节 ${c.chapters}`);
const byChapter = new Map();
for (const entity of data.entities) {
  const chapter = entity.book?.chapter ?? '未标注';
  byChapter.set(chapter, (byChapter.get(chapter) || 0) + 1);
}
console.log('  按章节分布：', [...byChapter.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))).map(([k, v]) => `${k === 0 ? '附录A' : `第${k}章`}:${v}`).join(' '));
