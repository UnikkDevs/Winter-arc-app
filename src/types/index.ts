export interface WinItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MealTracking {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  title: string;
  splitType: 'Upper' | 'Lower' | 'Push' | 'Pull' | 'Legs' | 'Full Body' | 'Cardio/Mobility';
  durationMinutes: number;
  notes?: string;
  exercises?: ExerciseLog[];
}

export interface RunLog {
  id: string;
  date: string;
  distanceKm: number;
  durationMinutes: number;
  paceMinPerKm?: string;
  notes?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  water: {
    completed: boolean;
    glassesLogged: number; // target: 8+ (or 2-3L)
  };
  noJunk: {
    completed: boolean;
  };
  sleep: {
    hours: number; // e.g. 7.5
    minutes: number;
    completed: boolean;
  };
  steps: {
    count: number;
    completed: boolean;
  };
  outside: {
    minutes: number;
    completed: boolean;
  };
  meals: MealTracking;
  prayer: {
    minutes: number;
    completed: boolean;
  };
  smallWins: WinItem[];
  gymCompleted: boolean;
  runCompleted: boolean;
  workoutLog?: WorkoutLog;
  runLog?: RunLog;
  dailyScore: number; // 0 to 100
  updatedAt: string;
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  howDayWent: string;
  fiveWinsText: string;
  wentWell: string;
  wentPoorly: string;
  improveTomorrow: string;
  coachFeedback?: string;
  updatedAt: string;
}

export interface ReminderSetting {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

export interface UserSettings {
  userName: string;
  startDate: string; // '2026-10-01'
  endDate: string; // '2026-12-31'
  totalDays: number; // 92
  gymWeeklyTarget: number; // 4
  runningWeeklyTarget: number; // 1
  stepsDailyTarget: number; // 10000
  sleepMinHours: number; // 7
  sleepMaxHours: number; // 8
  outdoorTargetMins: number; // 30
  prayerTargetMins: number; // 10
  waterTargetGlasses: number; // 8
  preferredSchedule: {
    Monday: 'Gym' | 'Run' | 'Rest';
    Tuesday: 'Gym' | 'Run' | 'Rest';
    Wednesday: 'Gym' | 'Run' | 'Rest';
    Thursday: 'Gym' | 'Run' | 'Rest';
    Friday: 'Gym' | 'Run' | 'Rest';
    Saturday: 'Gym' | 'Run' | 'Rest';
    Sunday: 'Gym' | 'Run' | 'Rest';
  };
  reminders: ReminderSetting[];
  notificationsAllowed: boolean;
  theme: 'obsidian' | 'pure-black';
}

export interface ArcProgressStats {
  currentDayNumber: number;
  totalDays: number;
  daysRemaining: number;
  daysCompletedCount: number;
  currentStreak: number;
  longestStreak: number;
  overallArcCompletionRate: number; // percentage
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  ruleAdherence: Record<string, number>; // ruleKey -> percentage (0-100)
}
