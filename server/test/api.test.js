import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { loadSeedData, counts } from '../src/validation/seed.js';
import { openDatabase } from '../src/db/connection.js';
import { seedDatabase } from '../src/db/seed.js';
import { createRepository } from '../src/repositories/index.js';

let server;
let base;
let db;
let data;

const get = async (pathname) => {
  const response = await fetch(base + pathname);
  const body = response.status === 204 ? null : await response.json();
  return { status: response.status, body };
};

const send = async (pathname, method, payload) => {
  const response = await fetch(base + pathname, {
    method,
    headers: { 'content-type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = response.status === 204 ? null : await response.json();
  return { status: response.status, body };
};

before(async () => {
  data = loadSeedData();
  db = openDatabase(':memory:');
  seedDatabase(db, data);
  const repo = createRepository(db);
  const app = createApp({ repo, webDist: '/nonexistent-web-dist' });
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});

test('GET /api/health', async () => {
  const { status, body } = await get('/api/health');
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.storage, 'sqlite');
});

test('GET /api/stats reflects seeded counts', async () => {
  const { status, body } = await get('/api/stats');
  const c = counts(data);
  assert.equal(status, 200);
  assert.equal(body.entities, c.entities);
  assert.equal(body.hardware, c.hardware);
  assert.equal(body.software, c.software);
  assert.equal(body.model, c.model);
  assert.equal(body.relations, c.relations);
  assert.equal(body.instructions, c.instructions);
  assert.equal(body.chapters, c.chapters);
});

test('GET /api/entities filters and validates type', async () => {
  const all = await get('/api/entities');
  assert.equal(all.status, 200);
  assert.equal(all.body.total, counts(data).entities);

  const hardware = await get('/api/entities?type=hardware');
  assert.equal(hardware.body.items.length, counts(data).hardware);
  assert.ok(hardware.body.items.every((item) => item.type === 'hardware'));

  const invalid = await get('/api/entities?type=banana');
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error, 'BAD_REQUEST');

  const filtered = await get('/api/entities?type=hardware&category=' + encodeURIComponent('存储'));
  assert.ok(filtered.body.items.length > 0);
  assert.ok(filtered.body.items.every((item) => item.category === '存储'));
});

test('GET /api/entities/:slug returns detail with relations', async () => {
  const target = data.entities.find((entity) => entity.type === 'hardware');
  const { status, body } = await get(`/api/entities/${target.slug}`);
  assert.equal(status, 200);
  assert.equal(body.slug, target.slug);
  assert.ok(Array.isArray(body.relations));
  assert.ok(body.relations.length > 0);
  assert.ok(body.description.length >= 2);
  assert.ok(body.specs.length >= 3);

  const missing = await get('/api/entities/no-such-entity');
  assert.equal(missing.status, 404);
});

test('GET /api/graph is consistent', async () => {
  const { status, body } = await get('/api/graph');
  assert.equal(status, 200);
  assert.equal(body.nodes.length, counts(data).entities);
  assert.equal(body.links.length, counts(data).relations);
  const slugs = new Set(body.nodes.map((node) => node.slug));
  for (const link of body.links) {
    assert.ok(slugs.has(link.source), `missing source ${link.source}`);
    assert.ok(slugs.has(link.target), `missing target ${link.target}`);
  }
});

test('GET /api/instructions and detail', async () => {
  const list = await get('/api/instructions');
  assert.equal(list.status, 200);
  assert.equal(list.body.items.length, counts(data).instructions);

  const rType = await get('/api/instructions?format=R');
  assert.ok(rType.body.items.length > 0);
  assert.ok(rType.body.items.every((item) => item.format === 'R'));

  const add = await get('/api/instructions/add');
  assert.equal(add.status, 200);
  assert.equal(add.body.opcode, '0110011');
  assert.equal(add.body.funct3, '000');
  assert.equal(add.body.funct7, '0000000');

  const missing = await get('/api/instructions/nope');
  assert.equal(missing.status, 404);
});

test('GET /api/search finds entities and instructions', async () => {
  const { status, body } = await get('/api/search?q=' + encodeURIComponent('流水线'));
  assert.equal(status, 200);
  assert.ok(body.entities.length > 0);
  const empty = await get('/api/search?q=');
  assert.deepEqual(empty.body, { entities: [], instructions: [] });
});

test('GET /api/chapters returns chapter tree', async () => {
  const { status, body } = await get('/api/chapters');
  assert.equal(status, 200);
  assert.equal(body.items.length, counts(data).chapters);
  assert.ok(body.items[0].sections.length >= 3);
});

test('annotations lifecycle (favorite + note)', async () => {
  const slug = data.entities[0].slug;
  const favorite = await send('/api/annotations', 'POST', { entitySlug: slug, kind: 'favorite' });
  assert.equal(favorite.status, 201);
  const duplicate = await send('/api/annotations', 'POST', { entitySlug: slug, kind: 'favorite' });
  assert.equal(duplicate.status, 201);

  const note = await send('/api/annotations', 'POST', { entitySlug: slug, kind: 'note', content: '流水线的关键在冒险处理。' });
  assert.equal(note.status, 201);

  const invalid = await send('/api/annotations', 'POST', { entitySlug: 'nope', kind: 'note', content: 'x' });
  assert.equal(invalid.status, 400);
  const emptyNote = await send('/api/annotations', 'POST', { entitySlug: slug, kind: 'note', content: '   ' });
  assert.equal(emptyNote.status, 400);

  const list = await get('/api/annotations');
  assert.equal(list.status, 200);
  assert.equal(list.body.items.length, 2);
  const favorites = list.body.items.filter((item) => item.kind === 'favorite');
  assert.equal(favorites.length, 1);

  for (const item of list.body.items) {
    const removed = await fetch(`${base}/api/annotations/${item.id}`, { method: 'DELETE' });
    assert.equal(removed.status, 204);
  }
  const afterDelete = await get('/api/annotations');
  assert.equal(afterDelete.body.items.length, 0);
});

test('unknown API returns JSON 404', async () => {
  const { status, body } = await get('/api/does-not-exist');
  assert.equal(status, 404);
  assert.equal(body.error, 'NOT_FOUND');
});
