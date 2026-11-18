import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Compass, FlaskConical } from 'lucide-react';
import { useApi } from '../lib/api';
import type { LensSummary } from '../lib/types';
import { Badge, ErrorPanel, LoadingPanel } from '../components/ui';

function LensCard({ lens }: { lens: LensSummary }) {
  return (
    <Link to={`/lenses/${lens.slug}`} className="lens-card" style={{ '--lens-accent': lens.accent } as CSSProperties}>
      <div className="lens-card__top">
        <span>CH.{String(lens.number).padStart(2, '0')}</span>
        <Badge tone={lens.group === 'frontier' ? 'violet' : 'neutral'}>
          {lens.group === 'frontier' ? '前沿' : '经典'}
        </Badge>
      </div>
      <h3>{lens.title}</h3>
      <div className="lens-card__en">{lens.titleEn}</div>
      <p className="lens-card__question">{lens.coreQuestion}</p>
      <p className="lens-card__summary">{lens.summary}</p>
      <div className="lens-card__foot">
        <span>{lens.nodeCount} 个时间节点</span>
        <span>打开镜头 <ArrowRight size={13} /></span>
      </div>
    </Link>
  );
}

export default function LensesPage() {
  const { data, loading, error, refresh } = useApi<{ items: LensSummary[] }>('/lenses');
  const classic = data?.items.filter((lens) => lens.group === 'classic') ?? [];
  const frontier = data?.items.filter((lens) => lens.group === 'frontier') ?? [];

  return (
    <div className="page page--lenses">
      <header className="page-hero page-hero--lenses">
        <div className="eyebrow">
          <BookMarked size={13} aria-hidden="true" /> 章节镜头 / 不是时间线
        </div>
        <h1>十个镜头，<br /><em>从同一段时间里看不同的问题</em></h1>
        <p>
          时间主线只有一条。十个章节镜头不拥有自己的时间数据：它们从主线筛选节点，
          让「指令」「存储」「I/O」或「量子计算」这些问题在历史里显影。
        </p>
        <div className="page-hero__meta">
          <span>10 个镜头</span>
          <span>7 个经典 · 3 个前沿</span>
          <span>都从时间主线派生</span>
        </div>
      </header>

      {loading && <LoadingPanel label="正在读取章节镜头…" />}
      {error && <ErrorPanel error={error} onRetry={refresh} />}

      {data && (
        <>
          <section className="lens-group">
            <div className="lens-group__head">
              <div className="eyebrow"><Compass size={13} /> 经典体系结构 / CH.01—07</div>
              <p>从体系结构定义、数据表示、指令、CPU、存储、I/O 到并行与普适计算。</p>
            </div>
            <div className="lens-grid">
              {classic.map((lens) => <LensCard key={lens.slug} lens={lens} />)}
            </div>
          </section>

          <section className="lens-group lens-group--frontier">
            <div className="lens-group__head">
              <div className="eyebrow"><FlaskConical size={13} /> 前沿体系结构 / CH.08—10</div>
              <p>生物、光与量子计算仍是实验/未定分支，不伪装成已经发生的历史时期。</p>
            </div>
            <div className="lens-grid lens-grid--three">
              {frontier.map((lens) => <LensCard key={lens.slug} lens={lens} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
