import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Calculator, FlaskConical, Layers3 } from 'lucide-react';
import { useApi } from '../lib/api';
import type { AiModuleSummary, Entity } from '../lib/types';
import { CalculatorPanel } from '../components/CalculatorPanel';
import { Badge, ErrorPanel, LoadingPanel, SectionHeader } from '../components/ui';

export default function LabPage() {
  const models = useApi<{ items: Entity[] }>('/models');
  const modules = useApi<{ items: AiModuleSummary[] }>('/ai/modules');

  return (
    <div className="page page--lab">
      <header className="page-hero page-hero--lab">
        <div className="eyebrow">
          <FlaskConical size={13} aria-hidden="true" /> 实验室 / 工具层
        </div>
        <h1>把模型跑一遍，<br /><em>再看结论</em></h1>
        <p>
          计算器与 AI 模块不构成另一条知识主线。它们从时间节点、章节镜头和问题里被调用，
          用来验证 CPU 时间、AMAT、Roofline 或 GPU 吞吐的直觉。
        </p>
        <div className="page-hero__meta">
          <span>3 个计算器</span>
          <span>1 个 AI 模块</span>
          <span>都挂在主线上</span>
        </div>
      </header>

      {models.loading && <LoadingPanel label="正在读取模型…" />}
      {models.error && <ErrorPanel error={models.error} onRetry={models.refresh} />}

      <section className="lab-section">
        <SectionHeader
          eyebrow="计算器"
          title="CPU / AMAT / Roofline"
          body="输入变化后结果实时更新；公式与单位在计算器内标注。"
          action={<Badge tone="accent">{models.data?.items.length ?? 3} 个模型</Badge>}
        />
        <CalculatorPanel initial="cpu" />
      </section>

      <section className="lab-section">
        <SectionHeader
          eyebrow="AI 系统"
          title="GPU 为什么快"
          body="用 SIMT、HBM 与 Roofline 解释吞吐优先的硬件，并把模块链接回 H100 与 Q3。"
          action={<Link to="/questions/program-performance" className="text-link">Q3 程序性能 <ArrowRight size={13} /></Link>}
        />
        {modules.loading && <LoadingPanel label="正在读取 AI 模块…" />}
        {modules.error && <ErrorPanel error={modules.error} onRetry={modules.refresh} />}
        {modules.data && (
          <div className="lab-module-grid">
            {modules.data.items.map((module) => (
              <Link key={module.slug} to={`/lenses/parallel`} className="lab-module">
                <div className="lab-module__icon"><BrainCircuit size={20} /></div>
                <div>
                  <div className="eyebrow">AI / {module.level}</div>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                  <span className="text-link">在并行镜头中查看 <ArrowRight size={13} /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="lab-note">
        <Layers3 size={15} />
        <p>模型与 AI 模块的扩展入口在时间节点与章节镜头；实验室本身不维护历史叙事。</p>
        <Link to="/" className="text-link"><Calculator size={14} /> 回到时间主线</Link>
      </div>
    </div>
  );
}
