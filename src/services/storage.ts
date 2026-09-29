import { DailyLog, JournalEntry, UserSettings, ArcProgressStats } from '../types';

export const ARC_START_DATE = '2026-10-01';
export const ARC_END_DATE = '2026-12-31';
export const TOTAL_ARC_DAYS = 92;

export const DEFAULT_REMINDERS = [
  { id: 'rem-1', time: '06:30', label: 'Start the day • Winter Arc', enabled: true },
  { id: 'rem-2', time: '10:00', label: 'Hydration check • Water only', enabled: true },
  { id: 'rem-3', time: '13:00', label: 'Phone-free lunch • Mindful presence', enabled: true },
  { id: 'rem-4', time: '17:00', label: 'Outdoor time • 30 mins fresh air', enabled: true },
  { id: 'rem-5', time: '20:00', label: 'Review 5 small wins', enabled: true },
  { id: 'rem-6', time: '22:00', label: 'Sleep preparation • 7-8h recovery', enabled: true },
];

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Operator',
  startDate: ARC_START_DATE,
  endDate: ARC_END_DATE,
  totalDays: TOTAL_ARC_DAYS,
  gymWeeklyTarget: 4,
  runningWeeklyTarget: 1,
  stepsDailyTarget: 10000,
  sleepMinHours: 7,
  sleepMaxHours: 8,
  outdoorTargetMins: 30,
  prayerTargetMins: 10,
  waterTargetGlasses: 8,
  preferredSchedule: {
    Monday: 'Gym',
    Tuesday: 'Gym',
    Wednesday: 'Rest',
    Thursday: 'Gym',
    Friday: 'Rest',
    Saturday: 'Gym',
    Sunday: 'Run',
  },
  reminders: DEFAULT_REMINDERS,
  notificationsAllowed: false,
  theme: 'obsidian',
};

const STORAGE_KEYS = {
  SETTINGS: 'winter_arc_settings_v1',
  DAILY_LOGS: 'winter_arc_daily_logs_v1',
  JOURNALS: 'winter_arc_journals_v1',
  ACTIVE_DATE: 'winter_arc_active_date_v1',
};

// Date utility functions using local timezone (no UTC distortion)
export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function getTodayDateStr(): string {
  return formatLocalDate(new Date());
}

