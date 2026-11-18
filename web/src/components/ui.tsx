import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react';
import type { QuestionStatus } from '../lib/types';

type Tone = 'neutral' | 'accent' | 'success' | 'warn' | 'violet';

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: QuestionStatus }) {
  const label = {
    published: '已发布',
    reviewed: '已审阅',
    drafted: '草稿',
    planned: '建设中',
  }[status];
  const tone: Tone = status === 'published' ? 'success' : status === 'planned' ? 'neutral' : 'warn';
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function Spinner({ label = '加载中' }: { label?: string }) {
  return (
    <span className="spinner" role="status">
      <LoaderCircle size={16} className="spin" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function LoadingPanel({ label = '正在读取…' }: { label?: string }) {
  return (
    <div className="state-panel state-panel--loading">
      <Spinner label={label} />
      <div className="skeleton-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function ErrorPanel({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <AlertTriangle size={22} aria-hidden="true" />
      <div>
        <strong>这里暂时没有接通</strong>
        <p>{error.message}</p>
      </div>
      {onRetry && (
        <button type="button" className="button button--ghost" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="state-panel">
      <Inbox size={22} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {body && <p>{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatBox({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="stat-box">
      <div className="stat-box__value">{value}</div>
      <div className="stat-box__label">{label}</div>
      {hint && <div className="stat-box__hint">{hint}</div>}
    </div>
  );
}
