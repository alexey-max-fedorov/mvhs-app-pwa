'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import moment from 'moment';

function MiniCalendar({ date, onSelect, onClose }) {
  const [viewMonth, setViewMonth] = useState(() => date.clone().startOf('month'));
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [onClose]);

  const startOfMonth = viewMonth.clone().startOf('month');
  const daysInMonth = viewMonth.daysInMonth();
  const startDow = startOfMonth.day(); // 0 = Sunday

  const days = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const isSelected = (d) =>
    d && viewMonth.year() === date.year() && viewMonth.month() === date.month() && d === date.date();

  const isToday = (d) => {
    const now = new Date();
    return d && viewMonth.year() === now.getFullYear() && viewMonth.month() === now.getMonth() && d === now.getDate();
  };

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 glass rounded-glass shadow-lg p-3 w-72 select-none"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth((m) => m.clone().subtract(1, 'month'))}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold">{viewMonth.format('MMMM YYYY')}</p>
        <button
          onClick={() => setViewMonth((m) => m.clone().add(1, 'month'))}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((d, i) => {
          const selected = isSelected(d);
          const todayMark = isToday(d);
          return (
            <button
              key={i}
              disabled={!d}
              onClick={() => {
                if (!d) return;
                const picked = viewMonth.clone().date(d);
                onSelect(picked);
                onClose();
              }}
              className={[
                'h-8 w-8 mx-auto rounded-full text-xs font-medium transition-colors',
                !d ? 'invisible' : '',
                selected
                  ? 'bg-primary text-black font-bold'
                  : todayMark
                  ? 'border border-primary/60 text-primary'
                  : 'hover:bg-white/10 text-foreground',
              ].join(' ')}
              aria-label={d ? viewMonth.clone().date(d).format('MMMM D, YYYY') : undefined}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Jump to today */}
      <div className="mt-3 border-t border-white/[.08] pt-2 text-center">
        <button
          onClick={() => {
            onSelect(moment().startOf('day'));
            onClose();
          }}
          className="text-xs text-primary hover:underline"
        >
          Today
        </button>
      </div>
    </div>
  );
}

export default function SchedulePage({ date, onDateChange, bellSchedule, calendar, weather }) {
  const [showPicker, setShowPicker] = useState(false);
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

        <div className="relative">
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="text-center px-3 py-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors group"
            aria-label="Open date picker"
          >
            <p className="font-semibold flex items-center gap-1.5 justify-center">
              {isToday ? 'Today' : date.format('dddd')}
              <Calendar size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{date.format('MMMM D, YYYY')}</p>
          </button>

          {showPicker && (
            <MiniCalendar
              date={date}
              onSelect={onDateChange}
              onClose={() => setShowPicker(false)}
            />
          )}
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
