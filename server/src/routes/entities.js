import { Router } from 'express';
import { badRequest, notFound } from '../lib/http.js';

const TYPES = new Set(['hardware', 'software', 'model', 'ai']);

export function createEntityRouter(repo) {
  const router = Router();

  router.get('/entities', (req, res) => {
    const { type, q, category } = req.query;
    if (type && !TYPES.has(type)) return badRequest(res, 'type 必须是 hardware、software、model 或 ai');
    const items = repo.listEntities({
      type,
      q: typeof q === 'string' ? q.trim() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
    });
    res.json({ items, total: items.length });
  });

  router.get('/entities/:slug/relations', (req, res) => {
    const entity = repo.getEntity(req.params.slug);
    if (!entity) return notFound(res, `未找到实体 ${req.params.slug}`);
    res.json({ items: repo.relationsOf(entity.slug) });
  });

  router.get('/entities/:slug', (req, res) => {
    const entity = repo.getEntity(req.params.slug);
    if (!entity) return notFound(res, `未找到实体 ${req.params.slug}`);
    res.json({ ...entity, relations: repo.relationsOf(entity.slug) });
  });

  router.get('/graph', (req, res) => {
    res.json(repo.graph());
  });

  router.get('/search', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) return res.json({ entities: [], questions: [], instructions: [] });
    res.json(repo.search(q.slice(0, 80)));
  });

  return router;
}
