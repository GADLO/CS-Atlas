# data

Time-first M1 data foundation.

- `seed.json`: 4 periods, 78 timeline nodes, 10 chapter lenses, 20 entities, 12 events, 7 questions, 1 AI module.
- `cs-atlas.db`: local SQLite runtime state, not committed.

The only factual spine is the timeline:

```text
periods × (hardware | software | algorithm)
```

The ten chapter lenses and seven questions are derived views over timeline nodes. They do not own separate timeline data.

## Commands

```bash
npm run check:data
npm run check:questions
npm run seed
npm run db:reset   # delete local SQLite after schema changes
```

## Schema migrations

Startup applies `server/src/db/migrations/*.sql` and records them in `schema_migrations`. `npm run db:reset` is only a local rebuild fallback.
