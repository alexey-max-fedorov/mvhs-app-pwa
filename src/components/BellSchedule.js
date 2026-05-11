import React from 'react';
import { cn } from '../utils/cn';

function PeriodCard({ name, start, end, isCurrent, progress }) {
  return (
    <div
      className={cn(
        'glass rounded-glass p-3 transition-all duration-200',
        isCurrent && 'border-primary/30 shadow-amber-glow'
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('font-medium text-sm', isCurrent ? 'text-primary' : 'text-foreground')}>
          {name}
        </span>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {start} – {end}
        </span>
      </div>
      {isCurrent && (
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.max(1, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BellSchedule({ periods, currentPeriod, scheduleName }) {
  if (!periods || periods.length === 0) {
    return (
      <div className="glass rounded-glass p-6 text-center text-muted-foreground text-sm">
        No school today
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scheduleName && (
        <p className="text-xs text-muted-foreground px-1 mb-3">
          Schedule:{' '}
          <span className="text-foreground font-medium">{scheduleName}</span>
        </p>
      )}
      {periods.map((period) => (
        <PeriodCard
          key={period.name}
          name={period.name}
          start={period.start}
          end={period.end}
          isCurrent={currentPeriod?.name === period.name}
          progress={currentPeriod?.name === period.name ? currentPeriod.progress : 0}
        />
      ))}
    </div>
  );
}
