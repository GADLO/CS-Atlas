import { useMemo, useState } from 'react';
import { Calculator, Gauge, MemoryStick, Zap } from 'lucide-react';
import {
  computeAmat,
  computeCpu,
  computeRoofline,
  formatDuration,
  formatNumber,
} from '../lib/calculators';

type CalculatorKey = 'cpu' | 'amat' | 'roofline';

const tabs: Array<{ id: CalculatorKey; label: string; icon: typeof Calculator; hint: string }> = [
  { id: 'cpu', label: 'CPU 时间', icon: Calculator, hint: 'IC × CPI × 时钟周期' },
  { id: 'amat', label: 'Cache AMAT', icon: MemoryStick, hint: '命中时间 + 缺失代价' },
  { id: 'roofline', label: 'Roofline', icon: Gauge, hint: '算力与带宽的拐点' },
];

function NumberField({
  label,
  value,
  onChange,
  unit,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <div className="number-field__control">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {unit && <span className="number-field__unit">{unit}</span>}
      </div>
    </label>
  );
}

function ResultRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="calc-result-row">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function CpuCalculator() {
  const [ic, setIc] = useState(1000);
  const [cpi, setCpi] = useState(1.5);
  const [frequency, setFrequency] = useState(3.2);
  const result = useMemo(
    () => computeCpu({ instructionMillions: ic, cpi, frequencyGhz: frequency }),
    [ic, cpi, frequency],
  );

  return (
    <div className="calculator-grid">
      <div className="calc-inputs">
        <NumberField label="指令数" value={ic} onChange={setIc} unit="百万条" step={10} />
        <NumberField label="CPI" value={cpi} onChange={setCpi} unit="周期/指令" step={0.1} />
        <NumberField label="时钟频率" value={frequency} onChange={setFrequency} unit="GHz" step={0.1} />
        <p className="calc-note">CPU 时间 = 指令数 × CPI ÷ 频率。三个因子通常相互牵制。</p>
      </div>
      <div className="calc-results">
        <div className="calc-result-hero">
          <span>执行时间</span>
          <strong>{result ? formatDuration(result.seconds) : '—'}</strong>
        </div>
        <ResultRow label="总周期" value={result ? `${formatNumber(result.cycles)} cycles` : '—'} />
        <ResultRow label="指令数" value={result ? `${formatNumber(result.instructions)} 条` : '—'} />
        <ResultRow label="每百万条耗时" value={result ? `${formatNumber(result.millisecondsPerMillion)} ms` : '—'} />
        <div className="formula-chip">T = IC × CPI / f</div>
      </div>
    </div>
  );
}

function AmatCalculator() {
  const [hitTime, setHitTime] = useState(1);
  const [hitRate, setHitRate] = useState(95);
  const [penalty, setPenalty] = useState(100);
  const result = useMemo(
    () => computeAmat({ hitTime, hitRatePercent: hitRate, missPenalty: penalty }),
    [hitTime, hitRate, penalty],
  );
  const hitPart = result ? result.amat - result.missCost : 0;

  return (
    <div className="calculator-grid">
      <div className="calc-inputs">
        <NumberField label="命中时间" value={hitTime} onChange={setHitTime} unit="周期" step={0.1} />
        <NumberField label="命中率" value={hitRate} onChange={setHitRate} unit="%" min={0} max={100} step={1} />
        <NumberField label="缺失代价" value={penalty} onChange={setPenalty} unit="周期" step={1} />
        <p className="calc-note">AMAT = 命中时间 + 缺失率 × 缺失代价。提高命中率通常比降低命中时间更有效。</p>
      </div>
      <div className="calc-results">
        <div className="calc-result-hero">
          <span>平均访存时间</span>
          <strong>{result ? `${formatNumber(result.amat)} cycles` : '—'}</strong>
        </div>
        <div className="amat-bar" aria-hidden="true">
          <span className="amat-bar__hit" style={{ width: `${result && result.amat > 0 ? (hitPart / result.amat) * 100 : 0}%` }} />
          <span className="amat-bar__miss" style={{ width: `${result && result.amat > 0 ? (result.missCost / result.amat) * 100 : 0}%` }} />
        </div>
        <ResultRow label="缺失率" value={result ? `${formatNumber(result.missRate * 100)}%` : '—'} />
        <ResultRow label="缺失代价贡献" value={result ? `${formatNumber(result.missCost)} cycles` : '—'} />
        <div className="formula-chip">AMAT = hit + missRate × penalty</div>
      </div>
    </div>
  );
}

