import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { openDatabase } from '../src/db/connection.js';
import { applyMigrations } from '../src/db/migrations.js';

const initialMigration = fs.readFileSync(
  fileURLToPath(new URL('../src/db/migrations/001_initial.sql', import.meta.url)),
  'utf8',
);

test('migrations bootstrap an empty database once', () => {
  const db = openDatabase(':memory:');
  const tables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name),
  );
  assert.ok(tables.has('timeline_nodes'));
  assert.ok(tables.has('lenses'));
  assert.ok(tables.has('lens_nodes'));
  assert.ok(tables.has('question_nodes'));

  const applied = db.prepare('SELECT id FROM schema_migrations ORDER BY id').all().map((row) => row.id);
  assert.deepEqual(applied, ['001_initial', '002_time_first']);
  assert.deepEqual(applyMigrations(db), []);
  db.close();
});

test('migrations upgrade a legacy database without deleting annotations', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-atlas-migrations-'));
  const dbPath = path.join(directory, 'legacy.db');
  const legacy = new DatabaseSync(dbPath);
  legacy.exec('PRAGMA foreign_keys = ON;');
  legacy.exec(initialMigration);
  legacy.prepare(`
    INSERT INTO annotations (target_type, target_slug, target_label, kind, content)
    VALUES ('entity', 'eniac', 'ENIAC', 'note', 'legacy note')
  `).run();
  legacy.close();

  const db = openDatabase(dbPath);
  const tables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name),
  );
  assert.ok(tables.has('timeline_nodes'));
  assert.ok(tables.has('lenses'));
  assert.equal(
    db.prepare('SELECT content FROM annotations WHERE target_slug = ?').get('eniac').content,
    'legacy note',
  );
  assert.deepEqual(
    db.prepare('SELECT id FROM schema_migrations ORDER BY id').all().map((row) => row.id),
    ['001_initial', '002_time_first'],
  );
  db.close();

  // Opening the same database again must not replay migrations.
  const reopened = openDatabase(dbPath);
  assert.deepEqual(applyMigrations(reopened), []);
  reopened.close();
  fs.rmSync(directory, { recursive: true, force: true });
});
