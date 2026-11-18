import { useId } from 'react';

type Variant = 'chip' | 'board' | 'memory' | 'gpu' | 'model' | 'software' | 'desktop' | 'tube';

function variantFor(icon?: string, sceneKey?: string | null): Variant {
  if (sceneKey === 'tube-mainframe') return 'tube';
  if (sceneKey === 'desktop') return 'desktop';
  if (sceneKey === 'gpu-accelerator') return 'gpu';
  if (sceneKey === 'chiplet-package') return 'chip';
  if (icon === 'memory' || icon === 'cache' || icon === 'disk') return 'memory';
  if (icon === 'gpu') return 'gpu';
  if (icon === 'board') return 'board';
  if (icon === 'model' || icon === 'benchmark') return 'model';
  if (icon === 'tool' || icon === 'os' || icon === 'app') return 'software';
  if (icon === 'power' || icon === 'bus' || icon === 'io') return 'board';
  return 'chip';
}

export function TechDiagram({
  accent = '#38e1c8',
  icon,
  sceneKey,
  label,
  className = '',
}: {
  accent?: string;
  icon?: string;
  sceneKey?: string | null;
  label?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const variant = variantFor(icon, sceneKey);
  const grid = `${id}-grid`;
  const glow = `${id}-glow`;

  return (
    <svg
      className={`tech-diagram ${className}`}
      viewBox="0 0 400 220"
      role="img"
      aria-label={label ? `${label} 技术示意图` : '技术示意图'}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={grid} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
        </pattern>
        <radialGradient id={glow} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="rgba(8,12,18,0.55)" />
      <rect width="400" height="220" fill={`url(#${grid})`} />
      <rect width="400" height="220" fill={`url(#${glow})`} />

      {variant === 'chip' && (
        <g>
          <rect x="128" y="58" width="144" height="104" rx="10" fill="#131a25" stroke={accent} strokeOpacity="0.65" />
          <rect x="154" y="82" width="92" height="56" rx="4" fill={accent} fillOpacity="0.14" stroke={accent} strokeOpacity="0.8" />
          <path d="M154 96h-20m20 16h-20m20 16h-20M246 96h20m-20 16h20m-20 16h20" stroke={accent} strokeOpacity="0.55" />
          <path d="M128 78H94m34 22H82m34 22H94m144-44h34m-34 22h46m-34 22h34" stroke="rgba(255,255,255,0.22)" />
          <circle cx="200" cy="110" r="7" fill={accent} fillOpacity="0.8" />
        </g>
      )}

      {variant === 'gpu' && (
        <g>
          <rect x="60" y="72" width="280" height="86" rx="6" fill="#101720" stroke={accent} strokeOpacity="0.55" />
          <rect x="86" y="88" width="112" height="54" rx="4" fill={accent} fillOpacity="0.16" stroke={accent} strokeOpacity="0.8" />
          <path d="M210 88h24v54h-24zM244 88h24v54h-24z" fill="#1a2430" stroke="rgba(255,255,255,0.2)" />
          <path d="M286 88h32v54h-32z" fill={accent} fillOpacity="0.1" stroke={accent} strokeOpacity="0.4" />
          <path d="M110 158v14m30-14v14m30-14v14m30-14v14m70-14v14m30-14v14" stroke="rgba(255,255,255,0.3)" />
          <path d="M60 142h-18m298 0h18" stroke={accent} strokeOpacity="0.5" />
        </g>
      )}

      {variant === 'memory' && (
        <g>
          {[0, 1, 2, 3].map((index) => (
            <g key={index}>
              <rect
                x={108 + index * 14}
                y={68 + index * 26}
                width={170}
                height={34}
                rx="3"
                fill="#111a24"
                stroke={accent}
                strokeOpacity={0.28 + index * 0.12}
              />
              <path d={`M126 ${85 + index * 26}h134`} stroke={accent} strokeOpacity={0.3 + index * 0.1} />
              <path d={`M108 ${78 + index * 26}h-18m188 0h18`} stroke="rgba(255,255,255,0.2)" />
            </g>
          ))}
        </g>
      )}

      {variant === 'board' && (
        <g>
          <rect x="52" y="56" width="296" height="112" rx="5" fill="#0e1b17" stroke={accent} strokeOpacity="0.45" />
          <rect x="82" y="80" width="74" height="64" rx="3" fill={accent} fillOpacity="0.12" stroke={accent} strokeOpacity="0.7" />
          <path d="M178 92h48v22h36v26h44M178 126h38v20h42" fill="none" stroke={accent} strokeOpacity="0.45" strokeWidth="2" />
          <path d="M292 80v64M312 80v64" stroke="rgba(255,255,255,0.18)" />
          <circle cx="284" cy="146" r="4" fill={accent} fillOpacity="0.7" />
        </g>
      )}

      {variant === 'tube' && (
        <g>
          <rect x="82" y="54" width="72" height="124" rx="5" fill="#141b22" stroke={accent} strokeOpacity="0.45" />
          <rect x="164" y="54" width="72" height="124" rx="5" fill="#141b22" stroke={accent} strokeOpacity="0.45" />
          <rect x="246" y="54" width="72" height="124" rx="5" fill="#141b22" stroke={accent} strokeOpacity="0.45" />
          {[0, 1, 2].map((col) =>
            [0, 1, 2, 3].map((row) => (
              <g key={`${col}-${row}`}>
                <rect
                  x={94 + col * 82}
                  y={68 + row * 25}
                  width="48"
                  height="14"
                  rx="4"
                  fill={accent}
                  fillOpacity={0.1 + row * 0.03}
                  stroke={accent}
                  strokeOpacity="0.4"
                />
                <circle cx={100 + col * 82} cy={75 + row * 25} r="2" fill={accent} />
              </g>
            )),
          )}
        </g>
      )}

      {variant === 'desktop' && (
        <g>
          <rect x="118" y="48" width="164" height="112" rx="8" fill="#111924" stroke={accent} strokeOpacity="0.55" />
          <rect x="130" y="60" width="140" height="82" rx="3" fill={accent} fillOpacity="0.08" stroke={accent} strokeOpacity="0.3" />
          <path d="M172 160h56l8 18h-72z" fill="#1a2430" stroke="rgba(255,255,255,0.18)" />
          <path d="M156 178h88" stroke="rgba(255,255,255,0.25)" />
          <path d="M146 92h20v12h-20zM146 112h44v8h-44z" fill={accent} fillOpacity="0.3" />
        </g>
      )}

      {variant === 'model' && (
        <g>
          <path d="M76 168V64M76 168h252" stroke="rgba(255,255,255,0.28)" />
          <path d="M76 142c42 0 48-58 92-58s54 44 88 44 34-28 52-28" fill="none" stroke={accent} strokeWidth="2.5" />
          <path d="M76 154c46 0 58-22 102-22s44 22 80 22 44-12 66-12" fill="none" stroke={accent} strokeOpacity="0.3" />
          <circle cx="168" cy="84" r="4" fill={accent} />
          <circle cx="256" cy="128" r="4" fill={accent} />
        </g>
      )}

      {variant === 'software' && (
        <g>
          <rect x="96" y="58" width="208" height="112" rx="5" fill="#101720" stroke={accent} strokeOpacity="0.5" />
          <path d="M96 78h208" stroke="rgba(255,255,255,0.2)" />
          <circle cx="110" cy="68" r="3" fill={accent} fillOpacity="0.7" />
          <circle cx="120" cy="68" r="3" fill="rgba(255,255,255,0.3)" />
          <path d="M122 98h64M122 112h96M122 126h76M122 140h48" stroke={accent} strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      <text x="20" y="204" fill="rgba(255,255,255,0.28)" fontSize="9" fontFamily="monospace" letterSpacing="2">
        CS ATLAS / {label?.slice(0, 18).toUpperCase() || 'SYSTEM'}
      </text>
    </svg>
  );
}
