import { Router } from 'express';
import { notFound } from '../lib/http.js';

export function createContentRouter(repo) {
  const router = Router();

  router.get('/instructions', (req, res) => {
    const { q, format, category } = req.query;
    const items = repo.listInstructions({
      q: typeof q === 'string' ? q.trim() : undefined,
      format: typeof format === 'string' ? format.trim().toUpperCase() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
    });
    res.json({ items, total: items.length });
  });

  router.get('/instructions/:mnemonic', (req, res) => {
    const instruction = repo.getInstruction(req.params.mnemonic.toLowerCase());
    if (!instruction) return notFound(res, `未找到指令 ${req.params.mnemonic}`);
    res.json(instruction);
  });

  router.get('/chapters', (req, res) => {
    res.json({ items: repo.listChapters() });
  });

  return router;
}
