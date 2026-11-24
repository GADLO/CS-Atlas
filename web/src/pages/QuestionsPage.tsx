import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApi } from '../lib/api';
import type { QuestionSummary } from '../lib/types';
import { ErrorPanel, LoadingPanel, StatusBadge } from '../components/ui';

export default function QuestionsPage() {
  const { data, loading, error, refresh } = useApi<{ items: QuestionSummary[] }>('/questions');

  return (
    <div className="page page--questions">
      <header className="simple-head">
        <h1>问题</h1>
        <span>{data?.items.length ?? 7} 个 · {data?.items.filter((item) => item.status === 'published').length ?? 2} 已发布</span>
      </header>

      {loading && <LoadingPanel label="正在读取问题…" />}
      {error && <ErrorPanel error={error} onRetry={refresh} />}

      {data && (
        <div className="question-grid">
          {data.items.map((question) => (
            <Link
              key={question.slug}
              to={`/questions/${question.slug}`}
              className={`question-card ${question.status === 'published' ? 'question-card--published' : 'question-card--planned'}`}
            >
              <div className="question-card__top">
                <span className="question-card__number">Q{question.number}</span>
                <StatusBadge status={question.status} />
              </div>
              <h2>{question.title}</h2>
              <p className="question-card__question">{question.question}</p>
              <span className="question-card__open">
                {question.status === 'published' ? '打开' : '草稿'}
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
