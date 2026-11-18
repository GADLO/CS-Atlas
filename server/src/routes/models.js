import { Router } from 'express';

export function createModelRouter(repo) {
  const router = Router();

  router.get('/models', (req, res) => {
    const items = repo.listEntities({ type: 'model' });
    res.json({ items, total: items.length });
  });

  return router;
}
