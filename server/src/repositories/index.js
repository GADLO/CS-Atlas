import { createAiRepository } from './ai.js';
import { createAnnotationRepository } from './annotations.js';
import { createContentRepository } from './content.js';
import { createEntityRepository } from './entities.js';
import { createLensRepository } from './lenses.js';
import { createMetaRepository } from './meta.js';
import { createQuestionRepository } from './questions.js';
import { createTargetRepository } from './targets.js';
import { createTimelineRepository } from './timeline.js';

export function createRepository(db) {
  return {
    db,
    ...createMetaRepository(db),
    ...createEntityRepository(db),
    ...createContentRepository(db),
    ...createTimelineRepository(db),
    ...createLensRepository(db),
    ...createQuestionRepository(db),
    ...createAiRepository(db),
    ...createAnnotationRepository(db),
    ...createTargetRepository(db),
  };
}
