import { config } from './config.js';
import { loadSeedData, counts } from './validation/seed.js';
import { openDatabase } from './db/connection.js';
import { seedDatabase } from './db/seed.js';

const data = loadSeedData(config.seedPath);
const db = openDatabase(config.dbPath);
seedDatabase(db, data);
const c = counts(data);
console.log(`已重新播种 ${config.dbPath}`);
console.log(`  ${c.entities} 实体（硬件 ${c.hardware} / 软件 ${c.software} / 模型 ${c.model}）`);
console.log(`  ${c.relations} 条关系 · ${c.instructions} 条指令 · ${c.chapters} 个章节`);
db.close();
