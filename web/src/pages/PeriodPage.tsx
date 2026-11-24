import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CornerDownRight } from 'lucide-react';
import { useApi } from '../lib/api';
import type { Period, TimelineLane, TimelineNode } from '../lib/types';
import { EntityCard } from '../components/EntityCard';
import { ErrorPanel, LoadingPanel } from '../components/ui';

const laneLabels: Record<TimelineLane, string> = {
  hardware: '硬件',
  software: '软件',
  algorithm: '算法',
};

function NodeRow({ node }: { node: TimelineNode }) {
  return (
    <div className="period-node-row">
      <span>{node.year}</span>
      <span>{node.title}</span>
    </div>
  );
}

export default function PeriodPage() {
  const { slug = '' } = useParams();
  const { data: period, loading, error, refresh } = useApi<Period>(`/periods/${slug}`);

  if (loading) return <div className="page"><LoadingPanel label="正在读取…" /></div>;
  if (error) return <div className="page"><ErrorPanel error={error} onRetry={refresh} /></div>;
  if (!period) return null;

  return (
    <div className="page page--period" style={{ '--period-accent': period.accent } as CSSProperties}>
      <header className="simple-head">
        <h1>{period.name}</h1>
        <span>{period.startYear}–{period.endYear}</span>
      </header>

      <div className="period-page-body">
        <section className="period-page-narrative">
          <h2>叙事</h2>
          {period.narrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {period.transition && (
            <div className="transition-card">
              <CornerDownRight size={15} aria-hidden="true" />
              <div>
                <strong>{period.transition.title}</strong>
                <p>{period.transition.body}</p>
              </div>
            </div>
          )}
        </section>

        <aside className="period-page-aside">
          <h2>节点</h2>
          {(['hardware', 'software', 'algorithm'] as TimelineLane[]).map((lane) => (
            <div className="period-lane" key={lane}>
              <div className="period-lane__head">
                <strong>{laneLabels[lane]}</strong>
                <span>{period.lanes[lane].length}</span>
              </div>
              {period.lanes[lane].map((node) => <NodeRow key={node.slug} node={node} />)}
            </div>
          ))}
        </aside>
      </div>

      {period.machines.length > 0 && (
        <section className="section">
          <h2>机器</h2>
          <div className="entity-grid">
            {period.machines.map((machine) => <EntityCard key={machine.slug} entity={machine} />)}
          </div>
        </section>
      )}

      {period.events.length > 0 && (
        <section className="section">
          <h2>事件</h2>
          <div className="event-list">
            {period.events.map((event) => (
              <article className="event-row" key={event.slug}>
                <div className="event-row__year">{event.year}</div>
                <span className={`lane-dot lane-dot--${event.lane}`} />
                <div className="event-row__body">
                  <h3>{event.title}</h3>
                  <p>{event.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <nav className="pager" aria-label="时期导航">
        {period.prev ? (
          <Link to={`/period/${period.prev.slug}`} className="pager__link">
            <ArrowLeft size={15} />
            <strong>{period.prev.name}</strong>
          </Link>
        ) : <span />}
        {period.next ? (
          <Link to={`/period/${period.next.slug}`} className="pager__link pager__link--next">
            <strong>{period.next.name}</strong>
            <ArrowRight size={15} />
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
