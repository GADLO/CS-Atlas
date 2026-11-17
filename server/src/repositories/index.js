import { createAnnotationRepository } from './annotations.js';
import { createContentRepository } from './content.js';
import { createEntityRepository } from './entities.js';
import { createMetaRepository } from './meta.js';

export function createRepository(db) {
  return {
    db,
    ...createMetaRepository(db),
    ...createEntityRepository(db),
    ...createContentRepository(db),
    ...createAnnotationRepository(db),
  };
}
