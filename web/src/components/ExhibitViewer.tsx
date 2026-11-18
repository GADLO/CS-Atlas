import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Vector3 } from 'three';
import { Rotate3d, Sparkles } from 'lucide-react';
import { TechDiagram } from './TechDiagram';
import { createStage, type ExhibitHotspot, type Stage } from '../three/stage';
import { buildScene } from '../three/scenes';
import { sceneMeta, type SceneKey, type SceneMode } from '../three/sceneKeys';

export default function ExhibitViewer({
  sceneKey,
  mode = 'single',
  exploded = 0,
  accent = '#38e1c8',
  className = '',
  compact = false,
  onHotspot,
}: {
  sceneKey: SceneKey;
  mode?: SceneMode;
  exploded?: number;
  accent?: string;
  className?: string;
  compact?: boolean;
  onHotspot?: (hotspot: ExhibitHotspot | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hotspots, setHotspots] = useState<ExhibitHotspot[]>([]);
  const [selected, setSelected] = useState<ExhibitHotspot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setError(null);
    setSelected(null);
    onHotspot?.(null);

    let stage: Stage;
    try {
      const build = buildScene(sceneKey, mode);
      stage = createStage(container, build, { accent });
      stageRef.current = stage;
      setHotspots(build.hotspots);
      build.setExplode?.(exploded);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'WebGL 初始化失败');
      return;
    }

    const positionLabels = () => {
      if (compact) return;
      const width = stage.renderer.domElement.clientWidth;
      const height = stage.renderer.domElement.clientHeight;
      const vector = new Vector3();
      for (const hotspot of stage.build.hotspots) {
        const element = labelRefs.current[hotspot.id];
        if (!element) continue;
        vector.set(...hotspot.position).applyMatrix4(stage.build.group.matrixWorld).project(stage.camera);
        const visible = vector.z > -1 && vector.z < 1;
        element.style.opacity = visible ? '1' : '0';
        element.style.pointerEvents = visible ? 'auto' : 'none';
        element.style.transform = `translate(-50%, -50%) translate(${((vector.x + 1) / 2) * width}px, ${
          ((-vector.y + 1) / 2) * height
        }px)`;
      }
    };

    stage.onFrame = positionLabels;
    positionLabels();

    return () => {
      stage.onFrame = null;
      stage.dispose();
      stageRef.current = null;
      labelRefs.current = {};
    };
    // build is intentionally recreated when the scene or mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, mode, accent]);

  useEffect(() => {
    stageRef.current?.build.setExplode?.(exploded);
  }, [exploded]);

  const selectHotspot = (hotspot: ExhibitHotspot | null) => {
    setSelected(hotspot);
    onHotspot?.(hotspot);
  };

  const meta = sceneMeta[sceneKey];

  if (error) {
    return (
      <div className={`exhibit-frame exhibit-frame--fallback ${className}`}>
        <TechDiagram accent={accent} sceneKey={sceneKey} label={meta.label} />
        <div className="exhibit-error">
          <strong>3D 展品未能启动</strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`exhibit-frame ${className}`} style={{ '--scene-accent': accent } as CSSProperties}>
      <div ref={containerRef} className="exhibit-stage" aria-label={`${meta.label} 3D 展品`} />
      <div className="exhibit-vignette" aria-hidden="true" />
      <div className="exhibit-topline">
        <span className="exhibit-live">
          <Sparkles size={13} aria-hidden="true" />
          实时 3D
        </span>
        <span className="exhibit-hint">
          <Rotate3d size={13} aria-hidden="true" />
          拖拽旋转 · 滚轮缩放
        </span>
      </div>
      <div className={`exhibit-label-layer ${compact ? 'exhibit-label-layer--compact' : ''}`} aria-label="展品热点">
        {hotspots.map((hotspot, index) => (
          <button
            key={hotspot.id}
            ref={(element) => {
              labelRefs.current[hotspot.id] = element;
            }}
            type="button"
            className={`scene-label ${selected?.id === hotspot.id ? 'scene-label--active' : ''}`}
            onClick={() => selectHotspot(selected?.id === hotspot.id ? null : hotspot)}
          >
            <span className="scene-label__index">{String(index + 1).padStart(2, '0')}</span>
            {hotspot.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="exhibit-info">
          <div>
            <div className="eyebrow">热点</div>
            <strong>{selected.label}</strong>
            {selected.detail && <p>{selected.detail}</p>}
          </div>
          <button type="button" className="button button--ghost button--small" onClick={() => selectHotspot(null)}>
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
