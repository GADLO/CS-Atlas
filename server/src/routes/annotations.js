import { Router } from 'express';
import { badRequest, notFound } from '../lib/http.js';

const TARGET_TYPES = new Set(['entity', 'question', 'ai_module', 'era']);

export function createAnnotationRouter(repo) {
  const router = Router();

  router.get('/annotations', (req, res) => {
    const targetType = typeof req.query.targetType === 'string' ? req.query.targetType.trim() : undefined;
    const targetSlug = typeof req.query.targetSlug === 'string' ? req.query.targetSlug.trim() : undefined;
    if (targetType && !TARGET_TYPES.has(targetType)) return badRequest(res, 'targetType 非法');
    res.json({ items: repo.listAnnotations({ targetType, targetSlug }) });
  });

  router.post('/annotations', (req, res) => {
    const { targetType, targetSlug, kind, content } = req.body || {};
    if (!TARGET_TYPES.has(targetType)) return badRequest(res, 'targetType 必须是 entity、question、ai_module 或 era');
    if (typeof targetSlug !== 'string' || !targetSlug.trim()) return badRequest(res, 'targetSlug 缺失');
    const target = repo.resolveTarget(targetType, targetSlug.trim());
    if (!target) return badRequest(res, '目标不存在');
    if (!['favorite', 'note'].includes(kind)) return badRequest(res, 'kind 必须是 favorite 或 note');
    const text = typeof content === 'string' ? content.trim() : '';
    if (kind === 'note' && (text.length === 0 || text.length > 2000)) {
      return badRequest(res, '笔记内容需为 1–2000 字符');
    }
    const annotation = repo.addAnnotation({
      targetType,
      targetSlug: target.targetSlug,
      targetLabel: target.targetLabel,
      kind,
      content: text,
    });
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
