import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, CornerDownRight } from 'lucide-react';
import { useApi } from '../lib/api';
import type { Period, TimelineLane, TimelineNode } from '../lib/types';
import { EntityCard, entityHref } from '../components/EntityCard';
import { TechDiagram } from '../components/TechDiagram';
import { Badge, ErrorPanel, LoadingPanel, SectionHeader } from '../components/ui';

const laneLabels: Record<TimelineLane, string> = {
  hardware: '硬件',
  software: '软件',
  algorithm: '算法',
};

const laneNumbers: TimelineLane[] = ['hardware', 'software', 'algorithm'];

function NodeRow({ node }: { node: TimelineNode }) {
  return (
    <div className="period-node-row">
      <span className="period-node-row__year">{node.year}</span>
      <span className="period-node-row__lane">{laneLabels[node.lane]}</span>
      <span className="period-node-row__title">{node.title}</span>
    </div>
  );
}

export default function PeriodPage() {
  const { slug = '' } = useParams();
  const { data: period, loading, error, refresh } = useApi<Period>(`/periods/${slug}`);

  if (loading) return <div className="page"><LoadingPanel label="正在读取时期…" /></div>;
  if (error) return <div className="page"><ErrorPanel error={error} onRetry={refresh} /></div>;
  if (!period) return null;

  return (
    <div className="page page--period" style={{ '--period-accent': period.accent } as CSSProperties}>
      <div className="breadcrumbs">
        <Link to="/">时间主线</Link>
        <span>/</span>
        <span>{period.name}</span>
      </div>

      <header className="period-page-hero">
        <div>
          <div className="eyebrow">
            <CalendarDays size={13} aria-hidden="true" /> {period.startYear} — {period.endYear}
          </div>
          <h1>{period.name}</h1>
          <p className="period-page-hero__tagline">{period.tagline}</p>
          <div className="period-page-hero__meta">
            <Badge tone="accent">{period.keyIdea}</Badge>
            <span>{period.nodes.length} 个节点</span>
            <span>{period.machines.length} 台机器</span>
            <span>{period.events.length} 个事件</span>
          </div>
        </div>
        {period.heroMachine && (
          <div className="period-page-hero__visual">
            <TechDiagram
              accent={period.heroMachine.accent}
              icon={period.heroMachine.icon}
              sceneKey={period.heroMachine.sceneKey}
              label={period.heroMachine.name}
            />
          </div>
        )}
      </header>

      <div className="period-page-body">
        <div className="period-page-narrative">
          <div className="eyebrow">时期叙事</div>
          {period.narrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {period.transition && (
            <div className="transition-card">
              <CornerDownRight size={16} aria-hidden="true" />
              <div>
                <strong>{period.transition.title}</strong>
                <p>{period.transition.body}</p>
              </div>
            </div>
          )}
        </div>
        <aside className="period-page-aside">
          <div className="eyebrow">三条泳道</div>
          {laneNumbers.map((lane) => (
            <div className="period-lane" key={lane}>
              <div className="period-lane__head">
                <strong>{laneLabels[lane]}</strong>
                <span>{period.lanes[lane].length}</span>
              </div>
              {period.lanes[lane].map((node) => (
                <NodeRow key={node.slug} node={node} />
              ))}
            </div>
          ))}
        </aside>
      </div>

      <section className="section">
        <SectionHeader eyebrow="机器" title="这个时期的代表机器" body="3D 展品与规格在机器页继续展开。" />
        {period.machines.length > 0 ? (
          <div className="entity-grid">
            {period.machines.map((machine) => (
              <EntityCard key={machine.slug} entity={machine} />
            ))}
          </div>
        ) : (
          <p className="muted">这个时期的计算装置还没有独立实体页；请在时间主线的节点详情中查看机械模型。</p>
        )}
      </section>

      <section className="section">
        <SectionHeader eyebrow="事件" title="时间线上的证据" />
        <div className="event-list">
          {period.events.map((event) => (
            <article className="event-row" key={event.slug}>
              <div className="event-row__year">{event.year}</div>
              <span className={`lane-dot lane-dot--${event.lane}`} />
              <div className="event-row__body">
                <div className="event-row__head">
                  <h3>{event.title}</h3>
                  <Badge tone="neutral">{event.lane}</Badge>
                </div>
                <p>{event.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <nav className="pager" aria-label="时期导航">
        {period.prev ? (
          <Link to={`/period/${period.prev.slug}`} className="pager__link">
            <ArrowLeft size={16} />
            <span><small>上一个时期</small><strong>{period.prev.name}</strong></span>
          </Link>
        ) : <span />}
        {period.next ? (
          <Link to={`/period/${period.next.slug}`} className="pager__link pager__link--next">
            <span><small>下一个时期</small><strong>{period.next.name}</strong></span>
            <ArrowRight size={16} />
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
