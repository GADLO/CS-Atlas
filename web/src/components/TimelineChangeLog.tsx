import type { ReactNode } from 'react';

export interface PeriodTimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: ReactNode;
  active?: boolean;
  onSelect: () => void;
}

export interface LaneTimelineEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  active?: boolean;
  onSelect: () => void;
}

export interface LaneTimelineRow {
  id: string;
  label: string;
  count: number;
  entries: LaneTimelineEntry[];
}

type TimelineChangeLogProps =
  | {
      variant: 'periods';
      items: PeriodTimelineItem[];
    }
  | {
      variant: 'lanes';
      rows: LaneTimelineRow[];
      detail?: ReactNode;
    };

export function TimelineChangeLog(props: TimelineChangeLogProps) {
  if (props.variant === 'periods') {
    return (
      <section className="timeline-change-log timeline-change-log--periods" aria-label="时期">
        <div className="timeline-change-log__period-cards">
          {props.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`timeline-change-log__period-card ${item.active ? 'timeline-change-log__period-card--active' : ''}`}
              onClick={item.onSelect}
            >
              <div className="timeline-change-log__card-top">
                {item.icon}
                <span>{item.date}</span>
              </div>
              <div className="timeline-change-log__card-body">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const { rows, detail } = props;
  return (
    <section className="timeline-change-log timeline-change-log--lanes" aria-label="时间轴">
      <div className="timeline-change-log__lanes">
        {rows.map((row) => (
          <section className="timeline-change-log__lane" key={row.id}>
            <div className="timeline-change-log__lane-head">
              <strong>{row.label}</strong>
              <span>{row.count}</span>
            </div>
            <div className="timeline-change-log__scroll">
              <div className="timeline-change-log__track">
                {row.entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`timeline-change-log__entry ${entry.active ? 'timeline-change-log__entry--active' : ''}`}
                    onClick={entry.onSelect}
                  >
                    <span className="timeline-change-log__dot" aria-hidden="true" />
                    <strong>{entry.title}</strong>
                    <p>{entry.description}</p>
                    <span className="timeline-change-log__date">{entry.date}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
      {detail && <div className="timeline-change-log__detail">{detail}</div>}
    </section>
  );
}
