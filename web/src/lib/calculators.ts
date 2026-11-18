export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—';
  if (seconds >= 1) return `${formatNumber(seconds)} s`;
  if (seconds >= 1e-3) return `${formatNumber(seconds * 1e3)} ms`;
  if (seconds >= 1e-6) return `${formatNumber(seconds * 1e6)} µs`;
  return `${formatNumber(seconds * 1e9)} ns`;
}

export interface CpuInput {
  instructionMillions: number;
  cpi: number;
  frequencyGhz: number;
}

export interface CpuResult {
  seconds: number;
  cycles: number;
  instructions: number;
  millisecondsPerMillion: number;
}

export function computeCpu({ instructionMillions, cpi, frequencyGhz }: CpuInput): CpuResult | null {
  if (instructionMillions <= 0 || cpi <= 0 || frequencyGhz <= 0) return null;
  const instructions = instructionMillions * 1e6;
  const cycles = instructions * cpi;
  const seconds = cycles / (frequencyGhz * 1e9);
  return {
    seconds,
    cycles,
    instructions,
    millisecondsPerMillion: (cpi / frequencyGhz) * 1,
  };
}

export interface AmatInput {
  hitTime: number;
  hitRatePercent: number;
  missPenalty: number;
}

export interface AmatResult {
  amat: number;
  missRate: number;
  missCost: number;
}

export function computeAmat({ hitTime, hitRatePercent, missPenalty }: AmatInput): AmatResult | null {
  if (hitTime <= 0 || missPenalty <= 0) return null;
  const hitRate = Math.min(100, Math.max(0, hitRatePercent)) / 100;
  const missRate = 1 - hitRate;
  return {
    amat: hitTime + missRate * missPenalty,
    missRate,
    missCost: missRate * missPenalty,
  };
}

export interface RooflineInput {
  peakTflops: number;
  bandwidthGbps: number;
  arithmeticIntensity: number;
}

export interface RooflineResult {
  attainableTflops: number;
  bandwidthLimitTflops: number;
  bottleneck: 'compute' | 'bandwidth';
  ridgePoint: number;
}

export function computeRoofline({
  peakTflops,
  bandwidthGbps,
  arithmeticIntensity,
}: RooflineInput): RooflineResult | null {
  if (peakTflops <= 0 || bandwidthGbps <= 0 || arithmeticIntensity <= 0) return null;
  const bandwidthLimitTflops = (bandwidthGbps * arithmeticIntensity) / 1000;
  const attainableTflops = Math.min(peakTflops, bandwidthLimitTflops);
  return {
    attainableTflops,
    bandwidthLimitTflops,
    bottleneck: bandwidthLimitTflops < peakTflops ? 'bandwidth' : 'compute',
    ridgePoint: (peakTflops * 1000) / bandwidthGbps,
  };
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}
