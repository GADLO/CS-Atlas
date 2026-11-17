import { config } from './config.js';
import { loadSeedData, counts } from './validation/seed.js';
import { openDatabase } from './db/connection.js';
import { ensureSeed } from './db/seed.js';
import { createRepository } from './repositories/index.js';
import { createApp } from './app.js';

const data = loadSeedData(config.seedPath);
const db = openDatabase(config.dbPath);
const reseeded = ensureSeed(db, data);
const repo = createRepository(db);
const app = createApp({ repo, webDist: config.webDist });

const server = app.listen(config.port, config.host, () => {
  const c = counts(data);
  console.log(`CS Atlas API → http://${config.host}:${config.port}`);
  console.log(`  数据：${c.entities} 实体 / ${c.relations} 关系 / ${c.instructions} 指令 / ${c.chapters} 章节${reseeded ? '（已重新播种）' : ''}`);
  console.log(`  静态资源：${config.webDist}`);
  console.log(`  数据库：${config.dbPath}`);
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
