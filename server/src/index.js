import path from 'node:path';
import { loadSeedData, counts } from './data.js';
import { openDatabase, ensureSeed, createRepository } from './db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '127.0.0.1';
const dbPath = process.env.DB_PATH || path.resolve('data/cs-atlas.db');
const webDist = process.env.WEB_DIST || path.resolve('dist/web');

const data = loadSeedData();
const db = openDatabase(dbPath);
const reseeded = ensureSeed(db, data);
const repo = createRepository(db);
const app = createApp({ repo, webDist });

const server = app.listen(port, host, () => {
  const c = counts(data);
  console.log(`CS Atlas API → http://${host}:${port}`);
  console.log(`  数据：${c.entities} 实体 / ${c.relations} 关系 / ${c.instructions} 指令 / ${c.chapters} 章节${reseeded ? '（已重新播种）' : ''}`);
  console.log(`  静态资源：${webDist}`);
  console.log(`  数据库：${dbPath}`);
});

function shutdown(signal) {
  console.log(`\n收到 ${signal}，正在关闭…`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 3000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
