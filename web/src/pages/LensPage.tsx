import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookMarked, FlaskConical, Layers3 } from 'lucide-react';
import { useApi } from '../lib/api';
import type { LensDetail } from '../lib/types';
import { Badge, ErrorPanel, LoadingPanel } from '../components/ui';
import NotFoundPage from './NotFoundPage';

const laneLabels = { hardware: '硬件', software: '软件', algorithm: '算法' };

export default function LensPage() {
  const { slug = '' } = useParams();
  const { data: lens, loading, error, refresh } = useApi<LensDetail>(`/lenses/${slug}`);

  if (loading) return <div className="page"><LoadingPanel label="正在读取章节镜头…" /></div>;
  if (error) return <div className="page"><ErrorPanel error={error} onRetry={refresh} /></div>;
  if (!lens) return <NotFoundPage />;

  return (
    <div className="page page--lens" style={{ '--lens-accent': lens.accent } as CSSProperties}>
      <div className="breadcrumbs">
        <Link to="/lenses">章节镜头</Link>
        <span>/</span>
        <span>CH.{String(lens.number).padStart(2, '0')}</span>
      </div>

      <header className="lens-hero">
        <div className="lens-hero__number">CH.{String(lens.number).padStart(2, '0')}</div>
        <div>
          <div className="eyebrow">
            {lens.group === 'frontier' ? <FlaskConical size={13} /> : <BookMarked size={13} />}
            {lens.group === 'frontier' ? '前沿体系结构 / 实验分支' : '经典体系结构'}
          </div>
          <h1>{lens.title}</h1>
          <div className="lens-hero__en">{lens.titleEn}</div>
          <p className="lens-hero__question">{lens.coreQuestion}</p>
          <p className="lens-hero__summary">{lens.summary}</p>
          <div className="lens-hero__meta">
            <Badge tone="accent">{lens.nodeCount} 个时间节点</Badge>
            <span>从时间主线筛选，不是独立时间线</span>
          </div>
        </div>
      </header>

      <div className="lens-layout">
        <div className="lens-nodes">
          <div className="lens-nodes__head">
            <div className="eyebrow">这条镜头看到的时间节点</div>
            <h2>把这一章放回历史</h2>
          </div>
          {lens.nodes.map((node) => (
            <article className="lens-node" key={node.slug}>
              <div className="lens-node__year">{node.year}</div>
              <div className="lens-node__rail" aria-hidden="true"><span /></div>
              <div className="lens-node__card">
                <div className="lens-node__meta">
                  <Badge tone="neutral">{laneLabels[node.lane]}</Badge>
                  <span>{node.period?.name}</span>
                  {node.frontier && <Badge tone="warn">前沿</Badge>}
                </div>
                <h3>{node.title}</h3>
                <p>{node.body}</p>
                <div className="lens-node__links">
                  {node.entity && (
                    <Link to={`/entity/${node.entity.slug}`}>
                      打开 {node.entity.name} <ArrowRight size={12} />
                    </Link>
                  )}
                  {node.period && (
                    <Link to={`/period/${node.period.slug}`}>
                      进入时期 <ArrowRight size={12} />
                    </Link>
                  )}
                  {node.questionSlugs.map((question) => (
                    <Link key={question} to={`/questions/${question}`}>
                      {question} <ArrowRight size={12} />
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="lens-aside">
          <section className="side-card">
            <div className="eyebrow">镜头说明</div>
            <p>{lens.summary}</p>
          </section>
          <section className="side-card">
            <div className="eyebrow">节点分布</div>
            <div className="lens-lane-counts">
              {(['hardware', 'software', 'algorithm'] as const).map((lane) => (
                <div key={lane}>
                  <span>{laneLabels[lane]}</span>
                  <strong>{lens.nodes.filter((node) => node.lane === lane).length}</strong>
                </div>
              ))}
            </div>
          </section>
          <Link className="back-link" to="/lenses">
            <ArrowLeft size={14} />
            回到十个镜头
          </Link>
        </aside>
      </div>

      <div className="lens-foot">
        <Layers3 size={15} />
        这页没有独立时间数据；节点来自主时间轴，修改主线即可同步更新。
      </div>
    </div>
  );
}
