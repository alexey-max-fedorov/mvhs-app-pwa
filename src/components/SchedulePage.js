import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SchedulePage({ date, onDateChange, bellSchedule, calendar, weather }) {
  const isToday = date.isSame(new Date(), 'day');

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Date navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onDateChange(date.clone().subtract(1, 'day'))}
          className="p-2 rounded-full glass transition-colors hover:text-primary"
          aria-label="Previous day"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-semibold">
            {isToday ? 'Today' : date.format('dddd')}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{date.format('MMMM D, YYYY')}</p>
        </div>
        <button
          onClick={() => onDateChange(date.clone().add(1, 'day'))}
          className="p-2 rounded-full glass transition-colors hover:text-primary"
          aria-label="Next day"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weather */}
      {weather}

      {/* Bell schedule */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Bell Schedule
        </h2>
        {bellSchedule}
      </section>

      {/* Calendar events */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Events
        </h2>
        {calendar}
      </section>
    </div>
  );
}
