import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

const TYPES = new Set(['hardware', 'software', 'model']);

function notFound(res, message) {
  return res.status(404).json({ error: 'NOT_FOUND', message });
}

function badRequest(res, message) {
  return res.status(400).json({ error: 'BAD_REQUEST', message });
}

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

  api.get('/health', (req, res) => {
    res.json({
      ok: true,
      service: 'cs-atlas-api',
      version: '1.0.0',
      storage: 'sqlite',
      time: new Date().toISOString(),
    });
  });

  api.get('/meta', (req, res) => {
    res.json(repo.meta());
  });

  api.get('/stats', (req, res) => {
    res.json(repo.stats());
  });

  api.get('/entities', (req, res) => {
    const { type, q, category } = req.query;
    if (type && !TYPES.has(type)) return badRequest(res, 'type 必须是 hardware、software 或 model');
    const items = repo.listEntities({
      type,
      q: typeof q === 'string' ? q.trim() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
    });
    res.json({ items, total: items.length });
  });

  api.get('/entities/:slug', (req, res) => {
    const entity = repo.getEntity(req.params.slug);
    if (!entity) return notFound(res, `未找到实体 ${req.params.slug}`);
    res.json({ ...entity, relations: repo.relationsOf(entity.slug) });
  });

  api.get('/entities/:slug/relations', (req, res) => {
    const entity = repo.getEntity(req.params.slug);
    if (!entity) return notFound(res, `未找到实体 ${req.params.slug}`);
    res.json({ items: repo.relationsOf(entity.slug) });
  });

  api.get('/graph', (req, res) => {
    res.json(repo.graph());
  });

  api.get('/instructions', (req, res) => {
    const { q, format, category } = req.query;
    const items = repo.listInstructions({
      q: typeof q === 'string' ? q.trim() : undefined,
      format: typeof format === 'string' ? format.trim().toUpperCase() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
    });
    res.json({ items, total: items.length });
  });

  api.get('/instructions/:mnemonic', (req, res) => {
    const instruction = repo.getInstruction(req.params.mnemonic.toLowerCase());
    if (!instruction) return notFound(res, `未找到指令 ${req.params.mnemonic}`);
    res.json(instruction);
  });

  api.get('/chapters', (req, res) => {
    res.json({ items: repo.listChapters() });
  });

  api.get('/search', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) return res.json({ entities: [], instructions: [] });
    res.json(repo.search(q.slice(0, 80)));
  });

  api.get('/annotations', (req, res) => {
    const entitySlug = typeof req.query.entity === 'string' ? req.query.entity.trim() : undefined;
    res.json({ items: repo.listAnnotations({ entitySlug }) });
  });

  api.post('/annotations', (req, res) => {
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

  api.delete('/annotations/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, 'id 非法');
    if (!repo.deleteAnnotation(id)) return notFound(res, '批注不存在');
    res.status(204).end();
  });

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
