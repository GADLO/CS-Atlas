import { Router } from 'express';
import { badRequest, notFound } from '../lib/http.js';

export function createAnnotationRouter(repo) {
  const router = Router();

  router.get('/annotations', (req, res) => {
    const entitySlug = typeof req.query.entity === 'string' ? req.query.entity.trim() : undefined;
    res.json({ items: repo.listAnnotations({ entitySlug }) });
  });

  router.post('/annotations', (req, res) => {
    const { entitySlug, kind, content } = req.body || {};
    if (typeof entitySlug !== 'string' || !repo.getEntity(entitySlug)) {
      return badRequest(res, 'entitySlug 指向的实体不存在');
    }
    if (!['favorite', 'note'].includes(kind)) {
      return badRequest(res, 'kind 必须是 favorite 或 note');
    }
    const text = typeof content === 'string' ? content.trim() : '';
    if (kind === 'note' && (text.length === 0 || text.length > 2000)) {
      return badRequest(res, '笔记内容需为 1–2000 字符');
    }
    const annotation = repo.addAnnotation({ entitySlug, kind, content: text });
    res.status(201).json(annotation);
  });

  router.delete('/annotations/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, 'id 非法');
    if (!repo.deleteAnnotation(id)) return notFound(res, '批注不存在');
    res.status(204).end();
  });

  return router;
}
