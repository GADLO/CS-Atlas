import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, HelpCircle, Layers3 } from 'lucide-react';
import { useApi } from '../lib/api';
import type { QuestionSummary } from '../lib/types';
import { Badge, ErrorPanel, LoadingPanel, StatusBadge } from '../components/ui';

export default function QuestionsPage() {
  const { data, loading, error, refresh } = useApi<{ items: QuestionSummary[] }>('/questions');

  return (
    <div className="page page--questions">
      <header className="page-hero page-hero--questions">
        <div className="eyebrow">
          <HelpCircle size={13} aria-hidden="true" /> 七个必答问题
        </div>
        <h1>不是七篇文章，<br />是七条回答路径</h1>
        <p>
          每个问题都要走完五层：直接答案、机制、历史实例、可验证交互、自测与来源。
          M1 先打通 Q1 与 Q3，其余问题保留为“建设中”，不伪装成已完成。
        </p>
        <div className="page-hero__meta">
          <span>7 个问题</span>
          <span>2 个已发布</span>
          <span>3 个可验证交互</span>
        </div>
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
              <p className="question-card__answer">{question.oneLineAnswer}</p>
              <div className="question-card__foot">
                <div className="question-card__tags">
                  {question.sceneKeys.length > 0 && (
                    <Badge tone="accent">
                      <Layers3 size={11} aria-hidden="true" />
                      {question.sceneKeys.length} 个 3D 场景
                    </Badge>
                  )}
                  {question.calculator && (
                    <Badge tone="warn">
                      <Calculator size={11} aria-hidden="true" />
                      计算器
                    </Badge>
                  )}
                  {question.sceneKeys.length === 0 && !question.calculator && <Badge tone="neutral">待补交互</Badge>}
                </div>
                <span className="question-card__open">
                  {question.status === 'published' ? '进入回答' : '查看草稿'}
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
