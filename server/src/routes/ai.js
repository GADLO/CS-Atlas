import { Router } from 'express';
import { notFound } from '../lib/http.js';

export function createAiRouter(repo) {
  const router = Router();

  router.get('/ai/modules', (req, res) => {
    res.json({ items: repo.listAiModules() });
  });

  router.get('/ai/modules/:slug', (req, res) => {
    const module = repo.getAiModule(req.params.slug);
    if (!module) return notFound(res, `未找到 AI 模块 ${req.params.slug}`);
    res.json(module);
  });

  return router;
}
