import { Router } from 'express';

export function createMetaRouter(repo) {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({
      ok: true,
      service: 'cs-atlas-api',
      version: '1.0.0',
      storage: 'sqlite',
      time: new Date().toISOString(),
    });
  });

  router.get('/meta', (req, res) => {
    res.json(repo.meta());
  });

  router.get('/stats', (req, res) => {
    res.json(repo.stats());
  });

  return router;
}