export function getDayDifference(dateStr1: string, dateStr2: string): number {
  const d1 = parseLocalDate(dateStr1);
  const d2 = parseLocalDate(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate which day of the Arc it is (1 to 92)
export function getArcDayNumber(dateStr: string, startDateStr = ARC_START_DATE): number {
  const diff = getDayDifference(startDateStr, dateStr);
  return diff + 1; // e.g. Oct 1 is Day 1
}

// Create blank log for a given date
export function createBlankDailyLog(dateStr: string): DailyLog {
  return {
    date: dateStr,
    water: { completed: false, glassesLogged: 0 },
    noJunk: { completed: false },
    sleep: { hours: 0, minutes: 0, completed: false },
    steps: { count: 0, completed: false },
    outside: { minutes: 0, completed: false },
    meals: { breakfast: false, lunch: false, dinner: false, completed: false },
    prayer: { minutes: 0, completed: false },
    smallWins: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
      { id: '3', text: '', completed: false },
      { id: '4', text: '', completed: false },
      { id: '5', text: '', completed: false },
    ],
    gymCompleted: false,
    runCompleted: false,
    dailyScore: 0,
    updatedAt: new Date().toISOString(),
  };
}

// Calculate daily score (0-100)
// The user instructed:
// "Calculate daily completion based on the ten rules.
// Do not allow weekly rules to unfairly reduce daily completion.
// For example:
// Gym and running should contribute according to their weekly targets.
// Display both: DAILY SCORE and WEEKLY SCORE"
export function calculateDailyScore(log: DailyLog, weeklyGymCount = 0, weeklyRunCount = 0): number {
  let points = 0;
  const maxCorePoints = 8; // 8 daily rules

  // 1. Water
  if (log.water.completed || log.water.glassesLogged >= 8) points += 1;

  // 2. No junk
  if (log.noJunk.completed) points += 1;

  // 3. Sleep (7-8 hours or completed)
  const totalSleepHours = log.sleep.hours + log.sleep.minutes / 60;
  if (log.sleep.completed || (totalSleepHours >= 7 && totalSleepHours <= 8.5)) points += 1;

  // 4. Steps (10,000 steps)
  if (log.steps.completed || log.steps.count >= 10000) points += 1;

  // 5. Outside (30 min)
  if (log.outside.completed || log.outside.minutes >= 30) points += 1;

  // 6. Phone-free meals (Breakfast, Lunch, Dinner - 1/3 each or all 3)
  const mealCount = (log.meals.breakfast ? 1 : 0) + (log.meals.lunch ? 1 : 0) + (log.meals.dinner ? 1 : 0);
  points += mealCount / 3;

  // 7. Prayer (10 min)
  if (log.prayer.completed || log.prayer.minutes >= 10) points += 1;

  // 8. 5 Small wins (0.2 per checked win)
  const checkedWins = log.smallWins.filter((w) => w.completed && w.text.trim().length > 0).length;
  points += checkedWins / 5;

  // Plus credit for gym/run done today without penalizing rest days:
  let totalAchieved = points;
  let totalPossible = maxCorePoints;

  // If a workout is logged or completed today, it boosts today's score
  if (log.gymCompleted || log.workoutLog) {
    totalAchieved += 1;
    totalPossible += 1;
  }
  if (log.runCompleted || log.runLog) {
    totalAchieved += 1;
    totalPossible += 1;
  }

  const score = Math.min(100, Math.round((totalAchieved / totalPossible) * 100));
  return score;
}

// Storage Operations
export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadAllDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load daily logs', e);
  }
  return {};
}

export function saveAllDailyLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save daily logs', e);
  }
}

export function loadDailyLog(dateStr: string): DailyLog {
  const all = loadAllDailyLogs();
  if (all[dateStr]) {
    return all[dateStr];
  }
  return createBlankDailyLog(dateStr);
}

export function saveDailyLog(log: DailyLog): void {
  const all = loadAllDailyLogs();
  all[log.date] = {
    ...log,
    updatedAt: new Date().toISOString(),
  };
  saveAllDailyLogs(all);
}

export function loadAllJournals(): Record<string, JournalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load journals', e);
  }
  return {};
}

export function saveJournal(entry: JournalEntry): void {
  try {
    const all = loadAllJournals();
    all[entry.date] = {
      ...entry,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save journal', e);
  }
}

export function loadJournal(dateStr: string): JournalEntry {
  const all = loadAllJournals();
  if (all[dateStr]) {
    return all[dateStr];
  }
  return {
    date: dateStr,
    howDayWent: '',
    fiveWinsText: '',
    wentWell: '',
    wentPoorly: '',
    improveTomorrow: '',
    updatedAt: new Date().toISOString(),
  };
}

// Get the Monday of the current week for a date
export function getWeekRange(dateStr: string): { start: string; end: string; dates: string[] } {
  const d = parseLocalDate(dateStr);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    dates.push(formatLocalDate(current));
  }

  return {
    start: dates[0],
    end: dates[6],
    dates,
  };
}

// Calculate weekly statistics
export function getWeeklyStats(dateStr: string, allLogs: Record<string, DailyLog>) {
  const { dates } = getWeekRange(dateStr);
  let gymCount = 0;
  let runCount = 0;
  let totalScoreSum = 0;
  let daysWithData = 0;

  for (const d of dates) {
    const log = allLogs[d];
    if (log) {
      if (log.gymCompleted || log.workoutLog) gymCount++;
      if (log.runCompleted || log.runLog) runCount++;
      totalScoreSum += log.dailyScore || 0;
      daysWithData++;
    }
  }

  const gymProgress = Math.min(100, Math.round((gymCount / 4) * 100));
  const runProgress = Math.min(100, Math.round((runCount / 1) * 100));
  
  // Weekly composite score: 60% daily rule consistency + 30% gym weekly goal + 10% running goal
  const dailyAverage = daysWithData > 0 ? totalScoreSum / daysWithData : 0;
  const weeklyCompositeScore = Math.round(
    dailyAverage * 0.6 + gymProgress * 0.3 + runProgress * 0.1
  );

  return {
    gymCount,
    runCount,
    gymProgress,
    runProgress,
    weeklyCompositeScore,
    daysWithData,
    dates,
  };
}

