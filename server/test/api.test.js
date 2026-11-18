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
let repo;

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
  repo = createRepository(db);
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
  assert.equal(body.eras, c.eras);
  assert.equal(body.timelineNodes, c.timelineNodes);
  assert.equal(body.lenses, c.lenses);
  assert.equal(body.events, c.events);
  assert.equal(body.questions, c.questions);
  assert.equal(body.aiModules, c.aiModules);
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

  const ai = await get('/api/entities?type=ai');
  assert.equal(ai.body.items.length, counts(data).ai);

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
  assert.ok(body.sceneKey);

  const missing = await get('/api/entities/no-such-entity');
  assert.equal(missing.status, 404);
});

test('GET /api/timeline returns four periods with three lanes', async () => {
  const { status, body } = await get('/api/timeline');
  assert.equal(status, 200);
  assert.equal(body.periods.length, 4);
  const c = counts(data);
  assert.equal(body.periods.reduce((total, period) => total + period.nodes.length, 0), c.timelineNodes);
  for (const period of body.periods) {
    assert.ok(period.narrative.length >= 2);
    assert.ok(period.nodes.length > 0);
    assert.ok(period.lanes.hardware.length > 0);
    assert.ok(period.lanes.software.length > 0);
    assert.ok(period.lanes.algorithm.length > 0);
    assert.ok(period.events.length >= 1);
  }
  const p0 = body.periods.find((period) => period.slug === 'mechanical');
  assert.equal(p0.heroMachine, null);
  const p3 = body.periods.find((period) => period.slug === 'heterogeneous');
  assert.equal(p3.frontier.length, 3);
  assert.ok(p3.frontier.every((node) => node.frontier));
});

test('GET /api/periods/:slug and /api/eras alias return details', async () => {
  const { status, body } = await get('/api/periods/pc-web');
  assert.equal(status, 200);
  assert.equal(body.slug, 'pc-web');
  assert.ok(body.prev);
  assert.ok(body.next);
  assert.ok(body.lanes.hardware.length > 0);
  assert.ok(body.machines.length >= 2);
  const alias = await get('/api/eras/pc-web');
  assert.equal(alias.status, 200);
  assert.equal(alias.body.slug, 'pc-web');
});

test('GET /api/nodes/:slug returns a node with period and entity', async () => {
  const { status, body } = await get('/api/nodes/eniac');
  assert.equal(status, 200);
  assert.equal(body.slug, 'eniac');
  assert.equal(body.periodSlug, 'electronic-early');
  assert.equal(body.entity.slug, 'eniac');
  assert.ok(body.lensSlugs.includes('cpu'));
  assert.ok(body.questionSlugs.includes('program-to-machine'));
  const babbage = await get('/api/nodes/analytical-engine');
  assert.equal(babbage.status, 200);
  assert.equal(babbage.body.sceneKey, 'mechanical-analytical-engine');
  assert.ok(babbage.body.lensSlugs.includes('io'));

  const missing = await get('/api/nodes/no-such-node');
  assert.equal(missing.status, 404);
});

test('GET /api/lenses returns ten lenses and derived nodes', async () => {
  const list = await get('/api/lenses');
  assert.equal(list.status, 200);
  assert.equal(list.body.items.length, 10);
  assert.equal(list.body.items.filter((lens) => lens.group === 'classic').length, 7);
  assert.equal(list.body.items.filter((lens) => lens.group === 'frontier').length, 3);
  assert.ok(list.body.items.every((lens) => lens.nodeCount > 0));

  const memory = await get('/api/lenses/memory');
  assert.equal(memory.status, 200);
  assert.ok(memory.body.nodes.length >= 4);
  assert.ok(memory.body.nodes.every((node) => node.period));
  assert.ok(memory.body.nodes.every((node) => node.lensSlugs.includes('memory')));

  const quantum = await get('/api/lenses/quantum');
  assert.equal(quantum.status, 200);
  assert.ok(quantum.body.nodes.every((node) => node.frontier));
});

test('GET /api/questions and detail', async () => {
  const list = await get('/api/questions');
  assert.equal(list.status, 200);
  assert.equal(list.body.items.length, 7);
  assert.ok(list.body.items.some((question) => question.status === 'published'));

  const published = await get('/api/questions?status=published');
  assert.equal(published.body.items.length, 2);

  const detail = await get('/api/questions/program-to-machine');
  assert.equal(detail.status, 200);
  assert.equal(detail.body.number, 1);
  assert.ok(detail.body.answerSections.length >= 2);
  assert.ok(detail.body.sceneKeys.includes('datapath'));
  assert.ok(detail.body.timelineAnchors.length >= 2);
  assert.ok(detail.body.entities.length > 0);
  assert.ok(detail.body.models.length > 0);
  assert.ok(detail.body.timelineAnchors[0].era);
  assert.ok(detail.body.timelineNodes.length > 0);
  assert.ok(detail.body.timelineNodes.every((node) => node.period));

  const missing = await get('/api/questions/no-such-question');
  assert.equal(missing.status, 404);
});

