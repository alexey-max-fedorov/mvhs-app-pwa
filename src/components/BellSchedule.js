import React from 'react';
import { cn } from '../utils/cn';

function PeriodCard({ period }) {
  const pct = Math.min(100, Math.max(0, (period.progress ?? 0) * 100));
  return (
    <div
      className={cn(
        'glass rounded-glass p-3 transition-all duration-200',
        period.current && 'border-primary/30 shadow-amber-glow'
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('font-medium text-sm', period.current ? 'text-primary' : 'text-foreground')}>
          {period.period}
        </span>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {period.time}
        </span>
      </div>
      {period.current && (
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.max(1, pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BellSchedule({ periods, loading, scheduleName, error }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="glass rounded-glass p-3 animate-pulse h-12" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-glass p-6 text-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

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
      {periods.map((period, i) => (
        <PeriodCard key={period.period + i} period={period} />
      ))}
    </div>
  );
}
