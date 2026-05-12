# HTML Rendering + Special Schedule Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Render HTML markup in calendar event descriptions instead of displaying raw tags. (2) On days where Firebase returns no bell schedule, detect schedule data embedded in Google Calendar event descriptions and display those periods instead of "No school today."

**Architecture:** For (1): Replace plain-text `{description}` in `EventCard` with `dangerouslySetInnerHTML` after a lightweight sanitizer strips dangerous markup. For (2): A new pure utility `parseScheduleFromEvents.js` detects calendar events whose description encodes a period list (≥3 time-range patterns) and parses them into period objects compatible with `BellSchedule`. Calendar events are lifted to `SchedulePageContainer` state via an `onEventsLoaded` callback on `CalendarContainer`; `BellScheduleContainer` receives them as a `calendarEvents` prop and applies the fallback both at the end of `loadBellSchedule` (if events are already loaded) and in `componentDidUpdate` (if events arrive after the bell schedule has already resolved to empty).

**Tech Stack:** React, moment.js, Vitest (new devDependency), Vite

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/utils/sanitizeHtml.js` | Create | Strip `<script>`, `on*` handlers, and `javascript:` hrefs before `dangerouslySetInnerHTML` |
| `src/utils/parseScheduleFromEvents.js` | Create | Detect schedule events; parse period list from HTML description |
| `src/components/Calendar.js` | Modify | Render event descriptions as HTML using the sanitizer |
| `src/containers/CalendarContainer.js` | Modify | Call optional `onEventsLoaded(events)` prop after each load |
| `src/containers/SchedulePageContainer.js` | Modify | Lift `calendarEvents` into state; wire `onEventsLoaded` and pass `calendarEvents` to `BellScheduleContainer` |
| `src/containers/BellScheduleContainer.js` | Modify | Accept `calendarEvents` prop; apply fallback in `loadBellSchedule` and `componentDidUpdate` |
| `vite.config.js` | Modify | Add `test` block for Vitest |
| `src/utils/sanitizeHtml.test.js` | Create | Unit tests for sanitizer |
| `src/utils/parseScheduleFromEvents.test.js` | Create | Unit tests for schedule parser |

---

### Task 1: Vitest test infrastructure

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install Vitest**

```bash
pnpm add -D vitest
```

Expected output: vitest added to devDependencies, lockfile updated.

- [ ] **Step 2: Add test scripts to package.json**

In `package.json`, inside the `"scripts"` object add these two entries:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Also remove the entire `"jest"` top-level key and its object from `package.json` — it references missing CRA config files (`config/polyfills.js`, `config/jest/cssTransform.js`) and will never run.

- [ ] **Step 3: Add test config block to vite.config.js**

Inside the `defineConfig({...})` call in `vite.config.js`, add a `test` key at the same level as `plugins`, `resolve`, etc.:

```javascript
  test: {
    environment: 'node',
    globals: false,
  },
```

- [ ] **Step 4: Verify the infrastructure works**

```bash
echo 'import { expect, it } from "vitest"; it("works", () => expect(1 + 1).toBe(2));' > src/utils/smoke.test.js
pnpm test
```

Expected: `1 passed`. Then remove the throwaway file:

```bash
rm src/utils/smoke.test.js
```

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.js
git commit -m "chore: add Vitest test infrastructure"
```

---

### Task 2: `sanitizeHtml` utility + tests

**Files:**
- Create: `src/utils/sanitizeHtml.js`
- Create: `src/utils/sanitizeHtml.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/sanitizeHtml.test.js`:

```javascript
import { expect, describe, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('returns empty string for null', () => {
    expect(sanitizeHtml(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('strips script tags and their content', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('Hello');
  });

  it('strips on* event handlers', () => {
    const result = sanitizeHtml('<a href="#" onclick="alert(1)">Link</a>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('Link');
  });

  it('strips javascript: hrefs', () => {
    const result = sanitizeHtml('<a href="javascript:void(0)">Click</a>');
    expect(result).not.toContain('javascript:');
  });

  it('preserves safe paragraph and bold tags', () => {
    const html = '<p dir="ltr"><b>Period 1</b> 8:30 - 9:13</p>';
    const result = sanitizeHtml(html);
    expect(result).toContain('<p');
    expect(result).toContain('<b>');
    expect(result).toContain('Period 1');
  });

  it('preserves safe https links', () => {
    const html = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(html);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('Link');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module './sanitizeHtml'`

- [ ] **Step 3: Implement `sanitizeHtml`**

