import { useState } from 'react';
import { Heart, LoaderCircle, NotebookPen, Send, Trash2 } from 'lucide-react';
import { createAnnotation, deleteAnnotation, useAnnotations } from '../lib/api';
import type { Annotation } from '../lib/types';
import { EmptyState, Spinner } from './ui';

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

export function AnnotationPanel({
  targetType,
  targetSlug,
  targetLabel,
  compact = false,
}: {
  targetType: Annotation['targetType'];
  targetSlug: string;
  targetLabel: string;
  compact?: boolean;
}) {
  const { data, loading, error, refresh } = useAnnotations(targetType, targetSlug);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = data?.items ?? [];
  const favorite = items.find((item) => item.kind === 'favorite');
  const notes = items.filter((item) => item.kind === 'note');

  const toggleFavorite = async () => {
    setBusy(true);
    setActionError(null);
    try {
      if (favorite) await deleteAnnotation(favorite.id);
      else await createAnnotation({ targetType, targetSlug, kind: 'favorite' });
      refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  const submitNote = async () => {
    const text = content.trim();
    if (!text) return;
    setBusy(true);
    setActionError(null);
    try {
      await createAnnotation({ targetType, targetSlug, kind: 'note', content: text });
      setContent('');
      refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : '保存失败');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setBusy(true);
    setActionError(null);
    try {
      await deleteAnnotation(id);
      refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : '删除失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`annotation-panel ${compact ? 'annotation-panel--compact' : ''}`} aria-label="我的批注">
      <div className="annotation-head">
        <div>
          <div className="eyebrow">我的批注</div>
          <h3>留下一个坐标</h3>
          <p>收藏或笔记保存在本地 SQLite，不随内容播种删除。</p>
        </div>
        <button
          type="button"
          className={`icon-button ${favorite ? 'icon-button--active' : ''}`}
          onClick={toggleFavorite}
          disabled={busy}
          aria-label={favorite ? '取消收藏' : '收藏'}
          title={favorite ? '取消收藏' : '收藏'}
        >
          {busy ? <LoaderCircle size={18} className="spin" /> : <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />}
        </button>
      </div>

      {loading && (
        <div className="annotation-loading">
          <Spinner label="读取批注" />
        </div>
      )}
      {error && <div className="form-error">{error.message}</div>}
      {actionError && <div className="form-error">{actionError}</div>}

      {!loading && notes.length === 0 && (
        <EmptyState title="还没有笔记" body={`给「${targetLabel}」写第一条观察。`} />
      )}

      {notes.length > 0 && (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              <div className="note-item__meta">
                <NotebookPen size={13} aria-hidden="true" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
              <p>{note.content}</p>
              <button type="button" className="note-delete" onClick={() => remove(note.id)} disabled={busy}>
                <Trash2 size={13} aria-hidden="true" />
                删除
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="note-compose">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={`写下你对「${targetLabel}」的理解…`}
          rows={3}
          maxLength={2000}
        />
        <div className="note-compose__footer">
          <span>{content.length} / 2000</span>
          <button type="button" className="button button--primary button--small" onClick={submitNote} disabled={busy || !content.trim()}>
            <Send size={14} aria-hidden="true" />
            保存笔记
          </button>
        </div>
      </div>
    </section>
  );
}