function RooflineChart({ intensity, value, peak, ridge }: { intensity: number; value: number; peak: number; ridge: number }) {
  const maxAi = Math.max(ridge * 2.4, 1);
  const x = (ai: number) => 26 + (Math.log2(Math.max(ai, 0.1) / 0.1) / Math.log2(maxAi / 0.1)) * 310;
  const y = (value: number) => 142 - (Math.min(value, peak) / peak) * 108;
  const ridgeX = Math.min(336, x(ridge));
  const pointX = Math.min(336, x(Math.max(intensity, 0.1)));
  const pointY = y(value);

  return (
    <svg className="roofline-chart" viewBox="0 0 370 170" role="img" aria-label="Roofline 曲线">
      <path d="M26 142V28M26 142h314" stroke="rgba(255,255,255,0.22)" />
      <path d={`M26 ${y(peak)}H${ridgeX}L336 ${y(peak * (maxAi / ridge))}`} fill="none" stroke="#76e6a8" strokeWidth="2" />
      <path d={`M26 ${y(peak)}H${ridgeX}`} stroke="rgba(118,230,168,0.3)" strokeDasharray="4 4" />
      <line x1={pointX} y1="142" x2={pointX} y2={pointY} stroke="#64d8ff" strokeDasharray="3 4" />
      <line x1="26" y1={pointY} x2={pointX} y2={pointY} stroke="#64d8ff" strokeDasharray="3 4" />
      <circle cx={pointX} cy={pointY} r="4.5" fill="#64d8ff" />
      <text x="30" y="22" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="monospace">TFLOPS</text>
      <text x="300" y="158" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="monospace">AI</text>
    </svg>
  );
}

function RooflineCalculator() {
  const [peak, setPeak] = useState(60);
  const [bandwidth, setBandwidth] = useState(2000);
  const [intensity, setIntensity] = useState(10);
  const result = useMemo(
    () => computeRoofline({ peakTflops: peak, bandwidthGbps: bandwidth, arithmeticIntensity: intensity }),
    [peak, bandwidth, intensity],
  );

  return (
    <div className="calculator-grid">
      <div className="calc-inputs">
        <NumberField label="峰值算力" value={peak} onChange={setPeak} unit="TFLOPS" step={1} />
        <NumberField label="显存带宽" value={bandwidth} onChange={setBandwidth} unit="GB/s" step={10} />
        <NumberField label="算术强度" value={intensity} onChange={setIntensity} unit="FLOP/Byte" step={1} />
        <p className="calc-note">性能上限 = min(峰值算力, 带宽 × 算术强度)。拐点右侧才真正算力受限。</p>
      </div>
      <div className="calc-results">
        <div className="calc-result-hero">
          <span>可达性能</span>
          <strong>{result ? `${formatNumber(result.attainableTflops)} TFLOPS` : '—'}</strong>
        </div>
        <RooflineChart intensity={intensity} value={result?.attainableTflops ?? 0} peak={peak || 1} ridge={result?.ridgePoint ?? 1} />
        <ResultRow
          label="瓶颈"
          value={result ? (result.bottleneck === 'bandwidth' ? '带宽受限' : '算力受限') : '—'}
          hint={result ? `拐点 ≈ ${formatNumber(result.ridgePoint)} FLOP/Byte` : undefined}
        />
        <div className="formula-chip">min(peak, BW × AI)</div>
      </div>
    </div>
  );
}

export function CalculatorPanel({
  initial = 'cpu',
  hideTabs = false,
}: {
  initial?: CalculatorKey;
  hideTabs?: boolean;
}) {
  const [active, setActive] = useState<CalculatorKey>(initial);
  const current = tabs.find((tab) => tab.id === active) || tabs[0];

  return (
    <section className="calculator-panel">
      <div className="calculator-head">
        <div>
          <div className="eyebrow">可计算的模型</div>
          <h2>{current.label}</h2>
          <p>{current.hint}</p>
        </div>
        <Zap size={20} aria-hidden="true" />
      </div>
      {!hideTabs && (
        <div className="calculator-tabs" role="tablist" aria-label="选择计算器">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active === tab.id}
                className={`calculator-tab ${active === tab.id ? 'calculator-tab--active' : ''}`}
                onClick={() => setActive(tab.id)}
              >
                <Icon size={15} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
      <div className="calculator-body">
        {active === 'cpu' && <CpuCalculator />}
        {active === 'amat' && <AmatCalculator />}
        {active === 'roofline' && <RooflineCalculator />}
      </div>
    </section>
  );
}
