import { lazy, Suspense, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  CircleHelp,
  Compass,
  Layers3,
  Lightbulb,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useApi } from '../lib/api';
import type { Question } from '../lib/types';
import { AnnotationPanel } from '../components/AnnotationPanel';
import { Quiz } from '../components/Quiz';
import { CalculatorPanel } from '../components/CalculatorPanel';
import { entityHref } from '../components/EntityCard';
import { TechDiagram } from '../components/TechDiagram';
import { Badge, ErrorPanel, LoadingPanel, SectionHeader, Spinner, StatusBadge, Tag } from '../components/ui';
import { isSceneKey, sceneMeta, type SceneKey, type SceneMode } from '../three/sceneKeys';

const ExhibitViewer = lazy(() => import('../components/ExhibitViewer'));

function CompilerPipeline() {
  const stages = [
    { label: 'C 源码', detail: 'hello.c' },
    { label: '编译器', detail: '词法 / 语法 / 优化' },
    { label: '汇编器', detail: '助记符 → 机器码' },
    { label: '链接器', detail: '符号 / 重定位' },
    { label: '加载器', detail: '内存映射' },
    { label: 'CPU 执行', detail: '取指—译码—执行' },
  ];
  return (
    <div className="pipeline">
      {stages.map((stage, index) => (
        <div className="pipeline__stage" key={stage.label}>
          <div className="pipeline__index">{String(index + 1).padStart(2, '0')}</div>
          <strong>{stage.label}</strong>
          <span>{stage.detail}</span>
          {index < stages.length - 1 && <ArrowRight className="pipeline__arrow" size={15} aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

export default function QuestionPage() {
  const { slug = '' } = useParams();
  const { data: question, loading, error, refresh } = useApi<Question>(`/questions/${slug}`);
  const [activeScene, setActiveScene] = useState<SceneKey | null>(null);
  const [mode, setMode] = useState<SceneMode>('single');

  const scenes = useMemo(() => (question?.sceneKeys ?? []).filter(isSceneKey), [question]);
  const currentScene = activeScene && scenes.includes(activeScene) ? activeScene : scenes[0] ?? null;
  const meta = currentScene ? sceneMeta[currentScene] : null;

  if (loading) return <div className="page"><LoadingPanel label="正在读取问题…" /></div>;
  if (error) return <div className="page"><ErrorPanel error={error} onRetry={refresh} /></div>;
  if (!question) return null;

  const isPublished = question.status === 'published';

  return (
    <div className="page page--question">
      <div className="breadcrumbs">
        <Link to="/questions">七个问题</Link>
        <span>/</span>
        <span>Q{question.number}</span>
      </div>

      <header className="question-hero">
        <div className="question-hero__number">Q{question.number}</div>
        <div className="question-hero__body">
          <div className="question-hero__badges">
            <StatusBadge status={question.status} />
            {question.book && <Badge tone="neutral">COD {question.book.chapter} · {question.book.pages}</Badge>}
          </div>
          <h1>{question.title}</h1>
          <p className="question-hero__question">{question.question}</p>
          <div className="one-line-answer">
            <Sparkles size={17} aria-hidden="true" />
            <p>{question.oneLineAnswer}</p>
          </div>
          <div className="question-hero__meta">
            <span>{question.sources.length} 条来源</span>
            <span>{question.timelineAnchors.length} 个时间线锚点</span>
            <span>{scenes.length} 个 3D 场景</span>
            {question.calculator && <span>含计算器</span>}
          </div>
        </div>
      </header>

      {!isPublished && (
        <div className="construction-banner">
          <Compass size={20} aria-hidden="true" />
          <div>
            <strong>这条回答仍在建设中</strong>
            <p>下面是当前草稿与引用；它不会在 M1 被标记为完成。</p>
          </div>
        </div>
      )}

      <div className="question-layout">
        <div className="question-main">
          <section className="answer-sections">
            {question.answerSections.map((section, index) => (
              <article key={section.heading} className="answer-section">
                <div className="answer-section__index">{String(index + 1).padStart(2, '0')}</div>
                <div>
                  <h2>{section.heading}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </section>

          {question.keyConcepts.length > 0 && (
            <section className="concept-strip">
              <div className="eyebrow">关键概念</div>
              <div className="tag-row">
                {question.keyConcepts.map((concept) => (
                  <Tag key={concept.name}>{concept.name}</Tag>
                ))}
              </div>
            </section>
          )}

          {currentScene ? (
            <section className="exhibit-shell exhibit-shell--question">
              <div className="exhibit-shell__head">
                <div>
                  <div className="eyebrow">可验证交互</div>
                  <h2>{meta?.label}</h2>
                  <p>{meta?.caption}</p>
                </div>
                <Badge tone="accent">3D</Badge>
              </div>
              {scenes.length > 1 && (
                <div className="scene-tabs" role="tablist" aria-label="选择展品">
                  {scenes.map((scene) => (
                    <button
                      key={scene}
                      type="button"
                      role="tab"
                      aria-selected={currentScene === scene}
                      className={`scene-tab ${currentScene === scene ? 'scene-tab--active' : ''}`}
                      onClick={() => setActiveScene(scene)}
                    >
                      <Layers3 size={14} />
                      {sceneMeta[scene].label}
                    </button>
                  ))}
                </div>
              )}
              {meta?.modes && (
                <div className="mode-toggle" role="group" aria-label="数据通路模式">
                  {meta.modes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`mode-toggle__button ${mode === item.id ? 'is-active' : ''}`}
                      onClick={() => setMode(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
              <Suspense
                fallback={
                  <div className="exhibit-loading">
                    <Spinner label="正在装配 3D 场景…" />
                  </div>
                }
              >
                <ExhibitViewer sceneKey={currentScene} mode={mode} accent="#64d8ff" />
              </Suspense>
            </section>
          ) : (
            question.interaction?.type && (
              <section className="exhibit-shell exhibit-shell--question">
                <div className="exhibit-static exhibit-static--large">
                  <TechDiagram accent="#64d8ff" icon="model" label={question.shortTitle} />
                  <div className="exhibit-static__caption">
                    <Layers3 size={14} />
                    交互展品待接入
                  </div>
                </div>
              </section>
            )
          )}

          {question.slug === 'program-to-machine' && (
            <section className="section">
              <SectionHeader eyebrow="机制" title="从源文件到执行循环" body="每一层都保留一个可检查的产物：源码、汇编、目标文件、可执行文件。" />
              <CompilerPipeline />
            </section>
          )}

          {question.calculator && (
            <CalculatorPanel
              initial={question.calculator === 'amat' ? 'amat' : question.calculator === 'roofline' ? 'roofline' : 'cpu'}
            />
          )}

          {question.misconceptions.length > 0 && (
            <section className="section">
              <SectionHeader eyebrow="常见误解" title="先把容易错的地方说清楚" />
              <ul className="misconception-list">
                {question.misconceptions.map((item) => (
                  <li key={item}>
                    <XCircle size={15} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Quiz items={question.quiz} />

          {question.sources.length > 0 && (
            <section className="section">
              <SectionHeader eyebrow="来源" title="可追溯的引用" body="事实与数字优先回到原始资料；二手书目用于体系化解释。" />
              <ol className="source-list source-list--numbered">
                {question.sources.map((source) => (
                  <li key={source.id || source.title}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                    ) : (
                      <span>{source.title}</span>
                    )}
                    {source.publisher && <small>{source.publisher}</small>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="question-aside">
          <section className="side-card">
            <div className="eyebrow">
              <Compass size={13} aria-hidden="true" /> 时间线锚点
            </div>
            <div className="anchor-list">
              {question.timelineAnchors.map((anchor) => {
                const to = anchor.machine?.slug
                  ? `/machine/${anchor.machine.slug}`
                  : anchor.era?.slug
                    ? `/period/${anchor.era.slug}`
                    : '/';
                return (
                  <Link className="anchor-row" key={`${anchor.label}-${anchor.event?.slug || anchor.era?.slug}`} to={to}>
                    <span className="anchor-row__year">
                      {anchor.event?.year ?? anchor.machine?.name ?? anchor.era?.name ?? '—'}
                    </span>
                    <span className="anchor-row__label">{anchor.label}</span>
                    <ArrowRight size={13} />
                  </Link>
                );
              })}
            </div>
          </section>

          {question.timelineNodes?.length > 0 && (
            <section className="side-card">
              <div className="eyebrow">时间主线上的节点</div>
              <div className="related-list">
                {question.timelineNodes.slice(0, 8).map((node) => (
                  <Link key={node.slug} to={`/period/${node.periodSlug}`} className="related-row">
                    <span className="related-row__dot" style={{ background: node.entity?.accent ?? '#64d8ff' }} />
                    <span>{node.year} · {node.title}</span>
                    <small>{node.period?.name}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {question.entities.length > 0 && (
            <section className="side-card">
              <div className="eyebrow">相关实体</div>
              <div className="related-list">
                {question.entities.slice(0, 8).map((entity) => (
                  <Link key={entity.slug} to={entityHref(entity)} className="related-row">
                    <span className="related-row__dot" style={{ background: entity.accent }} />
                    <span>{entity.name}</span>
                    <small>{entity.category}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {question.models.length > 0 && (
            <section className="side-card">
              <div className="eyebrow">原理模型</div>
              <div className="related-list">
                {question.models.map((model) => (
                  <Link key={model.slug} to={entityHref(model)} className="related-row">
                    <Calculator size={13} aria-hidden="true" />
                    <span>{model.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {question.aiModules.length > 0 && (
            <section className="side-card">
              <div className="eyebrow">AI 系统</div>
              <div className="related-list">
                {question.aiModules.map((module) => (
                  <Link key={module.slug} to="/lab" className="related-row">
                    <Lightbulb size={13} aria-hidden="true" />
                    <span>{module.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <AnnotationPanel
            targetType="question"
            targetSlug={question.slug}
            targetLabel={question.shortTitle}
            compact
          />

          <Link className="back-link" to="/questions">
            <ArrowLeft size={14} />
            回到七个问题
          </Link>
        </aside>
      </div>

      {question.quiz.length > 0 && isPublished && (
        <div className="question-footnote">
          <CircleHelp size={15} />
          这页还不能算“完全回答”：人工试答、截图验收与来源复核仍待完成。
        </div>
      )}
    </div>
  );
}