// Calculate comprehensive streak and Arc metrics
export function calculateArcStats(
  selectedDateStr: string,
  settings: UserSettings,
  allLogs: Record<string, DailyLog>
): ArcProgressStats {
  const totalDays = settings.totalDays || TOTAL_ARC_DAYS;
  const currentDayNumber = Math.max(1, Math.min(totalDays, getArcDayNumber(selectedDateStr, settings.startDate)));
  const daysRemaining = Math.max(0, totalDays - currentDayNumber);

  // Generate list of all dates from startDate up to selectedDate
  const startDate = parseLocalDate(settings.startDate);
  const endDate = parseLocalDate(settings.endDate);
  const selectedDate = parseLocalDate(selectedDateStr);

  const pastDates: string[] = [];
  const curr = new Date(startDate);
  while (curr <= selectedDate && curr <= endDate) {
    pastDates.push(formatLocalDate(curr));
    curr.setDate(curr.getDate() + 1);
  }

  let daysCompletedCount = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const ruleSuccessCounts: Record<string, number> = {
    water: 0,
    noJunk: 0,
    sleep: 0,
    steps: 0,
    outside: 0,
    meals: 0,
    prayer: 0,
    wins: 0,
    gym: 0,
    run: 0,
  };

  for (let i = 0; i < pastDates.length; i++) {
    const dStr = pastDates[i];
    const log = allLogs[dStr];
    const isCompleted = log && (log.dailyScore >= 70);

    if (isCompleted) {
      daysCompletedCount++;
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      // Missed day. "Reset and continue today"
      tempStreak = 0;
    }

    if (log) {
      if (log.water.completed || log.water.glassesLogged >= 8) ruleSuccessCounts.water++;
      if (log.noJunk.completed) ruleSuccessCounts.noJunk++;
      const sleepHours = log.sleep.hours + log.sleep.minutes / 60;
      if (log.sleep.completed || (sleepHours >= 7 && sleepHours <= 8.5)) ruleSuccessCounts.sleep++;
      if (log.steps.completed || log.steps.count >= 10000) ruleSuccessCounts.steps++;
      if (log.outside.completed || log.outside.minutes >= 30) ruleSuccessCounts.outside++;
      if (log.meals.completed || (log.meals.breakfast && log.meals.lunch && log.meals.dinner)) ruleSuccessCounts.meals++;
      if (log.prayer.completed || log.prayer.minutes >= 10) ruleSuccessCounts.prayer++;
      const winsCount = log.smallWins.filter((w) => w.completed && w.text.trim().length > 0).length;
      if (winsCount >= 5) ruleSuccessCounts.wins++;
      if (log.gymCompleted || log.workoutLog) ruleSuccessCounts.gym++;
      if (log.runCompleted || log.runLog) ruleSuccessCounts.run++;
    }
  }

  currentStreak = tempStreak;

  const totalTrackedDays = Math.max(1, pastDates.length);
  const ruleAdherence: Record<string, number> = {};
  for (const [key, val] of Object.entries(ruleSuccessCounts)) {
    ruleAdherence[key] = Math.round((val / totalTrackedDays) * 100);
  }

  const overallArcCompletionRate = Math.round((daysCompletedCount / totalDays) * 100);

  const weeklyInfo = getWeeklyStats(selectedDateStr, allLogs);

  return {
    currentDayNumber,
    totalDays,
    daysRemaining,
    daysCompletedCount,
    currentStreak,
    longestStreak,
    overallArcCompletionRate,
    weeklyCompletionRate: weeklyInfo.weeklyCompositeScore,
    monthlyCompletionRate: Math.min(100, Math.round((daysCompletedCount / Math.max(1, pastDates.length)) * 100)),
    ruleAdherence,
  };
}

