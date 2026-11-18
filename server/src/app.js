import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { badRequest, notFound } from './lib/http.js';
import { createAnnotationRouter } from './routes/annotations.js';
import { createAiRouter } from './routes/ai.js';
import { createContentRouter } from './routes/content.js';
import { createEntityRouter } from './routes/entities.js';
import { createLensRouter } from './routes/lenses.js';
import { createMetaRouter } from './routes/meta.js';
import { createModelRouter } from './routes/models.js';
import { createQuestionRouter } from './routes/questions.js';
import { createTimelineRouter } from './routes/timeline.js';

export function createApp({ repo, webDist = path.resolve('dist/web') } = {}) {
  if (!repo) throw new Error('createApp 需要 repo');
  const app = express();
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '64kb' }));

  const api = express.Router();
  api.use(createMetaRouter(repo));
  api.use(createTimelineRouter(repo));
  api.use(createLensRouter(repo));
  api.use(createQuestionRouter(repo));
  api.use(createAiRouter(repo));
  api.use(createModelRouter(repo));
  api.use(createEntityRouter(repo));
  api.use(createContentRouter(repo));
  api.use(createAnnotationRouter(repo));
  api.use((req, res) => notFound(res, `接口不存在：${req.method} ${req.baseUrl}${req.path}`));

  app.use('/api', api);

  if (fs.existsSync(path.join(webDist, 'index.html'))) {
    app.use(
      express.static(webDist, {
        index: false,
        maxAge: '1h',
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        },
      }),
    );
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.sendFile(path.join(webDist, 'index.html'));
    });
  }

  app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('CS Atlas · 前端尚未构建，请运行 npm run build');
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error('[api]', error);
    if (error.type === 'entity.parse.failed') return badRequest(res, '请求体不是合法 JSON');
    res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' });
  });

  return app;
}
