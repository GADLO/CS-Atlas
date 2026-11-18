import { rowToLens, rowToTimelineNode } from './mappers.js';

function loadLensNodes(db, lensSlug) {
  const rows = db
    .prepare(
      `SELECT n.*, p.name AS period_name, p.start_year AS period_start, p.end_year AS period_end,
              e.slug AS entity_slug, e.name AS entity_name, e.name_en AS entity_name_en,
              e.type AS entity_type, e.category AS entity_category, e.scene_key AS entity_scene_key,
              e.accent AS entity_accent, e.icon AS entity_icon, e.summary AS entity_summary
       FROM timeline_nodes n
       JOIN lens_nodes ln ON ln.node_slug = n.slug
       JOIN eras p ON p.slug = n.period_slug
       LEFT JOIN entities e ON e.slug = n.entity_slug
       WHERE ln.lens_slug = ?
       ORDER BY n.year, n.sort_order`,
    )
    .all(lensSlug);
  return rows.map((row) => {
    const questionSlugs = db
      .prepare('SELECT question_slug FROM question_nodes WHERE node_slug = ? ORDER BY question_slug')
      .all(row.slug)
      .map((item) => item.question_slug);
    const lensSlugs = db
      .prepare('SELECT lens_slug FROM lens_nodes WHERE node_slug = ? ORDER BY lens_slug')
      .all(row.slug)
      .map((item) => item.lens_slug);
    const node = rowToTimelineNode(row, { questionSlugs, lensSlugs });
    return {
      ...node,
      period: {
        slug: row.period_slug,
        name: row.period_name,
        startYear: row.period_start,
        endYear: row.period_end,
      },
    };
  });
}

export function createLensRepository(db) {
  return {
    listLenses() {
      return db
        .prepare(
          `SELECT l.*, COUNT(ln.node_slug) AS node_count
           FROM lenses l
           LEFT JOIN lens_nodes ln ON ln.lens_slug = l.slug
           GROUP BY l.slug
           ORDER BY l.sort_order, l.number`,
        )
        .all()
        .map((row) => ({ ...rowToLens(row), nodeCount: row.node_count }));
    },

    getLens(slug) {
      const row = db
        .prepare(
          `SELECT l.*, COUNT(ln.node_slug) AS node_count
           FROM lenses l
           LEFT JOIN lens_nodes ln ON ln.lens_slug = l.slug
           WHERE l.slug = ?
           GROUP BY l.slug`,
        )
        .get(slug);
      if (!row) return null;
      return {
        ...rowToLens(row),
        nodeCount: row.node_count,
        nodes: loadLensNodes(db, slug),
      };
    },
  };
}
