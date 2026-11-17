export function createMetaRepository(db) {
  return {
    meta() {
      const rows = db.prepare('SELECT key, value FROM meta').all();
      return Object.fromEntries(rows.map((row) => [row.key, row.value]));
    },

    stats() {
      const byType = Object.fromEntries(
        db.prepare('SELECT type, COUNT(*) AS n FROM entities GROUP BY type').all().map((row) => [row.type, row.n]),
      );
      const categories = db
        .prepare('SELECT type, category, COUNT(*) AS n FROM entities GROUP BY type, category ORDER BY type, n DESC')
        .all();
      return {
        entities: db.prepare('SELECT COUNT(*) AS n FROM entities').get().n,
        hardware: byType.hardware || 0,
        software: byType.software || 0,
        model: byType.model || 0,
        relations: db.prepare('SELECT COUNT(*) AS n FROM relations').get().n,
        instructions: db.prepare('SELECT COUNT(*) AS n FROM instructions').get().n,
        chapters: db.prepare('SELECT COUNT(*) AS n FROM chapters').get().n,
        annotations: db.prepare('SELECT COUNT(*) AS n FROM annotations').get().n,
        categories,
      };
    },
  };
}
