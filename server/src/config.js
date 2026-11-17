import path from 'node:path';

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || '127.0.0.1',
  dbPath: process.env.DB_PATH || path.resolve('data/cs-atlas.db'),
  webDist: process.env.WEB_DIST || path.resolve('dist/web'),
  seedPath: process.env.SEED_PATH || path.resolve('data/seed.json'),
};
