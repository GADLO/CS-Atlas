import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS_DIR = fileURLToPath(new URL('./migrations', import.meta.url));

export function applyMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
  `);

  const applied = new Set(
    db.prepare('SELECT id FROM schema_migrations ORDER BY id').all().map((row) => row.id),
  );
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();
  const newlyApplied = [];

  for (const file of files) {
    const id = file.replace(/\.sql$/, '');
    if (applied.has(id)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    db.exec('BEGIN');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(id);
      db.exec('COMMIT');
      newlyApplied.push(id);
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error(`Migration failed: ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return newlyApplied;
}
