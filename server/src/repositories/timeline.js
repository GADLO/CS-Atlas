import { rowToEntity, rowToEra, rowToEvent } from './mappers.js';

function machinesOf(db, eraSlug) {
  return db
    .prepare("SELECT * FROM entities WHERE era_slug = ? AND type = 'hardware' AND scene_key IS NOT NULL ORDER BY year, sort_order")
    .all(eraSlug)
    .map(rowToEntity);
}

function eventsOf(db, eraSlug, lane) {
  const where = ['era_slug = ?'];
  const params = [eraSlug];
  if (lane) {
    where.push('lane = ?');
    params.push(lane);
  }
  return db
    .prepare(`SELECT * FROM events WHERE ${where.join(' AND ')} ORDER BY year, id`)
    .all(...params)
    .map(rowToEvent);
}

export function createTimelineRepository(db) {
  return {
    listEras() {
      return db.prepare('SELECT * FROM eras ORDER BY sort_order').all().map(rowToEra);
    },

    getEra(slug) {
      const era = rowToEra(db.prepare('SELECT * FROM eras WHERE slug = ?').get(slug));
      if (!era) return null;
      const machines = machinesOf(db, slug);
      const events = eventsOf(db, slug);
      const prev = db
        .prepare('SELECT slug, name FROM eras WHERE sort_order < ? ORDER BY sort_order DESC LIMIT 1')
        .get(era.sortOrder);
      const next = db
        .prepare('SELECT slug, name FROM eras WHERE sort_order > ? ORDER BY sort_order LIMIT 1')
        .get(era.sortOrder);
      return {
        ...era,
        heroMachine: machines.find((machine) => machine.slug === era.heroMachine) ?? machines[0] ?? null,
        machines,
        events,
        prev: prev ?? null,
        next: next ?? null,
      };
    },

    timeline({ lane } = {}) {
      const eras = db.prepare('SELECT * FROM eras ORDER BY sort_order').all().map(rowToEra);
      return {
        eras: eras.map((era) => {
          const machines = machinesOf(db, era.slug);
          return {
            ...era,
            heroMachine: machines.find((machine) => machine.slug === era.heroMachine) ?? machines[0] ?? null,
            machines,
            events: eventsOf(db, era.slug, lane),
          };
        }),
      };
    },

    listEvents({ lane, eraSlug } = {}) {
      const where = [];
      const params = [];
      if (lane) {
        where.push('lane = ?');
        params.push(lane);
      }
      if (eraSlug) {
        where.push('era_slug = ?');
        params.push(eraSlug);
      }
      const sql = `SELECT * FROM events ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY year, id`;
      return db.prepare(sql).all(...params).map(rowToEvent);
    },

    getEvent(slug) {
      return rowToEvent(db.prepare('SELECT * FROM events WHERE slug = ?').get(slug));
    },
  };
}