test('GET /api/ai/modules and detail', async () => {
  const list = await get('/api/ai/modules');
  assert.equal(list.status, 200);
  assert.equal(list.body.items.length, 1);
  const detail = await get('/api/ai/modules/gpu-why-fast');
  assert.equal(detail.status, 200);
  assert.equal(detail.body.calculator, 'roofline');
  assert.ok(detail.body.entities.length >= 2);
});

test('GET /api/models returns principle models', async () => {
  const { status, body } = await get('/api/models');
  assert.equal(status, 200);
  assert.equal(body.total, counts(data).model);
  assert.ok(body.items.every((item) => item.type === 'model'));
});

test('GET /api/graph includes entities and questions', async () => {
  const { status, body } = await get('/api/graph');
  assert.equal(status, 200);
  assert.equal(body.nodes.length, counts(data).entities + counts(data).questions);
  const slugs = new Set(body.nodes.map((node) => node.slug));
  for (const link of body.links) {
    assert.ok(slugs.has(link.source), `missing source ${link.source}`);
    assert.ok(slugs.has(link.target), `missing target ${link.target}`);
  }
  assert.equal(body.nodes.filter((node) => node.kind === 'question').length, counts(data).questions);
});

test('GET /api/instructions and chapters', async () => {
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

  const chapters = await get('/api/chapters');
  assert.equal(chapters.status, 200);
  assert.equal(chapters.body.items.length, counts(data).chapters);
});

test('GET /api/search includes entities, questions and instructions', async () => {
  const { status, body } = await get('/api/search?q=' + encodeURIComponent('性能'));
  assert.equal(status, 200);
  assert.ok(body.entities.length > 0);
  assert.ok(body.questions.length > 0);
  const add = await get('/api/search?q=add');
  assert.ok(add.body.instructions.length > 0);
  const empty = await get('/api/search?q=');
  assert.deepEqual(empty.body, { entities: [], questions: [], instructions: [] });
});

test('annotations lifecycle for entity and question targets', async () => {
  const entityFavorite = await send('/api/annotations', 'POST', {
    targetType: 'entity',
    targetSlug: 'eniac',
    kind: 'favorite',
  });
  assert.equal(entityFavorite.status, 201);
  assert.equal(entityFavorite.body.targetLabel, 'ENIAC');

  const duplicate = await send('/api/annotations', 'POST', {
    targetType: 'entity',
    targetSlug: 'eniac',
    kind: 'favorite',
  });
  assert.equal(duplicate.status, 201);

  const entityNote = await send('/api/annotations', 'POST', {
    targetType: 'entity',
    targetSlug: 'eniac',
    kind: 'note',
    content: '电子管时代的代表。',
  });
  assert.equal(entityNote.status, 201);

  const questionFavorite = await send('/api/annotations', 'POST', {
    targetType: 'question',
    targetSlug: 'program-to-machine',
    kind: 'favorite',
  });
  assert.equal(questionFavorite.status, 201);
  assert.equal(questionFavorite.body.targetLabel, '程序到机器');

  const questionNote = await send('/api/annotations', 'POST', {
    targetType: 'question',
    targetSlug: 'program-to-machine',
    kind: 'note',
    content: '翻译链需要单独讲。',
  });
  assert.equal(questionNote.status, 201);

  const invalid = await send('/api/annotations', 'POST', {
    targetType: 'entity',
    targetSlug: 'nope',
    kind: 'note',
    content: 'x',
  });
  assert.equal(invalid.status, 400);

  const emptyNote = await send('/api/annotations', 'POST', {
    targetType: 'entity',
    targetSlug: 'eniac',
    kind: 'note',
    content: '   ',
  });
  assert.equal(emptyNote.status, 400);

  const list = await get('/api/annotations');
  assert.equal(list.status, 200);
  assert.equal(list.body.items.length, 4);
  const questionList = await get('/api/annotations?targetType=question&targetSlug=program-to-machine');
  assert.equal(questionList.body.items.length, 2);

  for (const item of list.body.items) {
    const removed = await fetch(`${base}/api/annotations/${item.id}`, { method: 'DELETE' });
    assert.equal(removed.status, 204);
  }
  const afterDelete = await get('/api/annotations');
  assert.equal(afterDelete.body.items.length, 0);
});

test('reseed preserves annotations', () => {
  const local = openDatabase(':memory:');
  seedDatabase(local, data);
  const localRepo = createRepository(local);
  localRepo.addAnnotation({
    targetType: 'entity',
    targetSlug: 'eniac',
    targetLabel: 'ENIAC',
    kind: 'note',
    content: '重播种后应该保留。',
  });
  seedDatabase(local, data);
  const annotations = localRepo.listAnnotations();
  assert.equal(annotations.length, 1);
  assert.equal(annotations[0].content, '重播种后应该保留。');
  local.close();
});

test('unknown API returns JSON 404', async () => {
  const { status, body } = await get('/api/does-not-exist');
  assert.equal(status, 404);
  assert.equal(body.error, 'NOT_FOUND');
});
