import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircuitBoard, Cog, Monitor, Smartphone } from 'lucide-react';
import { useApi } from '../lib/api';
import type { Period, TimelineLane, TimelineResponse } from '../lib/types';
import { ErrorPanel, LoadingPanel, Spinner } from '../components/ui';
import { TechDiagram } from '../components/TechDiagram';
import { TimelineChangeLog } from '../components/TimelineChangeLog';
import { isSceneKey } from '../three/sceneKeys';

const ExhibitViewer = lazy(() => import('../components/ExhibitViewer'));

const periodIcons = {
  mechanical: Cog,
  'electronic-early': CircuitBoard,
  'pc-web': Monitor,
  heterogeneous: Smartphone,
} as const;

const laneMeta: Record<TimelineLane, string> = {
  hardware: '硬件',
  software: '软件',
  algorithm: '算法',
};

const lanes: TimelineLane[] = ['hardware', 'software', 'algorithm'];



export default function TimelinePage() {
  const { data, loading, error, refresh } = useApi<TimelineResponse>('/timeline');
  const [periodSlug, setPeriodSlug] = useState<string | null>(null);
  const [nodeSlug, setNodeSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.periods.length) return;
    setPeriodSlug((current) => current ?? data.periods[0].slug);
  }, [data]);

  const period = data?.periods.find((item) => item.slug === periodSlug) ?? data?.periods[0] ?? null;
  const selectedNode = period?.nodes.find((node) => node.slug === nodeSlug) ?? period?.nodes[0] ?? null;
  const total = data?.periods.reduce((sum, item) => sum + item.nodes.length, 0) ?? 0;
  const sceneKey = selectedNode?.sceneKey && isSceneKey(selectedNode.sceneKey)
    ? selectedNode.sceneKey
    : selectedNode?.entity?.sceneKey && isSceneKey(selectedNode.entity.sceneKey)
      ? selectedNode.entity.sceneKey
      : null;


  const selectPeriod = (next: Period) => {
    setPeriodSlug(next.slug);
    setNodeSlug(next.nodes[0]?.slug ?? null);
  };

  const periodItems = data?.periods.map((item) => {
    const Icon = periodIcons[item.slug as keyof typeof periodIcons] ?? Cog;
    return {
      id: item.slug,
      title: item.name,
      description: item.tagline,
      date: `${item.startYear}–${item.endYear}`,
      icon: <Icon size={23} strokeWidth={1.8} aria-hidden="true" />,
      active: item.slug === period?.slug,
      onSelect: () => selectPeriod(item),
    };
  }) ?? [];

  const laneRows = period
    ? lanes.map((lane) => {
        const laneNodes = period.lanes[lane];
        return {
          id: lane,
          label: laneMeta[lane],
          count: laneNodes.length,
          entries: laneNodes.map((node) => ({
            id: node.slug,
            title: node.title,
            description: node.body,
            date: String(node.year),
            active: selectedNode?.slug === node.slug,
            onSelect: () => setNodeSlug(node.slug),
          })),
        };
      })
    : [];


  const detail = selectedNode && period ? (
    <section className="lane-detail">
      <div className="lane-detail__head">
        <div className="lane-detail__meta">
          {selectedNode.year} · {laneMeta[selectedNode.lane]}
        </div>
        <h2>{selectedNode.title}</h2>
      </div>
      <div className="lane-detail__body">
        {sceneKey ? (
          <Suspense fallback={<div className="lane-detail__loading"><Spinner label="装配 3D…" /></div>}>
            <ExhibitViewer sceneKey={sceneKey} accent={selectedNode.entity?.accent} compact />
          </Suspense>
        ) : (
          <div className="lane-detail__static">
            <TechDiagram
              accent={selectedNode.entity?.accent ?? period.accent}
              icon={selectedNode.entity?.icon ?? (selectedNode.lane === 'software' ? 'tool' : selectedNode.lane === 'algorithm' ? 'model' : 'chip')}
              label={selectedNode.entity?.name ?? selectedNode.title}
            />
          </div>
        )}
        <div className="lane-detail__copy">
          <p>{selectedNode.body}</p>
          {selectedNode.entity && (
            <Link to={`/entity/${selectedNode.entity.slug}`} className="text-link">
              {selectedNode.entity.name} <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </section>
  ) : null;

  return (
    <div className="page page--timeline">
      {loading && <LoadingPanel label="正在读取…" />}
      {error && <ErrorPanel error={error} onRetry={refresh} />}

      {data && period && (
        <>
          <header className="timeline-header">
            <h1>时间</h1>
            <span>{data.periods.length} 个时期 · {total} 个节点</span>
          </header>

          <TimelineChangeLog variant="periods" items={periodItems} />

          <div className="period-bar">
            <h2>{period.name}</h2>
            <span>{period.startYear}–{period.endYear}</span>
            <Link to={`/period/${period.slug}`} aria-label="打开时期页">
              时期页 <ArrowRight size={13} />
            </Link>
          </div>

          <TimelineChangeLog variant="lanes" rows={laneRows} detail={detail} />
        </>
      )}
    </div>
  );
}
