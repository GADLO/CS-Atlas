import { lazy, Suspense, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Expand,
  Link2,
  Sparkles,
} from 'lucide-react';
import { useApi } from '../lib/api';
import type { Entity, Era } from '../lib/types';
import { AnnotationPanel } from '../components/AnnotationPanel';
import { CalculatorPanel } from '../components/CalculatorPanel';
import { entityHref } from '../components/EntityCard';
import { TechDiagram } from '../components/TechDiagram';
import { Badge, ErrorPanel, LoadingPanel, SectionHeader, Spinner, Tag } from '../components/ui';
import { isSceneKey, sceneMeta } from '../three/sceneKeys';

const ExhibitViewer = lazy(() => import('../components/ExhibitViewer'));

const typeLabels: Record<string, string> = {
  hardware: '硬件',
  software: '软件',
  model: '模型',
  ai: 'AI',
};

export default function EntityPage() {
  const { slug = '' } = useParams();
  const { data: entity, loading, error, refresh } = useApi<Entity>(`/entities/${slug}`);
  const { data: era } = useApi<Era>(entity?.eraSlug ? `/periods/${entity.eraSlug}` : null);
  const [exploded, setExploded] = useState(0);

  if (loading) return <div className="page"><LoadingPanel label="正在读取实体…" /></div>;
  if (error) return <div className="page"><ErrorPanel error={error} onRetry={refresh} /></div>;
  if (!entity) return null;

  const sceneKey = entity.sceneKey && isSceneKey(entity.sceneKey) ? entity.sceneKey : null;
  const meta = sceneKey ? sceneMeta[sceneKey] : null;
  const calculator = entity.calculator === 'amat' ? 'amat' : entity.calculator === 'roofline' ? 'roofline' : 'cpu';

  return (
    <div className="page page--entity" style={{ '--entity-accent': entity.accent } as CSSProperties}>
      <div className="breadcrumbs">
        <Link to="/">时间</Link>
        <span>/</span>
        {era ? <Link to={`/period/${era.slug}`}>{era.name}</Link> : <span>{entity.category}</span>}
        <span>/</span>
        <span>{entity.name}</span>
      </div>

      <header className="entity-header">
        <div>
          <h1>{entity.name}</h1>
          <p className="entity-header__summary">{entity.summary}</p>
        </div>
      </header>

      <div className="entity-layout">
        <div className="entity-main">
          {sceneKey ? (
            <section className="exhibit-shell exhibit-shell--detail">
              <div className="exhibit-shell__head">
                <div>
                  <div className="eyebrow">3D 展柜 / 非等比复原</div>
                  <h2>{meta?.label}</h2>
                </div>
                <Badge tone="accent">交互展品</Badge>
              </div>
              <Suspense
                fallback={
                  <div className="exhibit-loading">
                    <Spinner label="正在装配 3D 展品…" />
                  </div>
                }
              >
                <ExhibitViewer sceneKey={sceneKey} exploded={exploded} accent={entity.accent} />
              </Suspense>
              {meta?.explodable && (
                <label className="explode-control">
                  <span>拆解</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={exploded}
                    onChange={(event) => setExploded(Number(event.target.value))}
                    aria-label="拆解展品"
                  />
                  <span>{Math.round(exploded * 100)}%</span>
                </label>
              )}
              <div className="exhibit-shell__caption">
                <p>{meta?.caption}</p>
                <span className="exhibit-disclaimer">
                  <Expand size={13} aria-hidden="true" />
                  解释性抽象，不追求工程比例
                </span>
              </div>
            </section>
          ) : (
            <section className="exhibit-static exhibit-static--large">
              <TechDiagram accent={entity.accent} icon={entity.icon} sceneKey={entity.sceneKey} label={entity.name} />
              <div className="exhibit-static__caption">
                <Expand size={14} aria-hidden="true" />
                {entity.type === 'hardware'
                  ? '这台机器的 3D 展品不在 M1 范围内，先用技术插图占位。'
                  : '软件与模型以结构图和公式呈现，不使用 3D 机器展品。'}
              </div>
            </section>
          )}

          <section className="prose-section">
            <div className="eyebrow">为什么重要</div>
            {entity.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <section className="entity-reading">
            <div className="eyebrow">边读边问</div>
            <div className="entity-reading__grid">
              <article>
                <strong>它取代了什么？</strong>
                <p>上一代机器或做法在哪里遇到瓶颈？是速度、可靠性、成本，还是使用方式？</p>
              </article>
              <article>
                <strong>它用什么机制？</strong>
                <p>把形态、器件、存储层次与 ISA 分开看：哪些是物理约束，哪些是软件契约？</p>
              </article>
              <article>
                <strong>它留下了什么？</strong>
                <p>哪些设计被后来的机器继承？哪些只是这个时代的权宜之计？</p>
              </article>
            </div>
          </section>

          {entity.type === 'model' && (
            <CalculatorPanel initial={calculator} hideTabs={false} />
          )}

          <section className="section">
            <SectionHeader eyebrow="规格" title="能核对的事实" body="数值来自书目与公开资料；年代与规格会继续复核。" />
            <div className="spec-grid">
              {entity.specs.map((spec) => (
                <div className="spec-card" key={spec.label}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                  {spec.note && <small>{spec.note}</small>}
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <SectionHeader eyebrow="关系" title="它和谁连在一起" body="关系是理解系统边界的入口，不是完整依赖图。" />
            {entity.relations && entity.relations.length > 0 ? (
              <div className="relation-list">
                {entity.relations.map((relation) => (
                  <Link key={`${relation.direction}-${relation.entity.slug}`} to={entityHref(relation.entity)} className="relation-row">
                    <span className={`relation-row__direction ${relation.direction === 'in' ? 'is-in' : ''}`}>
                      {relation.direction === 'in' ? '←' : '→'}
                    </span>
                    <span className="relation-row__label">{relation.label}</span>
                    <span className="relation-row__name">{relation.entity.name}</span>
                    <span className="relation-row__type">{relation.kind}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">暂无关系。</p>
            )}
          </section>
        </div>

        <aside className="entity-aside">
          <section className="side-card">
            <div className="eyebrow">关键点</div>
            <ul className="check-list">
              {entity.highlights.map((highlight) => (
                <li key={highlight}>
                  <Sparkles size={13} aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>
          </section>

          {entity.significance.length > 0 && (
            <section className="side-card">
              <div className="eyebrow">历史意义</div>
              <ul className="check-list">
                {entity.significance.map((item) => (
                  <li key={item}>
                    <CalendarDays size={13} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="side-card">
            <div className="eyebrow">标签</div>
            <div className="tag-row">
              {entity.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            {entity.sources.length > 0 && (
              <>
                <div className="eyebrow side-card__spaced">来源</div>
                <ul className="source-list">
                  {entity.sources.map((source) => (
                    <li key={source.id || source.title}>
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.title}
                          <Link2 size={12} aria-hidden="true" />
                        </a>
                      ) : (
                        <span>{source.title}</span>
                      )}
                      {source.publisher && <small>{source.publisher}</small>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <AnnotationPanel
            targetType="entity"
            targetSlug={entity.slug}
            targetLabel={entity.name}
            compact
          />

          <Link className="back-link" to="/">
            <ArrowLeft size={14} />
            回到时间长廊
          </Link>
        </aside>
      </div>
    </div>
  );
}
