import React, { useState, useRef } from 'react';
import moment from 'moment';
import SchedulePage from '../components/SchedulePage';
import BellScheduleContainer from './BellScheduleContainer';
import CalendarContainer from './CalendarContainer';
import WeatherContainer from './WeatherContainer';

export default function SchedulePageContainer() {
  const [date, setDate] = useState(() => moment());
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      setDate((d) => d.clone().add(delta < 0 ? 1 : -1, 'day'));
    }
    touchStartX.current = null;
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <SchedulePage
        date={date}
        onDateChange={setDate}
        bellSchedule={<BellScheduleContainer date={date} />}
        calendar={<CalendarContainer date={date} />}
        weather={<WeatherContainer />}
      />
    </div>
  );
}
