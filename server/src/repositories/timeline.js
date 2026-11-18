import { rowToEntity, rowToEra, rowToEvent, rowToTimelineNode } from './mappers.js';

function machineRows(db, periodSlug) {
  return db
    .prepare("SELECT * FROM entities WHERE era_slug = ? AND type = 'hardware' AND scene_key IS NOT NULL ORDER BY year, sort_order")
    .all(periodSlug)
    .map(rowToEntity);
}

function eventRows(db, periodSlug, lane) {
  const where = ['era_slug = ?'];
  const params = [periodSlug];
  if (lane) {
    where.push('lane = ?');
    params.push(lane);
  }
  return db
    .prepare(`SELECT * FROM events WHERE ${where.join(' AND ')} ORDER BY year, id`)
    .all(...params)
    .map(rowToEvent);
}

function nodeRows(db, periodSlug) {
  const rows = db
    .prepare(
      `SELECT n.*,
              e.slug AS entity_slug, e.name AS entity_name, e.name_en AS entity_name_en,
              e.type AS entity_type, e.category AS entity_category, e.scene_key AS entity_scene_key,
              e.accent AS entity_accent, e.icon AS entity_icon, e.summary AS entity_summary
       FROM timeline_nodes n
       LEFT JOIN entities e ON e.slug = n.entity_slug
       WHERE n.period_slug = ?
       ORDER BY n.year, n.lane, n.sort_order`,
    )
    .all(periodSlug);
  return rows.map((row) => {
    const questionSlugs = db
      .prepare('SELECT question_slug FROM question_nodes WHERE node_slug = ? ORDER BY question_slug')
      .all(row.slug)
      .map((item) => item.question_slug);
    const lensSlugs = db
      .prepare('SELECT lens_slug FROM lens_nodes WHERE node_slug = ? ORDER BY lens_slug')
      .all(row.slug)
      .map((item) => item.lens_slug);
    return rowToTimelineNode(row, { questionSlugs, lensSlugs });
  });
}

function groupNodes(nodes) {
  return {
    lanes: {
      hardware: nodes.filter((node) => !node.frontier && node.lane === 'hardware'),
      software: nodes.filter((node) => !node.frontier && node.lane === 'software'),
      algorithm: nodes.filter((node) => !node.frontier && node.lane === 'algorithm'),
    },
    frontier: nodes.filter((node) => node.frontier),
  };
}

function periodPayload(db, era, { includeMachines = true } = {}) {
  const nodes = nodeRows(db, era.slug);
  const grouped = groupNodes(nodes);
  const machines = includeMachines ? machineRows(db, era.slug) : [];
  return {
    ...era,
    heroMachine: machines.find((machine) => machine.slug === era.heroMachine) ?? machines[0] ?? null,
    machines,
    events: eventRows(db, era.slug),
    nodes,
    lanes: grouped.lanes,
    frontier: grouped.frontier,
  };
}

export function createTimelineRepository(db) {
  return {
    listPeriods() {
      return db.prepare('SELECT * FROM eras ORDER BY sort_order').all().map(rowToEra);
    },

    getPeriod(slug) {
      const era = rowToEra(db.prepare('SELECT * FROM eras WHERE slug = ?').get(slug));
      if (!era) return null;
      const payload = periodPayload(db, era);
      const prev = db
        .prepare('SELECT slug, name FROM eras WHERE sort_order < ? ORDER BY sort_order DESC LIMIT 1')
        .get(era.sortOrder);
      const next = db
        .prepare('SELECT slug, name FROM eras WHERE sort_order > ? ORDER BY sort_order LIMIT 1')
        .get(era.sortOrder);
      return { ...payload, prev: prev ?? null, next: next ?? null };
    },

    timeline() {
      const eras = db.prepare('SELECT * FROM eras ORDER BY sort_order').all().map(rowToEra);
      return { periods: eras.map((era) => periodPayload(db, era)) };
    },

    getNode(slug) {
      const row = db
        .prepare(
          `SELECT n.*,
                  e.slug AS entity_slug, e.name AS entity_name, e.name_en AS entity_name_en,
                  e.type AS entity_type, e.category AS entity_category, e.scene_key AS entity_scene_key,
                  e.accent AS entity_accent, e.icon AS entity_icon, e.summary AS entity_summary
           FROM timeline_nodes n
           LEFT JOIN entities e ON e.slug = n.entity_slug
           WHERE n.slug = ?`,
        )
        .get(slug);
      if (!row) return null;
      const questionSlugs = db
        .prepare('SELECT question_slug FROM question_nodes WHERE node_slug = ? ORDER BY question_slug')
        .all(slug)
        .map((item) => item.question_slug);
      const lensSlugs = db
        .prepare('SELECT lens_slug FROM lens_nodes WHERE node_slug = ? ORDER BY lens_slug')
        .all(slug)
        .map((item) => item.lens_slug);
      const node = rowToTimelineNode(row, { questionSlugs, lensSlugs });
      const period = rowToEra(db.prepare('SELECT * FROM eras WHERE slug = ?').get(node.periodSlug));
      return { ...node, period };
    },

    listEvents({ lane, periodSlug } = {}) {
      const where = [];
      const params = [];
      if (lane) {
        where.push('lane = ?');
        params.push(lane);
      }
      if (periodSlug) {
        where.push('era_slug = ?');
        params.push(periodSlug);
      }
      const sql = `SELECT * FROM events ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY year, id`;
      return db.prepare(sql).all(...params).map(rowToEvent);
    },

    getEvent(slug) {
      return rowToEvent(db.prepare('SELECT * FROM events WHERE slug = ?').get(slug));
    },

    // Compatibility aliases for existing consumers.
    listEras() {
      return this.listPeriods();
    },

    getEra(slug) {
      return this.getPeriod(slug);
    },
  };
}
