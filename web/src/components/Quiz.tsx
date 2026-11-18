import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import type { QuizItem } from '../lib/types';
import { Badge, SectionHeader } from './ui';

export function Quiz({ items }: { items: QuizItem[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = useMemo(
    () => items.reduce((total, item, index) => (answers[index] === item.answer ? total + 1 : total), 0),
    [answers, items],
  );

  if (!items.length) return null;

  return (
    <section className="quiz">
      <SectionHeader
        eyebrow="自测"
        title="把答案用自己的话过一遍"
        body="选完再提交；错题会显示解释。"
        action={<Badge tone="neutral">{items.length} 题</Badge>}
      />
      <div className="quiz-list">
        {items.map((item, index) => {
          const chosen = answers[index];
          return (
            <article className="quiz-item" key={item.question}>
              <div className="quiz-item__head">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.question}</h3>
              </div>
              <div className="quiz-options">
                {item.options.map((option, optionIndex) => {
                  const isChosen = chosen === optionIndex;
                  const isCorrect = submitted && optionIndex === item.answer;
                  const isWrong = submitted && isChosen && optionIndex !== item.answer;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`quiz-option ${isChosen ? 'quiz-option--chosen' : ''} ${isCorrect ? 'quiz-option--correct' : ''} ${isWrong ? 'quiz-option--wrong' : ''}`}
                      onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                      disabled={submitted}
                    >
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      {option}
                      {isCorrect && <CheckCircle2 size={15} aria-hidden="true" />}
                      {isWrong && <XCircle size={15} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className={`quiz-explain ${chosen === item.answer ? 'is-correct' : 'is-wrong'}`}>
                  <strong>{chosen === item.answer ? '答对了' : `正确答案：${String.fromCharCode(65 + item.answer)}`}</strong>
                  {item.explain && <p>{item.explain}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="quiz-actions">
        {!submitted ? (
          <button
            type="button"
            className="button button--primary"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < items.length}
          >
            提交答案
          </button>
        ) : (
          <div className="quiz-result">
            <strong>
              {score} / {items.length}
            </strong>
            <span>{score === items.length ? '全部正确，可以继续。' : '回看解释，再试一次。'}</span>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              <RotateCcw size={14} />
              重做
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
