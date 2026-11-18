import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DB_PATH || path.resolve('data/cs-atlas.db');
const files = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`];
let removed = 0;
for (const file of files) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    removed += 1;
  }
}
console.log(`已重置本地数据库：${dbPath}（删除 ${removed} 个文件）`);
