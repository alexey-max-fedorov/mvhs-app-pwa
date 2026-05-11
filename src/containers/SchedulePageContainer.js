import React, { useState, useRef, useCallback } from 'react';
import moment from 'moment';
import SchedulePage from '../components/SchedulePage';
import BellScheduleContainer from './BellScheduleContainer';
import CalendarContainer from './CalendarContainer';
import WeatherContainer from './WeatherContainer';

export default function SchedulePageContainer() {
  const [date, setDate] = useState(() => moment());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const touchStartX = useRef(null);

  const handleDateChange = useCallback((newDate) => {
    setCalendarEvents([]); // Clear stale events before the new date's events load
    setDate(newDate);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      handleDateChange(date.clone().add(delta < 0 ? 1 : -1, 'day'));
    }
    touchStartX.current = null;
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <SchedulePage
        date={date}
        onDateChange={handleDateChange}
        bellSchedule={<BellScheduleContainer date={date} calendarEvents={calendarEvents} />}
        calendar={<CalendarContainer date={date} onEventsLoaded={setCalendarEvents} />}
        weather={<WeatherContainer />}
      />
    </div>
  );
}
