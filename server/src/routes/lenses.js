import { Router } from 'express';
import { notFound } from '../lib/http.js';

export function createLensRouter(repo) {
  const router = Router();

  router.get('/lenses', (req, res) => {
    res.json({ items: repo.listLenses() });
  });

  router.get('/lenses/:slug', (req, res) => {
    const lens = repo.getLens(req.params.slug);
    if (!lens) return notFound(res, `未找到章节镜头 ${req.params.slug}`);
    res.json(lens);
  });

  return router;
}
