function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
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