// Seed mock data for demonstration if user wants realistic history
export function seedSampleWinterArcData(): void {
  const logs: Record<string, DailyLog> = {};
  const journals: Record<string, JournalEntry> = {};

  const baseDate = parseLocalDate(ARC_START_DATE);
  // Seed first 14 days with realistic disciplined progress
  for (let i = 0; i < 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = formatLocalDate(d);

    const isGymDay = [0, 1, 3, 5].includes(i % 7);
    const isRunDay = i % 7 === 6;

    const log: DailyLog = {
      date: dateStr,
      water: { completed: true, glassesLogged: 8 + (i % 3) },
      noJunk: { completed: i !== 8 },
      sleep: { hours: 7, minutes: 30 + (i % 20), completed: true },
      steps: { count: 10400 + (i * 210) % 2500, completed: true },
      outside: { minutes: 35 + (i % 15), completed: true },
      meals: { breakfast: true, lunch: true, dinner: true, completed: true },
      prayer: { minutes: 10 + (i % 5), completed: true },
      smallWins: [
        { id: '1', text: 'Woke at 05:45 without snoozing', completed: true },
        { id: '2', text: isGymDay ? 'Heavy squat session + mobility' : 'Read 20 pages deep work', completed: true },
        { id: '3', text: 'Drank 3.2L pristine water', completed: true },
        { id: '4', text: 'Outdoor midday walk in the cold', completed: true },
        { id: '5', text: 'No phone during dinner with family', completed: true },
      ],
      gymCompleted: isGymDay,
      runCompleted: isRunDay,
      workoutLog: isGymDay
        ? {
            id: `w-${i}`,
            date: dateStr,
            title: i % 2 === 0 ? 'Upper Body Compound Power' : 'Lower Body Strength',
            splitType: i % 2 === 0 ? 'Upper' : 'Lower',
            durationMinutes: 55,
            exercises: [
              { id: 'e1', name: 'Barbell Bench Press', sets: 4, reps: '6-8', weight: '95 kg' },
              { id: 'e2', name: 'Barbell Rows', sets: 4, reps: '8', weight: '80 kg' },
            ],
          }
        : undefined,
      runLog: isRunDay
        ? {
            id: `r-${i}`,
            date: dateStr,
            distanceKm: 5.2,
            durationMinutes: 28,
            paceMinPerKm: '5:23 /km',
          }
        : undefined,
      dailyScore: 0,
      updatedAt: new Date().toISOString(),
    };

    log.dailyScore = calculateDailyScore(log);
    logs[dateStr] = log;

    journals[dateStr] = {
      date: dateStr,
      howDayWent: 'High focus and unbroken discipline. The cold air kept my mind razor sharp.',
      fiveWinsText: 'Woke early, completed training, protected sleep window, no screen meals, executed work.',
      wentWell: 'Maintained zero junk food protocol effortlessly.',
      wentPoorly: 'Felt slight afternoon fatigue around 3 PM, overcame with cold water.',
      improveTomorrow: 'Prep gym clothes the night before to eliminate friction.',
      coachFeedback: 'Solid execution. Consistency on water and sleep is cementing your foundation.',
      updatedAt: new Date().toISOString(),
    };
  }

  saveAllDailyLogs(logs);
  for (const j of Object.values(journals)) {
    saveJournal(j);
  }
}

// Export / Import / Reset
export function exportAllData(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings: loadSettings(),
    dailyLogs: loadAllDailyLogs(),
    journals: loadAllJournals(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.settings) saveSettings(data.settings);
    if (data.dailyLogs) saveAllDailyLogs(data.dailyLogs);
    if (data.journals) {
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(data.journals));
    }
    return true;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
  localStorage.removeItem(STORAGE_KEYS.JOURNALS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
