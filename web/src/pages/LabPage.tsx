import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApi } from '../lib/api';
import type { AiModuleSummary } from '../lib/types';
import { CalculatorPanel } from '../components/CalculatorPanel';
import { ErrorPanel, LoadingPanel } from '../components/ui';

export default function LabPage() {
  const modules = useApi<{ items: AiModuleSummary[] }>('/ai/modules');

  return (
    <div className="page page--lab">
      <header className="simple-head">
        <h1>实验</h1>
      </header>

      <section className="lab-section">
        <h2>计算器</h2>
        <CalculatorPanel initial="cpu" />
      </section>

      <section className="lab-section">
        <h2>AI</h2>
        {modules.loading && <LoadingPanel label="正在读取…" />}
        {modules.error && <ErrorPanel error={modules.error} onRetry={modules.refresh} />}
        {modules.data && (
          <div className="lab-module-grid">
            {modules.data.items.map((module) => (
              <Link key={module.slug} to="/lenses/parallel" className="lab-module lab-module--clean">
                <strong>{module.title}</strong>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
