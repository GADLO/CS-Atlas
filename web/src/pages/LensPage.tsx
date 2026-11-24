import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApi } from '../lib/api';
import type { LensDetail } from '../lib/types';
import { ErrorPanel, LoadingPanel } from '../components/ui';
import NotFoundPage from './NotFoundPage';

const laneLabels = { hardware: '硬件', software: '软件', algorithm: '算法' };

export default function LensPage() {
  const { slug = '' } = useParams();
  const { data: lens, loading, error, refresh } = useApi<LensDetail>(`/lenses/${slug}`);

  if (loading) return <div className="page"><LoadingPanel label="正在读取…" /></div>;
  if (error) return <div className="page"><ErrorPanel error={error} onRetry={refresh} /></div>;
  if (!lens) return <NotFoundPage />;

  return (
    <div className="page page--lens">
      <header className="simple-head">
        <h1>{lens.title}</h1>
        <span>CH.{String(lens.number).padStart(2, '0')} · {lens.nodeCount} 个节点</span>
      </header>

      <p className="lens-question">{lens.coreQuestion}</p>

      <div className="lens-nodes">
        {lens.nodes.map((node) => (
          <article className="lens-node" key={node.slug}>
            <div className="lens-node__year">{node.year}</div>
            <div className="lens-node__card">
              <div className="lens-node__meta">{laneLabels[node.lane]}</div>
              <h2>{node.title}</h2>
              <p>{node.body}</p>
              <div className="lens-node__links">
                {node.entity && (
                  <Link to={`/entity/${node.entity.slug}`}>
                    {node.entity.name} <ArrowRight size={12} />
                  </Link>
                )}
                {node.period && (
                  <Link to={`/period/${node.period.slug}`}>
                    {node.period.name} <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
