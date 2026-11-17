import { Router } from 'express';
import { notFound } from '../lib/http.js';

export function createTimelineRouter(repo) {
  const router = Router();

  router.get('/timeline', (req, res) => {
    const lane = typeof req.query.lane === 'string' ? req.query.lane : undefined;
    res.json(repo.timeline({ lane }));
  });

  router.get('/eras', (req, res) => {
    res.json({ items: repo.listEras() });
  });

  router.get('/eras/:slug', (req, res) => {
    const era = repo.getEra(req.params.slug);
    if (!era) return notFound(res, `未找到时代 ${req.params.slug}`);
    res.json(era);
  });

  router.get('/events', (req, res) => {
    const lane = typeof req.query.lane === 'string' ? req.query.lane : undefined;
    const eraSlug = typeof req.query.era === 'string' ? req.query.era : undefined;
    res.json({ items: repo.listEvents({ lane, eraSlug }) });
  });

  router.get('/events/:slug', (req, res) => {
    const event = repo.getEvent(req.params.slug);
    if (!event) return notFound(res, `未找到事件 ${req.params.slug}`);
    res.json(event);
  });

  return router;
}
