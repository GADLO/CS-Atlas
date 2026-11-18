import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, NotebookPen, Trash2 } from 'lucide-react';
import { deleteAnnotation, useApi } from '../lib/api';
import type { Annotation } from '../lib/types';
import { Badge, EmptyState, ErrorPanel, LoadingPanel } from '../components/ui';

const targetLabel: Record<Annotation['targetType'], string> = {
  entity: '实体',
  question: '问题',
  ai_module: 'AI 模块',
  era: '时期',
};

function targetHref(annotation: Annotation): string {
  if (annotation.targetType === 'question') return `/questions/${annotation.targetSlug}`;
  if (annotation.targetType === 'ai_module') return '/lab';
  if (annotation.targetType === 'era') return `/period/${annotation.targetSlug}`;
  return `/entity/${annotation.targetSlug}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function NotesPage() {
  const { data, loading, error, refresh } = useApi<{ items: Annotation[] }>('/annotations');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = data?.items ?? [];
  const favorites = items.filter((item) => item.kind === 'favorite');
  const notes = items.filter((item) => item.kind === 'note');

  const remove = async (id: number) => {
    setBusyId(id);
    setActionError(null);
    try {
      await deleteAnnotation(id);
      refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : '删除失败');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page page--notes">
      <header className="page-hero page-hero--notes">
        <div className="eyebrow">
          <NotebookPen size={13} aria-hidden="true" /> 我的批注
        </div>
        <h1>把逛展时<br /><em>停下来的地方</em>留下来</h1>
        <p>收藏和笔记存在本地 SQLite。重新播种内容不会删掉它们；这是你的阅读痕迹。</p>
        <div className="page-hero__meta">
          <span>{favorites.length} 个收藏</span>
          <span>{notes.length} 条笔记</span>
        </div>
      </header>

      {loading && <LoadingPanel label="正在读取批注…" />}
      {error && <ErrorPanel error={error} onRetry={refresh} />}
      {actionError && <div className="form-error">{actionError}</div>}

      {!loading && items.length === 0 && (
        <EmptyState title="还没有收藏或笔记" body="在机器页或问题页点一下心形，或者写第一条笔记。" />
      )}

      {favorites.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">收藏</div>
              <h2>先记住，再回来</h2>
            </div>
            <Badge tone="accent">{favorites.length}</Badge>
          </div>
          <div className="notes-grid">
            {favorites.map((annotation) => (
              <article className="favorite-card" key={annotation.id}>
                <div className="favorite-card__icon">
                  <Heart size={16} fill="currentColor" />
                </div>
                <div>
                  <Badge tone="neutral">{targetLabel[annotation.targetType]}</Badge>
                  <h3>{annotation.targetLabel}</h3>
                  <span className="favorite-card__date">{formatDate(annotation.createdAt)}</span>
                </div>
                <div className="favorite-card__actions">
                  <Link to={targetHref(annotation)} className="icon-button" aria-label="打开目标">
                    <ArrowRight size={16} />
                  </Link>
                  <button type="button" className="icon-button" onClick={() => remove(annotation.id)} disabled={busyId === annotation.id} aria-label="删除收藏">
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">笔记</div>
              <h2>写下来的才算想过</h2>
            </div>
            <Badge tone="neutral">{notes.length}</Badge>
          </div>
          <div className="notes-list">
            {notes.map((annotation) => (
              <article className="notes-item" key={annotation.id}>
                <div className="notes-item__meta">
                  <Badge tone="neutral">{targetLabel[annotation.targetType]}</Badge>
                  <span>{annotation.targetLabel}</span>
                  <span>{formatDate(annotation.createdAt)}</span>
                </div>
                <p>{annotation.content}</p>
                <div className="notes-item__actions">
                  <Link to={targetHref(annotation)} className="text-link">
                    打开目标 <ArrowRight size={13} />
                  </Link>
                  <button type="button" className="note-delete" onClick={() => remove(annotation.id)} disabled={busyId === annotation.id}>
                    <Trash2 size={13} />
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
