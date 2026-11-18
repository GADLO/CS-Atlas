import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes, Brain, Code2, Cpu, Gauge, MemoryStick } from 'lucide-react';
import type { EntitySummary } from '../lib/types';
import { TechDiagram } from './TechDiagram';
import { Badge } from './ui';

const typeLabels: Record<EntitySummary['type'], string> = {
  hardware: '硬件',
  software: '软件',
  model: '模型',
  ai: 'AI',
};

const iconMap = {
  cpu: Cpu,
  chip: Cpu,
  gpu: Boxes,
  memory: MemoryStick,
  cache: MemoryStick,
  model: Gauge,
  tool: Code2,
  ai: Brain,
};

export function entityHref(entity: Pick<EntitySummary, 'slug' | 'type'>): string {
  return entity.type === 'hardware' ? `/machine/${entity.slug}` : `/entity/${entity.slug}`;
}

export function EntityCard({
  entity,
  compact = false,
}: {
  entity: EntitySummary;
  compact?: boolean;
}) {
  const Icon = iconMap[entity.icon as keyof typeof iconMap] || Cpu;
  return (
    <Link to={entityHref(entity)} className={`entity-card ${compact ? 'entity-card--compact' : ''}`}>
      <div className="entity-card__visual" style={{ '--entity-accent': entity.accent } as CSSProperties}>
        <TechDiagram accent={entity.accent} icon={entity.icon} label={entity.name} />
        <div className="entity-card__badges">
          <Badge tone={entity.type === 'ai' ? 'violet' : entity.type === 'model' ? 'warn' : 'accent'}>
            {typeLabels[entity.type]}
          </Badge>
          <span className="entity-card__category">{entity.category}</span>
        </div>
      </div>
      <div className="entity-card__body">
        <div className="entity-card__title-row">
          <h3>{entity.name}</h3>
          <ArrowUpRight size={16} aria-hidden="true" />
        </div>
        <div className="entity-card__en">{entity.nameEn}</div>
        <p>{entity.summary}</p>
        {!compact && (
          <div className="entity-card__footer">
            <span className="entity-card__icon">
              <Icon size={14} aria-hidden="true" />
              {entity.category}
            </span>
            <span className="entity-card__slug">{entity.slug}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
