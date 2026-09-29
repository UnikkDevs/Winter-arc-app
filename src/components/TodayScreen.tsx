import React, { useState } from 'react';
import { DailyLog, UserSettings, ArcProgressStats } from '../types';
import {
  calculateDailyScore,
  getArcDayNumber,
  getWeeklyStats,
  formatLocalDate,
  parseLocalDate,
  ARC_START_DATE,
  ARC_END_DATE,
} from '../services/storage';
import {
  Droplets,
  Apple,
  Moon,
  Dumbbell,
  Flame,
  Footprints,
  Sun,
  UtensilsCrossed,
  Sparkles,
  Trophy,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Share2,
} from 'lucide-react';
import { WorkoutModal } from './modals/WorkoutModal';
import { RunModal } from './modals/RunModal';
import {
  SleepModal,
  StepsModal,
  WaterModal,
  OutsideModal,
  PrayerModal,
} from './modals/HabitModals';
import { shareToAppleReminders } from '../services/appleIntegrations';

interface TodayScreenProps {
  currentDateStr: string;
  onChangeDate: (newDate: string) => void;
  dailyLog: DailyLog;
  onUpdateDailyLog: (updated: DailyLog) => void;
  allLogs: Record<string, DailyLog>;
  settings: UserSettings;
  stats: ArcProgressStats;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  currentDateStr,
  onChangeDate,
  dailyLog,
  onUpdateDailyLog,
  allLogs,
  settings,
  stats,
}) => {
  // Modal states
  const [activeModal, setActiveModal] = useState<
    'workout' | 'run' | 'sleep' | 'steps' | 'water' | 'outside' | 'prayer' | null
  >(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const dayNumber = getArcDayNumber(currentDateStr, settings.startDate);
  const weeklyInfo = getWeeklyStats(currentDateStr, allLogs);

  // Calculate live daily score
  const dailyScore = calculateDailyScore(dailyLog, weeklyInfo.gymCount, weeklyInfo.runCount);

  // Navigate dates
  const handlePrevDay = () => {
    const d = parseLocalDate(currentDateStr);
    d.setDate(d.getDate() - 1);
    onChangeDate(formatLocalDate(d));
  };

  const handleNextDay = () => {
    const d = parseLocalDate(currentDateStr);
    d.setDate(d.getDate() + 1);
    onChangeDate(formatLocalDate(d));
  };

  // Rule 1: Water toggle
  const toggleWater = () => {
    const newCompleted = !dailyLog.water.completed;
    const updated: DailyLog = {
      ...dailyLog,
      water: {
        ...dailyLog.water,
        completed: newCompleted,
        glassesLogged: newCompleted ? Math.max(8, dailyLog.water.glassesLogged) : 0,
      },
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  // Rule 2: No Junk toggle
  const toggleNoJunk = () => {
    const updated: DailyLog = {
      ...dailyLog,
      noJunk: {
        completed: !dailyLog.noJunk.completed,
      },
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  // Rule 6: Steps toggle
  const toggleSteps = () => {
    const newCompleted = !dailyLog.steps.completed;
    const updated: DailyLog = {
      ...dailyLog,
      steps: {
        count: newCompleted ? Math.max(10000, dailyLog.steps.count) : 0,
        completed: newCompleted,
      },
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  // Rule 7: Outside toggle
  const toggleOutside = () => {
    const newCompleted = !dailyLog.outside.completed;
    const updated: DailyLog = {
      ...dailyLog,
      outside: {
        minutes: newCompleted ? Math.max(30, dailyLog.outside.minutes) : 0,
        completed: newCompleted,
      },
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  // Rule 8: Meals toggle
  const toggleMeal = (mealKey: 'breakfast' | 'lunch' | 'dinner') => {
    const currentMeals = { ...dailyLog.meals };
    currentMeals[mealKey] = !currentMeals[mealKey];
    currentMeals.completed = currentMeals.breakfast && currentMeals.lunch && currentMeals.dinner;

    const updated: DailyLog = {
      ...dailyLog,
      meals: currentMeals,
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  // Rule 9: Prayer toggle
  const togglePrayer = () => {
    const newCompleted = !dailyLog.prayer.completed;
    const updated: DailyLog = {
      ...dailyLog,
      prayer: {
        minutes: newCompleted ? Math.max(10, dailyLog.prayer.minutes) : 0,
        completed: newCompleted,
      },
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  // Rule 10: 5 Small Wins
  const toggleWinCheck = (index: number) => {
    const wins = [...dailyLog.smallWins];
    wins[index].completed = !wins[index].completed;
    const updated: DailyLog = {
      ...dailyLog,
      smallWins: wins,
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  const updateWinText = (index: number, text: string) => {
    const wins = [...dailyLog.smallWins];
    wins[index].text = text;
    // auto-complete if text is added and wasn't unchecked explicitly
    if (text.trim().length > 0 && !wins[index].completed) {
      wins[index].completed = true;
    }
    const updated: DailyLog = {
      ...dailyLog,
      smallWins: wins,
    };
    updated.dailyScore = calculateDailyScore(updated);
    onUpdateDailyLog(updated);
  };

  // Quick Share / Reminders
  const handleShareChecklist = async () => {
    const success = await shareToAppleReminders(dayNumber, currentDateStr);
    if (success) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Calculations for summary lines
  const totalSleepHours = dailyLog.sleep.hours + dailyLog.sleep.minutes / 60;
  const isSleepDone = dailyLog.sleep.completed || (totalSleepHours >= 7 && totalSleepHours <= 8.5);
  const mealsCount = (dailyLog.meals.breakfast ? 1 : 0) + (dailyLog.meals.lunch ? 1 : 0) + (dailyLog.meals.dinner ? 1 : 0);
  const checkedWinsCount = dailyLog.smallWins.filter((w) => w.completed && w.text.trim().length > 0).length;

  // Circular progress ring calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dailyScore / 100) * circumference;

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-md mx-auto text-left">
      {/* Date Switcher & Winter Arc Countdown Banner */}
      <div className="frost-card rounded-3xl p-3.5 flex items-center justify-between shadow-lg">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white active:scale-95 transition cursor-pointer"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold tracking-widest text-sky-400 uppercase">
            <span>❄️ WINTER ARC 2026</span>
          </div>
          <div className="text-xs font-bold text-white tracking-wide mt-0.5">
            {currentDateStr === formatLocalDate(new Date()) ? 'Today • ' : ''}
            {new Date(currentDateStr + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              weekday: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="text-[10px] font-mono text-neutral-400">
            {dayNumber > 0 && dayNumber <= 92
              ? `Day ${dayNumber} / 92 • ${92 - dayNumber} Days Left`
              : dayNumber <= 0
              ? `Pre-Season • Starts Oct 1, 2026`
              : `Winter Arc Completed`}
          </div>
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white active:scale-95 transition cursor-pointer"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Dashboard Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-neutral-950 border border-sky-500/20 p-5 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">❄️</span>
              <h1 className="text-xl font-black tracking-tight text-white uppercase font-sans">
                WINTER ARC
              </h1>
            </div>
            <p className="text-[11px] font-bold tracking-widest text-sky-400 uppercase mt-0.5">
              “DISCIPLINE OVER MOTIVATION”
            </p>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              October 1 – December 31, 2026
            </p>
          </div>

          <button
            onClick={handleShareChecklist}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-300 hover:text-white active:scale-95 transition cursor-pointer"
            title="Export / Share to Apple Reminders"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>{copiedShare ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Big Performance Ring & Key Metrics */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-800/80">
          <div className="flex items-center gap-4">
            {/* SVG Circular Progress */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="url(#arcGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-2xl font-black text-white">{dailyScore}%</span>
                <span className="text-[9px] uppercase font-bold text-neutral-400 -mt-1">
                  DAILY
                </span>
              </div>
            </div>

            {/* Streak & Weekly Progress */}
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  CURRENT STREAK
                </span>
                <span className="font-mono font-black text-white text-sm">
                  {stats.currentStreak} {stats.currentStreak === 1 ? 'DAY' : 'DAYS'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  THIS WEEK
                </span>
                <span className="font-mono font-black text-sky-400 text-sm">
                  {weeklyInfo.weeklyCompositeScore}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                DAYS COMPLETED
              </span>
              <span className="font-mono font-bold text-white">
                {stats.daysCompletedCount} / 92
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                TOTAL ARC
              </span>
              <span className="font-mono font-bold text-sky-400">
                {stats.overallArcCompletionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Status Lines (as specified in prompt) */}
        <div className="mt-5 p-3.5 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 space-y-1.5 font-mono text-[11px] text-neutral-300">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">WATER</span>
            <span className={dailyLog.water.completed ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
              {dailyLog.water.completed ? '✓ ONLY WATER' : `${dailyLog.water.glassesLogged}/8 glasses`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">NO JUNK</span>
            <span className={dailyLog.noJunk.completed ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
              {dailyLog.noJunk.completed ? '✓ UNPROCESSED' : 'PENDING'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">SLEEP</span>
            <span className={isSleepDone ? 'text-indigo-400 font-bold' : 'text-neutral-500'}>
              {dailyLog.sleep.hours}h {dailyLog.sleep.minutes}m (Target: 7–8h)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">GYM</span>
            <span className={weeklyInfo.gymCount >= 4 ? 'text-sky-400 font-bold' : 'text-neutral-300'}>
              {weeklyInfo.gymCount}/4 this week
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">RUN</span>
            <span className={weeklyInfo.runCount >= 1 ? 'text-orange-400 font-bold' : 'text-neutral-300'}>
              {weeklyInfo.runCount}/1 this week
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">STEPS</span>
            <span className={dailyLog.steps.count >= 10000 ? 'text-emerald-400 font-bold' : 'text-neutral-300'}>
              {dailyLog.steps.count.toLocaleString()} / 10,000
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">OUTSIDE</span>
            <span className={dailyLog.outside.minutes >= 30 ? 'text-amber-400 font-bold' : 'text-neutral-300'}>
              {dailyLog.outside.minutes}/30 min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">MEALS</span>
            <span className={mealsCount === 3 ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
              {mealsCount}/3 Phone-Free
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">PRAYER</span>
            <span className={dailyLog.prayer.minutes >= 10 ? 'text-purple-400 font-bold' : 'text-neutral-400'}>
              {dailyLog.prayer.minutes}/10 min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">SMALL WINS</span>
            <span className={checkedWinsCount === 5 ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
              {checkedWinsCount}/5 Completed
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">
          TODAY&apos;S 10 RULES
        </h2>
        <span className="text-[11px] font-mono font-bold text-sky-400">
          {dailyScore}% COMPLETED
        </span>
      </div>

      {/* 10 RULES CHECKLIST CARDS */}
      <div className="space-y-3">
        {/* 1. WATER */}
        <div className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleWater}
              className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 active:scale-95 transition cursor-pointer"
            >
              {dailyLog.water.completed ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <Droplets className="w-5 h-5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">1. Only water</span>
                {dailyLog.water.completed && (
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase">✓ MET</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Zero soda, alcohol, or juice • {dailyLog.water.glassesLogged} glasses logged
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('water')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          >
            Log Intake
          </button>
        </div>

        {/* 2. NO JUNK FOOD */}
        <div
          onClick={toggleNoJunk}
          className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">2. No junk food</span>
                {dailyLog.noJunk.completed && (
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase">✓ MET</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Single-ingredient, nutrient-dense whole foods
              </p>
            </div>
          </div>
          <div className="p-1">
            {dailyLog.noJunk.completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Circle className="w-6 h-6 text-neutral-600" />
            )}
          </div>
        </div>

        {/* 3. SLEEP */}
        <div className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal('sleep')}
              className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 active:scale-95 transition cursor-pointer"
            >
              <Moon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">3. 7–8 hr sleep</span>
                {isSleepDone && (
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase">✓ RECOVERED</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Duration: {dailyLog.sleep.hours}h {dailyLog.sleep.minutes}m • Target: 7–8 hours
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('sleep')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          >
            {dailyLog.sleep.hours > 0 ? `${dailyLog.sleep.hours}h` : 'Log Sleep'}
          </button>
        </div>

        {/* 4. GYM 4X / WEEK */}
        <div className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal('workout')}
              className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 active:scale-95 transition cursor-pointer"
            >
              <Dumbbell className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">4. Gym 4× / week</span>
                {dailyLog.gymCompleted && (
                  <span className="text-[10px] font-extrabold text-sky-400 uppercase">✓ TODAY</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Gym {weeklyInfo.gymCount}/4 this week • Weekly tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('workout')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-sky-300 hover:text-white transition cursor-pointer"
          >
            {dailyLog.workoutLog ? 'View Session' : '+ Log Workout'}
          </button>
        </div>

        {/* 5. RUNNING 1X / WEEK */}
        <div className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal('run')}
              className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 active:scale-95 transition cursor-pointer"
            >
              <Flame className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">5. Running 1× / week</span>
                {dailyLog.runCompleted && (
                  <span className="text-[10px] font-extrabold text-orange-400 uppercase">✓ TODAY</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Run {weeklyInfo.runCount}/1 this week • Aerobic engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('run')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-orange-300 hover:text-white transition cursor-pointer"
          >
            {dailyLog.runLog ? 'View Run' : '+ Log Run'}
          </button>
        </div>

        {/* 6. 10,000 STEPS */}
        <div className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSteps}
              className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 active:scale-95 transition cursor-pointer"
            >
              <Footprints className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">6. 10,000 steps</span>
                {dailyLog.steps.count >= 10000 && (
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase">✓ MET</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                {dailyLog.steps.count.toLocaleString()} / 10,000 steps
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('steps')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          >
            Update
          </button>
        </div>

        {/* 7. 30 MINUTES OUTSIDE */}
        <div className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleOutside}
              className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <Sun className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">7. 30 min outside</span>
                {dailyLog.outside.minutes >= 30 && (
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase">✓ MET</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                {dailyLog.outside.minutes} / 30 min outdoors
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('outside')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          >
            + Minutes
          </button>
        </div>

        {/* 8. NO PHONE DURING MEALS */}
        <div className="frost-card rounded-2xl p-4 space-y-3 transition hover:border-sky-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight">
                    8. No phone during meals
                  </span>
                  {mealsCount === 3 && (
                    <span className="text-[10px] font-extrabold text-teal-400 uppercase">✓ ALL 3</span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Mindful eating • Track each meal
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-neutral-300">
              {mealsCount} / 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/60">
            {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
              <button
                key={meal}
                type="button"
                onClick={() => toggleMeal(meal)}
                className={`py-2 px-2 rounded-xl text-center border text-[11px] font-semibold uppercase tracking-wider transition cursor-pointer ${
                  dailyLog.meals[meal]
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {dailyLog.meals[meal] ? '✓ ' : ''}
                {meal}
              </button>
            ))}
          </div>
        </div>

        {/* 9. 10 MIN PRAYER */}
        <div className="frost-card rounded-2xl p-4 flex items-center justify-between transition hover:border-sky-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePrayer}
              className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">9. 10 min prayer</span>
                {dailyLog.prayer.minutes >= 10 && (
                  <span className="text-[10px] font-extrabold text-purple-400 uppercase">✓ MET</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                {dailyLog.prayer.minutes} / 10 min reflection
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('prayer')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-purple-300 hover:text-white transition cursor-pointer"
          >
            Start Timer
          </button>
        </div>

        {/* 10. FIVE SMALL WINS */}
        <div className="frost-card rounded-2xl p-4 space-y-3 transition hover:border-sky-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight">10. 5 small wins</span>
                  {checkedWinsCount === 5 && (
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase">✓ STACKED</span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Daily discipline momentum ({checkedWinsCount}/5)
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">
              {checkedWinsCount} / 5
            </span>
          </div>

          <div className="space-y-2 pt-1 border-t border-neutral-800/60">
            {dailyLog.smallWins.map((win, idx) => (
              <div key={win.id} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleWinCheck(idx)}
                  className="text-neutral-500 hover:text-amber-400 transition cursor-pointer shrink-0"
                >
                  {win.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-600" />
                  )}
                </button>
                <input
                  type="text"
                  placeholder={`Win #${idx + 1} (e.g. Read 10 pages / Finished task)`}
                  value={win.text}
                  onChange={(e) => updateWinText(idx, e.target.value)}
                  className={`flex-1 rounded-xl bg-neutral-950/80 border border-neutral-800/80 px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 transition ${
                    win.completed ? 'line-through text-neutral-400' : ''
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Motivational Sign-off */}
      <div className="text-center pt-3 pb-6">
        <span className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase">
          “Keep going.”
        </span>
      </div>

      {/* MODALS */}
      {activeModal === 'workout' && (
        <WorkoutModal
          date={currentDateStr}
          initialLog={dailyLog.workoutLog}
          onSave={(workout) => {
            const updated: DailyLog = {
              ...dailyLog,
              gymCompleted: true,
              workoutLog: workout,
            };
            updated.dailyScore = calculateDailyScore(updated);
            onUpdateDailyLog(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'run' && (
        <RunModal
          date={currentDateStr}
          initialLog={dailyLog.runLog}
          onSave={(run) => {
            const updated: DailyLog = {
              ...dailyLog,
              runCompleted: true,
              runLog: run,
            };
            updated.dailyScore = calculateDailyScore(updated);
            onUpdateDailyLog(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'sleep' && (
        <SleepModal
          initialHours={dailyLog.sleep.hours}
          initialMinutes={dailyLog.sleep.minutes}
          onSave={(h, m, completed) => {
            const updated: DailyLog = {
              ...dailyLog,
              sleep: { hours: h, minutes: m, completed },
            };
            updated.dailyScore = calculateDailyScore(updated);
            onUpdateDailyLog(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'steps' && (
        <StepsModal
          initialSteps={dailyLog.steps.count}
          onSave={(count, completed) => {
            const updated: DailyLog = {
              ...dailyLog,
              steps: { count, completed },
            };
            updated.dailyScore = calculateDailyScore(updated);
            onUpdateDailyLog(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'water' && (
        <WaterModal
          initialGlasses={dailyLog.water.glassesLogged}
          initialCompleted={dailyLog.water.completed}
          onSave={(glasses, completed) => {
            const updated: DailyLog = {
              ...dailyLog,
              water: { glassesLogged: glasses, completed },
            };
            updated.dailyScore = calculateDailyScore(updated);
            onUpdateDailyLog(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'outside' && (
        <OutsideModal
          initialMinutes={dailyLog.outside.minutes}
          onSave={(minutes, completed) => {
            const updated: DailyLog = {
              ...dailyLog,
              outside: { minutes, completed },
            };
            updated.dailyScore = calculateDailyScore(updated);
            onUpdateDailyLog(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'prayer' && (
        <PrayerModal
          initialMinutes={dailyLog.prayer.minutes}
          onSave={(minutes, completed) => {
            const updated: DailyLog = {
              ...dailyLog,
              prayer: { minutes, completed },
            };
            updated.dailyScore = calculateDailyScore(updated);
            onUpdateDailyLog(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
