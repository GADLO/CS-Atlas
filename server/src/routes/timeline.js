import { Router } from 'express';
import { notFound } from '../lib/http.js';

export function createTimelineRouter(repo) {
  const router = Router();

  router.get('/timeline', (req, res) => {
    res.json(repo.timeline());
  });

  router.get('/periods', (req, res) => {
    res.json({ items: repo.listPeriods() });
  });

  // Compatibility aliases used by existing links.
  router.get('/eras', (req, res) => {
    res.json({ items: repo.listPeriods() });
  });

  router.get('/periods/:slug', (req, res) => {
    const period = repo.getPeriod(req.params.slug);
    if (!period) return notFound(res, `未找到时期 ${req.params.slug}`);
    res.json(period);
  });

  router.get('/eras/:slug', (req, res) => {
    const period = repo.getPeriod(req.params.slug);
    if (!period) return notFound(res, `未找到时期 ${req.params.slug}`);
    res.json(period);
  });

  router.get('/nodes/:slug', (req, res) => {
    const node = repo.getNode(req.params.slug);
    if (!node) return notFound(res, `未找到时间节点 ${req.params.slug}`);
    res.json(node);
  });

  router.get('/events', (req, res) => {
    const lane = typeof req.query.lane === 'string' ? req.query.lane : undefined;
    const periodSlug = typeof req.query.period === 'string' ? req.query.period : undefined;
    res.json({ items: repo.listEvents({ lane, periodSlug }) });
  });

  router.get('/events/:slug', (req, res) => {
    const event = repo.getEvent(req.params.slug);
    if (!event) return notFound(res, `未找到事件 ${req.params.slug}`);
    res.json(event);
  });

  return router;
}
