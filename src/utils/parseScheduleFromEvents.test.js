import { expect, describe, it } from 'vitest';
import moment from 'moment';
import { isScheduleEvent, parsePeriods, parseFallbackSchedule } from './parseScheduleFromEvents';

// Representative HTML from a "Rally Schedule G - (all classes)" Google Calendar event.
const RALLY_HTML =
  '<p dir="ltr">Period 1   8:30 - 9:13</p>' +
  '<p dir="ltr"><b>Period 2A   9:20 - 10:03</b></p>' +
  '<p dir="ltr"><b>Period 2B   10:10 - 10:53</b></p>' +
  '<p dir="ltr">Brunch      10:53 - 11:01</p>' +
  '<p dir="ltr">Period 3   11:08 - 11:51</p>' +
  '<p dir="ltr">Period 4   11:58 - 12:41</p>' +
  '<p dir="ltr">Lunch   12:41 - 1:16</p>' +
  '<p dir="ltr">Period 5   1:23 - 2:06</p>' +
  '<p dir="ltr">Period 6   2:13 - 2:56</p>' +
  '<p dir="ltr">Period 7   3:03 - 3:46 </p>';

describe('isScheduleEvent', () => {
  it('returns false for event with no description property', () => {
    expect(isScheduleEvent({ summary: 'Track meet' })).toBe(false);
  });

  it('returns false for event with empty description', () => {
    expect(isScheduleEvent({ summary: 'Test', description: '' })).toBe(false);
  });

  it('returns false for regular events with no time-range patterns', () => {
    expect(isScheduleEvent({ summary: 'MVHS Prom', description: '<p>Join us for prom at 7pm!</p>' })).toBe(false);
  });

  it('returns false for events with fewer than 3 time-range patterns', () => {
    expect(isScheduleEvent({ summary: 'Event', description: '<p>8:30 - 9:00</p><p>9:10 - 10:00</p>' })).toBe(false);
  });

  it('returns true for events with 3 or more time-range patterns', () => {
    expect(isScheduleEvent({ summary: 'Rally Schedule G', description: RALLY_HTML })).toBe(true);
  });
});

describe('parsePeriods', () => {
  const date = moment('2026-05-18').startOf('day');
  const beforeSchool = date.clone().hour(8).minute(0);
  const duringP1 = date.clone().hour(8).minute(45);   // inside Period 1 (8:30–9:13)
  const duringLunch = date.clone().hour(12).minute(50); // inside Lunch (12:41–1:16 PM)
  const afterSchool = date.clone().hour(17).minute(0);

  it('returns empty array for empty HTML', () => {
    expect(parsePeriods('', date, beforeSchool)).toEqual([]);
  });

  it('returns correct period count for rally schedule', () => {
    const periods = parsePeriods(RALLY_HTML, date, beforeSchool);
    expect(periods).toHaveLength(10);
  });

  it('parses period names correctly', () => {
    const periods = parsePeriods(RALLY_HTML, date, beforeSchool);
    expect(periods[0].period).toBe('Period 1');
    expect(periods[1].period).toBe('Period 2A');
    expect(periods[2].period).toBe('Period 2B');
    expect(periods[3].period).toBe('Brunch');
    expect(periods[6].period).toBe('Lunch');
    expect(periods[9].period).toBe('Period 7');
  });

  it('formats AM times with zero-padded 12h hours', () => {
    const periods = parsePeriods(RALLY_HTML, date, beforeSchool);
    expect(periods[0].time).toBe('08:30 - 09:13'); // Period 1
    expect(periods[4].time).toBe('11:08 - 11:51'); // Period 3
  });

  it('converts afternoon hours (1–6) to PM and zero-pads them', () => {
    const periods = parsePeriods(RALLY_HTML, date, beforeSchool);
    expect(periods[6].time).toBe('12:41 - 01:16'); // Lunch: ends at 1:16 PM → 01:16
    expect(periods[7].time).toBe('01:23 - 02:06'); // Period 5
    expect(periods[9].time).toBe('03:03 - 03:46'); // Period 7
  });

  it('marks no period as current before school starts', () => {
    const periods = parsePeriods(RALLY_HTML, date, beforeSchool);
    expect(periods.every(p => !p.current)).toBe(true);
  });

  it('marks Period 1 as current at 8:45', () => {
    const periods = parsePeriods(RALLY_HTML, date, duringP1);
    expect(periods[0].current).toBe(true);
    expect(periods.filter(p => p.current)).toHaveLength(1);
  });

  it('marks Lunch as current at 12:50', () => {
    const periods = parsePeriods(RALLY_HTML, date, duringLunch);
    expect(periods[6].current).toBe(true);
    expect(periods.filter(p => p.current)).toHaveLength(1);
  });

  it('marks no period as current after school ends', () => {
    const periods = parsePeriods(RALLY_HTML, date, afterSchool);
    expect(periods.every(p => !p.current)).toBe(true);
  });

  it('progress is between 0 and 1 for the current period', () => {
    const periods = parsePeriods(RALLY_HTML, date, duringP1);
    expect(periods[0].progress).toBeGreaterThan(0);
    expect(periods[0].progress).toBeLessThan(1);
  });
});

describe('parseFallbackSchedule', () => {
  const date = moment('2026-05-18').startOf('day');
  const now = date.clone().hour(10).minute(0);

  it('returns empty result when no events have a schedule description', () => {
    const events = [
      { id: '1', summary: 'End of School Year Spirit Week', description: null },
      { id: '2', summary: 'MVHS Prom 2026', description: '<p>Join us at Coyote Ranch!</p>' },
    ];
    const result = parseFallbackSchedule(events, date, now);
    expect(result.periods).toHaveLength(0);
    expect(result.scheduleName).toBe('');
  });

  it('extracts schedule name and periods from the first matching event', () => {
    const events = [
      { id: '1', summary: 'End of School Year Spirit Week', description: null },
      { id: '2', summary: 'Rally Schedule G - (all classes)', description: RALLY_HTML },
    ];
    const result = parseFallbackSchedule(events, date, now);
    expect(result.periods.length).toBeGreaterThan(0);
    expect(result.scheduleName).toBe('Rally Schedule G - (all classes)');
  });

  it('uses the first matching event when multiple schedule events exist', () => {
    const events = [
      { id: '1', summary: 'Rally Schedule G', description: RALLY_HTML },
      { id: '2', summary: 'Other Schedule', description: RALLY_HTML },
    ];
    const result = parseFallbackSchedule(events, date, now);
    expect(result.scheduleName).toBe('Rally Schedule G');
  });
});
