import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Binary,
  BookMarked,
  Code2,
  Cpu,
  FlaskConical,
  Layers3,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useApi } from '../lib/api';
import type {
  TimelineLane,
  LensSummary,
  Period,
  QuestionSummary,
  TimelineNode,
  TimelineResponse,
} from '../lib/types';
import { Badge, ErrorPanel, LoadingPanel, Spinner, Tag } from '../components/ui';
import { TechDiagram } from '../components/TechDiagram';
import { isSceneKey, sceneMeta } from '../three/sceneKeys';

const ExhibitViewer = lazy(() => import('../components/ExhibitViewer'));

const laneMeta: Record<TimelineLane, { label: string; hint: string; icon: typeof Cpu }> = {
  hardware: { label: '硬件', hint: '器件、机器与系统', icon: Cpu },
  software: { label: '软件', hint: '语言、OS、工具与平台', icon: Code2 },
  algorithm: { label: '算法', hint: '方法、协议与思想', icon: Binary },
};

const generationLabels = ['前电子', '第一代', '第二代', '第三代', '第四代'];

function NodeCard({
  node,
  selected,
  onSelect,
}: {
  node: TimelineNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`time-node ${selected ? 'time-node--active' : ''} ${node.frontier ? 'time-node--frontier' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="time-node__top">
        <span className="time-node__year">{node.year}</span>
        <span className="time-node__gen">{generationLabels[node.generation] ?? `G${node.generation}`}</span>
      </div>
      <strong>{node.title}</strong>
      <p>{node.summary}</p>
      <div className="time-node__tags">
        {node.frontier && <Badge tone="warn">前沿</Badge>}
        {node.entity && <Badge tone="accent">{node.entity.name}</Badge>}
        {node.lensSlugs.slice(0, 2).map((lens) => (
          <span key={lens} className="time-node__lens">
            {lens}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function TimelinePage() {
  const { data, loading, error, refresh } = useApi<TimelineResponse>('/timeline');
  const { data: lensData } = useApi<{ items: LensSummary[] }>('/lenses');
  const { data: questionData } = useApi<{ items: QuestionSummary[] }>('/questions');
  const [periodSlug, setPeriodSlug] = useState<string | null>(null);
  const [nodeSlug, setNodeSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.periods.length) return;
    setPeriodSlug((current) => current ?? data.periods[0].slug);
  }, [data]);

  const period = data?.periods.find((item) => item.slug === periodSlug) ?? data?.periods[0] ?? null;
  const selectedNode = period?.nodes.find((node) => node.slug === nodeSlug) ?? period?.nodes[0] ?? null;
  const sceneKey = selectedNode?.sceneKey && isSceneKey(selectedNode.sceneKey)
    ? selectedNode.sceneKey
    : selectedNode?.entity?.sceneKey && isSceneKey(selectedNode.entity.sceneKey)
      ? selectedNode.entity.sceneKey
      : null;
  const meta = sceneKey ? sceneMeta[sceneKey] : null;
  const lensMap = new Map((lensData?.items ?? []).map((lens) => [lens.slug, lens]));
  const questionMap = new Map((questionData?.items ?? []).map((question) => [question.slug, question]));

  const selectPeriod = (next: Period) => {
    setPeriodSlug(next.slug);
    setNodeSlug(next.nodes[0]?.slug ?? null);
  };

  return (
    <div className="page page--timeline">
      <header className="time-hero">
        <div>
          <div className="eyebrow">
            <Sparkles size={13} aria-hidden="true" /> 时间 / 唯一主线
          </div>
          <h1>一条时间主线，<br /><em>三条泳道</em></h1>
          <p>
            从 1642 年的齿轮到 2026 年的 GPU 集群：硬件、软件与算法在同一段时间里互相推动。
            所有章节镜头、问题、模型与 3D 展品，都挂在这条主线的节点上。
          </p>
          <div className="time-hero__actions">
            <Link to="/lenses" className="button button--primary">
              10 个章节镜头 <ArrowRight size={15} />
            </Link>
            <Link to="/questions" className="button button--ghost">
              七个必答问题 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="time-hero__stats">
          <div><strong>{data?.periods.length ?? 4}</strong><span>时期</span></div>
          <div><strong>{data?.periods.reduce((total, item) => total + item.nodes.length, 0) ?? 78}</strong><span>节点</span></div>
          <div><strong>{lensData?.items.length ?? 10}</strong><span>章节镜头</span></div>
          <div><strong>7</strong><span>问题</span></div>
        </div>
      </header>

      {loading && <LoadingPanel label="正在读取时间主线…" />}
      {error && <ErrorPanel error={error} onRetry={refresh} />}

      {data && period && (
        <>
          <nav className="period-rail" aria-label="时期">
            {data.periods.map((item) => (
              <button
                key={item.slug}
                type="button"
                className={`period-button ${item.slug === period.slug ? 'period-button--active' : ''}`}
                onClick={() => selectPeriod(item)}
                style={{ '--period-accent': item.accent } as React.CSSProperties}
              >
                <span>{item.startYear} — {item.endYear}</span>
                <strong>{item.name}</strong>
                <small>{item.keyIdea}</small>
              </button>
            ))}
          </nav>

          <section className="period-head">
            <div>
              <div className="eyebrow">时期 {period.sortOrder + 1} / 4 · {period.startYear} — {period.endYear}</div>
              <h2>{period.name}</h2>
              <p className="period-head__tagline">{period.tagline}</p>
            </div>
            <div className="period-head__aside">
              <p>{period.narrative.slice(0, 2).join(' ')}</p>
              <Link to={`/period/${period.slug}`} className="text-link">
                时期详情 <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          <div className="time-layout">
            <div className="time-matrix">
              {(['hardware', 'software', 'algorithm'] as TimelineLane[]).map((lane) => {
                const laneInfo = laneMeta[lane];
                const Icon = laneInfo.icon;
                return (
                  <section className="lane-column" key={lane}>
                    <header className="lane-header">
                      <Icon size={16} aria-hidden="true" />
                      <div>
                        <strong>{laneInfo.label}</strong>
                        <span>{laneInfo.hint}</span>
                      </div>
                      <Badge tone="neutral">{period.lanes[lane].length}</Badge>
                    </header>
                    <div className="lane-nodes">
                      {period.lanes[lane].map((node) => (
                        <NodeCard
                          key={node.slug}
                          node={node}
                          selected={selectedNode?.slug === node.slug}
                          onSelect={() => setNodeSlug(node.slug)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <aside className="node-panel" aria-label="节点详情">
              {selectedNode ? (
                <>
                  <div className="node-panel__head">
                    <div>
                      <div className="eyebrow">
                        {selectedNode.year} · {laneMeta[selectedNode.lane].label} · {generationLabels[selectedNode.generation]}
                      </div>
                      <h2>{selectedNode.title}</h2>
                      <p>{selectedNode.summary}</p>
                    </div>
                    {selectedNode.frontier && (
                      <Badge tone="warn">
                        <TriangleAlert size={11} /> 前沿
                      </Badge>
                    )}
                  </div>

                  {sceneKey ? (
                    <Suspense fallback={<div className="node-panel__loading"><Spinner label="装配 3D 展品…" /></div>}>
                      <ExhibitViewer sceneKey={sceneKey} accent={selectedNode.entity?.accent} compact />
                    </Suspense>
                  ) : (
                    <div className="node-panel__static">
                      <TechDiagram
                        accent={selectedNode.entity?.accent ?? period.accent}
                        icon={selectedNode.entity?.icon ?? (selectedNode.lane === 'software' ? 'tool' : selectedNode.lane === 'algorithm' ? 'model' : 'chip')}
                        label={selectedNode.entity?.name ?? selectedNode.title}
                      />
                    </div>
                  )}

                  <div className="node-panel__body">
                    <p>{selectedNode.body}</p>
                    <div className="tag-row">
                      {selectedNode.lensSlugs.map((lensSlug) => {
                        const lens = lensMap.get(lensSlug);
                        return (
                          <Link key={lensSlug} to={`/lenses/${lensSlug}`}>
                            <Tag>{lens?.title ?? lensSlug}</Tag>
                          </Link>
                        );
                      })}
                    </div>
                    {selectedNode.entity && (
                      <Link to={`/entity/${selectedNode.entity.slug}`} className="text-link">
                        打开 {selectedNode.entity.name} <ArrowRight size={14} />
                      </Link>
                    )}
                    {selectedNode.questionSlugs.length > 0 && (
                      <div className="node-panel__questions">
                        <div className="eyebrow">相关问题</div>
                        {selectedNode.questionSlugs.map((questionSlug) => {
                          const question = questionMap.get(questionSlug);
                          return (
                            <Link key={questionSlug} to={`/questions/${questionSlug}`}>
                              Q{question?.number ?? '?'} {question?.shortTitle ?? questionSlug}
                              <ArrowRight size={12} />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    {meta?.caption && <p className="node-panel__caption">{meta.caption}</p>}
                  </div>
                </>
              ) : (
                <p className="muted">选择左侧节点查看详情。</p>
              )}
            </aside>
          </div>

          {period.frontier.length > 0 && (
            <section className="frontier-band">
              <div className="eyebrow">
                <FlaskConical size={13} aria-hidden="true" /> 前沿分支 / 尚未成为主流时期
              </div>
              <div className="frontier-grid">
                {period.frontier.map((node) => (
                  <button
                    type="button"
                    key={node.slug}
                    className={`frontier-card ${selectedNode?.slug === node.slug ? 'frontier-card--active' : ''}`}
                    onClick={() => setNodeSlug(node.slug)}
                  >
                    <span>{node.year} · 实验/未定</span>
                    <strong>{node.title}</strong>
                    <p>{node.summary}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="time-foot">
            <Layers3 size={16} aria-hidden="true" />
            <p>章节镜头、问题与模型都从这条主线筛选节点；它们不是另一套时间线。</p>
            <Link to="/lenses" className="text-link">
              <BookMarked size={14} /> 浏览 10 个镜头
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
