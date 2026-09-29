import { UserSettings } from '../types';

/**
 * Generates an iCalendar (.ics) file content for Winter Arc 2026
 * Configured for Apple Calendar import on iOS / macOS.
 */
export function generateWinterArcICS(settings: UserSettings): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Winter Arc//Winter Arc 2026 iOS System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Winter Arc 2026 Protocol',
    'X-WR-TIMEZONE:UTC',
  ];

  // Map schedule to weekly recurring events starting Oct 1, 2026 until Dec 31, 2026
  // Days: MO, TU, WE, TH, FR, SA, SU
  const gymDays: string[] = [];
  const runDays: string[] = [];

  const dayMap: Record<string, string> = {
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
    Saturday: 'SA',
    Sunday: 'SU',
  };

  for (const [day, type] of Object.entries(settings.preferredSchedule)) {
    if (type === 'Gym' && dayMap[day]) gymDays.push(dayMap[day]);
    if (type === 'Run' && dayMap[day]) runDays.push(dayMap[day]);
  }

  // 1. Gym recurring event
  if (gymDays.length > 0) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:winter-arc-gym-2026@winterarc.app`,
      `DTSTAMP:${dtstamp}`,
      'DTSTART:20261001T063000',
      'DTEND:20261001T074500',
      `RRULE:FREQ=WEEKLY;BYDAY=${gymDays.join(',')};UNTIL=20261231T235959Z`,
      'SUMMARY:🏋️ Gym Session (Winter Arc 4×/wk)',
      'DESCRIPTION:Disciplined hypertrophy/compound lifting session. Fuel with water only. Log workout in Winter Arc app.',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  // 2. Running recurring event
  if (runDays.length > 0) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:winter-arc-run-2026@winterarc.app`,
      `DTSTAMP:${dtstamp}`,
      'DTSTART:20261004T080000',
      'DTEND:20261004T084500',
      `RRULE:FREQ=WEEKLY;BYDAY=${runDays.join(',')};UNTIL=20261231T235959Z`,
      'SUMMARY:🏃 Winter Arc Aerobic Run (1×/wk)',
      'DESCRIPTION:Zone 2 / endurance baseline run. Maintain disciplined pacing.',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  // 3. Daily 30 min outdoor sunlight / walk
  lines.push(
    'BEGIN:VEVENT',
    `UID:winter-arc-outdoor-2026@winterarc.app`,
    `DTSTAMP:${dtstamp}`,
    'DTSTART:20261001T170000',
    'DTEND:20261001T173000',
    'RRULE:FREQ=DAILY;UNTIL=20261231T235959Z',
    'SUMMARY:❄️ 30 Min Outdoor Time (Winter Arc)',
    'DESCRIPTION:Fresh cold air and natural light exposure. Step count progress.',
    'STATUS:CONFIRMED',
    'END:VEVENT'
  );

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Downloads the .ics file to user's device
 */
export function downloadICSFile(settings: UserSettings): void {
  const icsData = generateWinterArcICS(settings);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Winter_Arc_2026_Schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats daily rules into Apple Reminders / Shareable checklist
 */
export function generateAppleRemindersText(dayNumber: number, dateStr: string): string {
  return `❄️ WINTER ARC 2026 — Day ${dayNumber}/92 (${dateStr})
Discipline Over Motivation

Daily Protocol:
[ ] 1. Only water (no sugar/alcohol)
[ ] 2. No junk food (unprocessed fuel)
[ ] 3. 7–8 hours sleep recovery
[ ] 4. Gym session (target: 4x/week)
[ ] 5. Running session (target: 1x/week)
[ ] 6. 10,000 steps daily
[ ] 7. 30 minutes outside daily
[ ] 8. No phone during meals (0/3)
[ ] 9. 10 minutes prayer / mindfulness
[ ] 10. 5 small wins recorded

Keep going.`;
}

/**
 * Share or copy checklist to iOS clipboard / Apple Reminders
 */
export async function shareToAppleReminders(dayNumber: number, dateStr: string): Promise<boolean> {
  const text = generateAppleRemindersText(dayNumber, dateStr);
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Winter Arc 2026 — Day ${dayNumber}`,
        text: text,
      });
      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Share failed', e);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed', err);
    return false;
  }
}
