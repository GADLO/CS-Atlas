import path from 'node:path';
import { loadSeedData, counts } from './data.js';
import { openDatabase, seedDatabase } from './db.js';

const data = loadSeedData();
const db = openDatabase(process.env.DB_PATH || path.resolve('data/cs-atlas.db'));
seedDatabase(db, data);
const c = counts(data);
console.log(`已重新播种 ${path.resolve(process.env.DB_PATH || 'data/cs-atlas.db')}`);
console.log(`  ${c.entities} 实体（硬件 ${c.hardware} / 软件 ${c.software} / 模型 ${c.model}）`);
console.log(`  ${c.relations} 条关系 · ${c.instructions} 条指令 · ${c.chapters} 个章节`);
db.close();
