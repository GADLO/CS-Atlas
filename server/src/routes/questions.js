import { Router } from 'express';
import { notFound } from '../lib/http.js';

export function createQuestionRouter(repo) {
  const router = Router();

  router.get('/questions', (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json({ items: repo.listQuestions({ status }) });
  });

  router.get('/questions/:slug', (req, res) => {
    const question = repo.getQuestion(req.params.slug);
    if (!question) return notFound(res, `未找到问题 ${req.params.slug}`);
    res.json(question);
  });

  return router;
}
