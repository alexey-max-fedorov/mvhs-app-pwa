import React from 'react';
import { cn } from '../utils/cn';

function EventCard({ summary, start, end, description }) {
  return (
    <div className="glass rounded-glass p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug">{summary}</p>
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
          {start === end ? start : `${start} – ${end}`}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export default function Calendar({ loading, events, error, options, selectedOption, onHandleChange }) {
  return (
    <div className="space-y-2">
      {/* Calendar selector */}
      {options && Object.keys(options).length > 1 && (
        <select
          value={selectedOption}
          onChange={onHandleChange}
          className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/[.08] text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          {Object.keys(options).map((name) => (
            <option key={name} value={name} className="bg-[#111113] text-foreground">
              {name}
            </option>
          ))}
        </select>
      )}

      {/* States */}
      {loading && (
        <div className="glass rounded-glass p-6 flex justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="glass rounded-glass p-4 text-sm text-muted-foreground text-center">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="glass rounded-glass p-6 text-center text-muted-foreground text-sm">
          No events today
        </div>
      )}

      {!loading && !error && events.map((event) => (
        <EventCard
          key={event.id}
          summary={event.summary}
          start={event.start}
          end={event.end}
          description={event.description}
        />
      ))}
    </div>
  );
}
