import type { ExhibitBuild } from './stage';
import type { SceneKey, SceneMode } from './sceneKeys';
import { buildAnalyticalEngine } from './exhibits/analytical-engine';
import { buildDatapath } from './exhibits/datapath';
import { buildEniac } from './exhibits/eniac';
import { buildH100 } from './exhibits/h100';
import { buildHollerith } from './exhibits/hollerith';
import { buildJacquard } from './exhibits/jacquard';
import { buildLeibniz } from './exhibits/leibniz';
import { buildPascal } from './exhibits/pascal';
import { buildMemoryHierarchy } from './exhibits/memory';

export type { SceneKey, SceneMeta, SceneMode } from './sceneKeys';
export { isSceneKey, sceneMeta } from './sceneKeys';

export function buildScene(key: SceneKey, mode: SceneMode = 'single'): ExhibitBuild {
  if (key === 'tube-mainframe') return buildEniac();
  if (key === 'gpu-accelerator') return buildH100();
  if (key === 'datapath') return buildDatapath(mode);
  if (key === 'mechanical-analytical-engine') return buildAnalyticalEngine();
  if (key === 'mechanical-pascal') return buildPascal();
  if (key === 'mechanical-leibniz') return buildLeibniz();
  if (key === 'mechanical-jacquard') return buildJacquard();
  if (key === 'mechanical-hollerith') return buildHollerith();
  return buildMemoryHierarchy();
}