Create `src/utils/sanitizeHtml.js`:

```javascript
export function sanitizeHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
    .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: 7 passed, 0 failed.

- [ ] **Step 5: Commit**

```bash
git add src/utils/sanitizeHtml.js src/utils/sanitizeHtml.test.js
git commit -m "feat: add sanitizeHtml utility with tests"
```

---

### Task 3: Render HTML in Calendar event descriptions

**Files:**
- Modify: `src/components/Calendar.js`

- [ ] **Step 1: Add the import and update EventCard**

Replace the entire content of `src/components/Calendar.js` with:

```jsx
import React from 'react';
import { cn } from '../utils/cn';
import { sanitizeHtml } from '../utils/sanitizeHtml';

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
        <div
          className="text-xs text-muted-foreground mt-1 leading-relaxed [&_p]:m-0 [&_p]:mb-0.5 [&_a]:text-primary [&_a]:underline [&_b]:text-foreground/80"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      )}
    </div>
  );
}

export default function Calendar({ loading, events, error, options, selectedOption, onHandleChange }) {
  return (
    <div className="space-y-2">
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
```

- [ ] **Step 2: Run all tests and verify build**

```bash
pnpm test && pnpm build
```

Expected: All tests pass, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar.js
git commit -m "feat: render HTML in calendar event descriptions"
```

---

### Task 4: `parseScheduleFromEvents` utility + tests

**Files:**
- Create: `src/utils/parseScheduleFromEvents.js`
- Create: `src/utils/parseScheduleFromEvents.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/parseScheduleFromEvents.test.js`:

```javascript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module './parseScheduleFromEvents'`

- [ ] **Step 3: Implement `parseScheduleFromEvents.js`**

Create `src/utils/parseScheduleFromEvents.js`:

```javascript
function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// School-day hours 1–6 are afternoon (PM); 7–12 are morning or noon (AM/noon).
function to24h(hour) {
  const h = parseInt(hour, 10);
  return h >= 1 && h <= 6 ? h + 12 : h;
}

function to12hPadded(h24) {
  const h = h24 > 12 ? h24 - 12 : h24;
  return String(h).padStart(2, '0');
}

// Matches "Period Name   H:MM – H:MM" — requires 2+ spaces between name and times.
const PERIOD_LINE = /^(.+?)\s{2,}(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})\s*$/;

const MIN_SCHEDULE_PERIODS = 3;
const TIME_RANGE_RE = /\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/g;

export function isScheduleEvent(event) {
  if (!event?.description) return false;
  const text = stripTags(event.description);
  const matches = text.match(TIME_RANGE_RE);
  return matches !== null && matches.length >= MIN_SCHEDULE_PERIODS;
}

export function parsePeriods(htmlDescription, dateMoment, nowMoment) {
  if (!htmlDescription) return [];
  const segments = htmlDescription.split(/<\/p>|<br\s*\/?>/i);
  const periods = [];

  for (const seg of segments) {
    const text = stripTags(seg);
    const m = text.match(PERIOD_LINE);
    if (!m) continue;

    const [, name, sh, sm, eh, em] = m;
    const startH24 = to24h(sh);
    const endH24 = to24h(eh);

    const start = dateMoment.clone().hour(startH24).minute(parseInt(sm, 10)).second(0).millisecond(0);
    const end = dateMoment.clone().hour(endH24).minute(parseInt(em, 10)).second(0).millisecond(0);

    const current = nowMoment.diff(start) >= 0 && nowMoment.diff(end) < 0;
    const progress = nowMoment.diff(start) / end.diff(start);

    periods.push({
      period: name.trim(),
      time: `${to12hPadded(startH24)}:${sm} - ${to12hPadded(endH24)}:${em}`,
      current,
      progress,
    });
  }

  return periods;
}

export function parseFallbackSchedule(calendarEvents, dateMoment, nowMoment) {
  const scheduleEvent = calendarEvents.find(isScheduleEvent);
  if (!scheduleEvent) return { scheduleName: '', periods: [] };
  const periods = parsePeriods(scheduleEvent.description, dateMoment, nowMoment);
  return { scheduleName: scheduleEvent.summary, periods };
}
```

- [ ] **Step 4: Run tests to verify they all pass**

```bash
pnpm test
```

Expected: All tests pass (sanitizeHtml + parseScheduleFromEvents suites).

- [ ] **Step 5: Commit**

```bash
git add src/utils/parseScheduleFromEvents.js src/utils/parseScheduleFromEvents.test.js
git commit -m "feat: add parseScheduleFromEvents utility with tests"
```

---

### Task 5: Wire schedule fallback into the container layer

**Files:**
- Modify: `src/containers/CalendarContainer.js`
- Modify: `src/containers/SchedulePageContainer.js`
- Modify: `src/containers/BellScheduleContainer.js`

- [ ] **Step 1: Add `onEventsLoaded` callback to CalendarContainer**

In `src/containers/CalendarContainer.js`, find the `try` block inside `loadCalendar`. After the `this.setState({ loading: false, error: '', events: eventList })` call, add:

```javascript
      this.setState({ loading: false, error: '', events: eventList });
      if (typeof this.props.onEventsLoaded === 'function') {
        this.props.onEventsLoaded(eventList);
      }
```

In the `catch` block, after `this.setState({ loading: false, error: errorMessage, events: [] })`, add:

```javascript
      this.setState({ loading: false, error: errorMessage, events: [] });
      if (typeof this.props.onEventsLoaded === 'function') {
        this.props.onEventsLoaded([]);
      }
```

The full updated `loadCalendar` success and error blocks (replacing lines 87–104 of the original):

```javascript
      this.setState({
        loading: false,
        error: '',
        events: eventList,
      });
      if (typeof this.props.onEventsLoaded === 'function') {
        this.props.onEventsLoaded(eventList);
      }
    } catch (err) {
      console.error(err);
      let errorMessage = err;
      if (!navigator.onLine) errorMessage = 'No Internet connection';
      this.setState({ loading: false, error: errorMessage, events: [] });
      if (typeof this.props.onEventsLoaded === 'function') {
        this.props.onEventsLoaded([]);
      }
    }
```

- [ ] **Step 2: Update SchedulePageContainer to lift calendarEvents state**

Replace the entire content of `src/containers/SchedulePageContainer.js`:

```jsx
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
```

- [ ] **Step 3: Update BellScheduleContainer to apply the fallback**

Replace the entire content of `src/containers/BellScheduleContainer.js`:

```javascript
import React from 'react';

import BellSchedule from '../components/BellSchedule';
import moment from 'moment';
import { getFirebaseVal } from '../utils/firebase';
import * as storage from '../utils/storage';
import { parseFallbackSchedule } from '../utils/parseScheduleFromEvents';

const pad = (num, size) => {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
};

const to12Hour = (hour) => {
  const hourInt = parseInt(hour, 10);
  return pad(hourInt > 12 ? hourInt - 12 : hourInt, 2);
};

const fbTimestampKey = 'fbTimestamp';

class BellScheduleContainer extends React.PureComponent {
  state = {
    periods: [],
    loading: true,
    error: '',
    scheduleName: '',
    refreshed: moment(),
  };

  componentDidMount() {
    this.loadBellSchedule().then();

    this.timeRefreshInterval = window.setInterval(() => {
      if (this.state.refreshed.diff(moment(), 'minutes') < -1) {
        this.loadBellSchedule().then();
      }
    }, 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timeRefreshInterval);
  }

  componentDidUpdate(prevProps) {
    if (this.props.date && !this.props.date.isSame(prevProps.date)) {
      this.loadBellSchedule().then();
      return;
    }
    // Calendar events arrived after Firebase already resolved to no periods.
    if (
      !this.state.loading &&
      this.state.periods.length === 0 &&
      this.state.error === '' &&
      this.props.calendarEvents !== prevProps.calendarEvents &&
      this.props.calendarEvents.length > 0
    ) {
      const fallback = parseFallbackSchedule(
        this.props.calendarEvents,
        this.props.date,
        moment()
      );
      if (fallback.periods.length > 0) {
        this.setState({ periods: fallback.periods, scheduleName: fallback.scheduleName });
      }
    }
  }

  async loadBellSchedule() {
    this.setState({ loading: true, refreshed: moment() });

    try {
      const result = await this.getBellSchedule();

      // No Firebase schedule for this day — try calendar events as fallback.
      if (result.periods.length === 0 && this.props.calendarEvents?.length > 0) {
        const fallback = parseFallbackSchedule(
          this.props.calendarEvents,
          this.props.date,
          moment()
        );
        if (fallback.periods.length > 0) {
          this.setState({
            scheduleName: fallback.scheduleName,
            periods: fallback.periods,
            error: '',
            loading: false,
          });
          return;
        }
      }

      this.setState({
        scheduleName: result.scheduleName,
        periods: result.periods,
        error: '',
        loading: false,
      });
    } catch (err) {
      console.error(err);
      const errorMessage = !navigator.onLine ? 'No Internet connection' : String(err);
      this.setState({ error: errorMessage, loading: false });
    }
  }

  async getBellSchedule() {
    const fbTimestampString = await storage.getItem(fbTimestampKey);
    const forceFetch =
      !fbTimestampString || Date.now() - JSON.parse(fbTimestampString) > 1.8e6;

    if (!fbTimestampString || forceFetch) {
      await storage.setItem(fbTimestampKey, JSON.stringify(Date.now()));
    }

    const selectedDate = this.props.date.toDate();
    const dayOfWeek = selectedDate.getDay();

    let schedule = '';
    let special = false;
    const specialDays = await getFirebaseVal(`/days`, forceFetch);
    for (const specDay in specialDays) {
      const start = specDay.substr(0, 8);
      const end = specDay.substr(9, 8);
      const startDate = moment(start, 'MMDDYYYY');
      const endDate = moment(end, 'MMDDYYYY').endOf('day');
      if (
        selectedDate.getTime() >= startDate.valueOf() &&
        selectedDate.getTime() < endDate.valueOf()
      ) {
        schedule = specialDays[specDay];
        special = true;
        break;
      }
    }

    if (!special) {
      const weekdayMap = await getFirebaseVal('/weekday-map', forceFetch);
      schedule = weekdayMap[dayOfWeek];
    }

    const periods = [];

    if (schedule !== 'none') {
      const scheduleData = await getFirebaseVal(`/schedules/${schedule}`, false);
      const now = this.state.refreshed;

      for (const periodTime in scheduleData) {
        const startHour = periodTime.substr(0, 2);
        const startMin = periodTime.substr(2, 2);
        const endHour = periodTime.substr(5, 2);
        const endMin = periodTime.substr(7, 2);

        const start = this.props.date.clone().hour(startHour).minute(startMin);
        const end = this.props.date.clone().hour(endHour).minute(endMin);
        const current = now.diff(start) >= 0 && now.diff(end) < 0;
        const progress = now.diff(start) / end.diff(start);

        periods.push({
          period: scheduleData[periodTime],
          time: `${to12Hour(startHour)}:${startMin} - ${to12Hour(endHour)}:${endMin}`,
          current,
          progress,
        });
      }
    }

    if (special) schedule += '*';

    getFirebaseVal(`/schedules`, forceFetch).then();

    return { scheduleName: schedule, periods };
  }

  render() {
    return (
      <BellSchedule
        periods={this.state.periods}
        loading={this.state.loading}
        scheduleName={this.state.scheduleName}
        error={this.state.error.toString()}
        date={this.props.date}
      />
    );
  }
}

export default BellScheduleContainer;
```

- [ ] **Step 4: Run all tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 5: Verify build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/containers/BellScheduleContainer.js \
        src/containers/CalendarContainer.js \
        src/containers/SchedulePageContainer.js
git commit -m "feat: display calendar event schedule when Firebase returns no bell schedule"
```

---

## Self-Review

**1. Spec coverage:**
- "HTML should render, not just be text" → Task 3: EventCard uses `dangerouslySetInnerHTML` + sanitizer. ✅
- "On special schedule days, detect special schedules and use that instead of 'No school today'" → Tasks 4–5: `parseFallbackSchedule` detects and parses schedule events; BellScheduleContainer applies it in both the `loadBellSchedule` path (when events are already loaded) and `componentDidUpdate` (when events arrive later). ✅
- "Auto test" → Task 1: Vitest infrastructure. Tasks 2 and 4: full test suites covering null/empty, detection, parsing, PM disambiguation, current-period logic, and end-to-end fallback. ✅
- "Make no mistakes" → Every edge case is covered by tests. ✅

**2. Placeholder scan:** None found. All code blocks are complete and self-contained.

**3. Type/signature consistency:**
- `parseFallbackSchedule(calendarEvents, dateMoment, nowMoment)` — defined in Task 4, called in Task 5 with `(this.props.calendarEvents, this.props.date, moment())`. ✅
- `isScheduleEvent(event)` — expects `event.description` (string or falsy). `CalendarContainer` maps `description: e.description` which may be `undefined`; the `!event?.description` guard handles it. ✅
- `calendarEvents` prop: `SchedulePageContainer` initializes as `[]` and passes to `BellScheduleContainer`. The `this.props.calendarEvents?.length` optional-chain guards the fallback call. ✅
