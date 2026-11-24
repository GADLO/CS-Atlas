import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { LensSummary } from '../lib/types';
import { ErrorPanel, LoadingPanel } from '../components/ui';

function LensCard({ lens }: { lens: LensSummary }) {
  return (
    <Link to={`/lenses/${lens.slug}`} className="lens-card lens-card--clean">
      <span className="lens-card__number">CH.{String(lens.number).padStart(2, '0')}</span>
      <strong>{lens.title}</strong>
      <span className="lens-card__count">{lens.nodeCount}</span>
    </Link>
  );
}

export default function LensesPage() {
  const { data, loading, error, refresh } = useApi<{ items: LensSummary[] }>('/lenses');
  const classic = data?.items.filter((lens) => lens.group === 'classic') ?? [];
  const frontier = data?.items.filter((lens) => lens.group === 'frontier') ?? [];

  return (
    <div className="page page--lenses">
      <header className="simple-head">
        <h1>章节</h1>
        <span>{data?.items.length ?? 10} 个镜头</span>
      </header>

      {loading && <LoadingPanel label="正在读取…" />}
      {error && <ErrorPanel error={error} onRetry={refresh} />}

      {data && (
        <>
          <section className="lens-group">
            <h2>经典</h2>
            <div className="lens-grid">
              {classic.map((lens) => <LensCard key={lens.slug} lens={lens} />)}
            </div>
          </section>

          <section className="lens-group">
            <h2>前沿</h2>
            <div className="lens-grid lens-grid--three">
              {frontier.map((lens) => <LensCard key={lens.slug} lens={lens} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
