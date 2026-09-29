import React, { useState } from 'react';
import { DailyLog, UserSettings, ArcProgressStats } from '../types';
import {
  parseLocalDate,
  formatLocalDate,
  ARC_START_DATE,
  ARC_END_DATE,
  getArcDayNumber,
} from '../services/storage';
import {
  Flame,
  Award,
  Calendar as CalendarIcon,
  Activity,
  CheckCircle,
  TrendingUp,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface ProgressScreenProps {
  allLogs: Record<string, DailyLog>;
  settings: UserSettings;
  stats: ArcProgressStats;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  allLogs,
  settings,
  stats,
  selectedDateStr,
  onSelectDate,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<
    'completion' | 'weekly' | 'steps' | 'sleep' | 'gym' | 'running' | 'outside'
  >('completion');

  // Build full 92-day calendar array
  const fullCalendarDays: Array<{
    dateStr: string;
    dayNum: number;
    log?: DailyLog;
    score: number;
    isPast: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  const start = parseLocalDate(settings.startDate);
  const end = parseLocalDate(settings.endDate);
  const todayStr = formatLocalDate(new Date());

  const current = new Date(start);
  let dayCounter = 1;
  while (current <= end) {
    const dStr = formatLocalDate(current);
    const log = allLogs[dStr];
    const score = log?.dailyScore || 0;
    const isPast = dStr <= todayStr;
    const isToday = dStr === todayStr;
    const isSelected = dStr === selectedDateStr;

    fullCalendarDays.push({
      dateStr: dStr,
      dayNum: dayCounter,
      log,
      score,
      isPast,
      isToday,
      isSelected,
    });

    current.setDate(current.getDate() + 1);
    dayCounter++;
  }

  // Calculate missed days
  const missedDaysCount = fullCalendarDays.filter(
    (d) => d.isPast && d.score > 0 && d.score < 70
  ).length;

  // Rule adherence display labels & icons
  const ruleDisplayConfig = [
    { key: 'water', label: '1. Water Only', color: 'bg-cyan-500' },
    { key: 'noJunk', label: '2. No Junk Food', color: 'bg-emerald-500' },
    { key: 'sleep', label: '3. 7–8hr Sleep', color: 'bg-indigo-500' },
    { key: 'gym', label: '4. Gym 4×/wk', color: 'bg-sky-500' },
    { key: 'run', label: '5. Running 1×/wk', color: 'bg-orange-500' },
    { key: 'steps', label: '6. 10,000 Steps', color: 'bg-emerald-400' },
    { key: 'outside', label: '7. 30m Outside', color: 'bg-amber-500' },
    { key: 'meals', label: '8. Phone-Free Meals', color: 'bg-teal-500' },
    { key: 'prayer', label: '9. 10m Prayer', color: 'bg-purple-500' },
    { key: 'wins', label: '10. 5 Small Wins', color: 'bg-yellow-500' },
  ];

  // Helper for last 14 days data for mini charts
  const recentDays = fullCalendarDays
    .filter((d) => d.isPast || d.dayNum <= 14)
    .slice(0, 14);

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-md mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white font-sans">
            PERFORMANCE METRICS
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Winter Arc Adherence & Analytics
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Streak */}
        <div className="frost-card rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              CURRENT STREAK
            </span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">
            {stats.currentStreak}{' '}
            <span className="text-xs font-normal text-neutral-400">DAYS</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            Unbroken disciplined days
          </p>
        </div>

        {/* Longest Streak */}
        <div className="frost-card rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              LONGEST STREAK
            </span>
            <Award className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">
            {stats.longestStreak}{' '}
            <span className="text-xs font-normal text-neutral-400">DAYS</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">Peak momentum milestone</p>
        </div>

        {/* Days Completed */}
        <div className="frost-card rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              DAYS COMPLETED
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">
            {stats.daysCompletedCount}{' '}
            <span className="text-xs font-normal text-neutral-400">/ 92</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-400 h-1.5 rounded-full"
              style={{ width: `${stats.overallArcCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Total Arc % */}
        <div className="frost-card rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              ARC COMPLETION
            </span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono text-2xl font-black text-sky-400">
            {stats.overallArcCompletionRate}%
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            {stats.daysRemaining} days remaining in 2026
          </p>
        </div>
      </div>

      {/* Reset & Continue Philosophy Card */}
      <div className="frost-card rounded-2xl p-4 border border-sky-500/20 bg-gradient-to-r from-sky-950/20 to-neutral-900">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              “Reset and Continue” Philosophy
            </h3>
            <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
              {missedDaysCount > 0
                ? `${missedDaysCount} missed ${
                    missedDaysCount === 1 ? 'day' : 'days'
                  }. Missed day. Continue today.`
                : 'Zero shame, pure execution. If a target is missed, you do not abandon the protocol — you reset at midnight and execute today.'}
            </p>
          </div>
        </div>
      </div>

      {/* 92-DAY CALENDAR HEATMAP */}
      <div className="frost-card rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
              92-DAY CALENDAR HEATMAP
            </h2>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Oct 1 – Dec 31
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-[9px] font-mono text-neutral-400 pb-1">
          <span>0%</span>
          <div className="w-2.5 h-2.5 rounded bg-neutral-800" />
          <div className="w-2.5 h-2.5 rounded bg-sky-950 border border-sky-800" />
          <div className="w-2.5 h-2.5 rounded bg-sky-600" />
          <div className="w-2.5 h-2.5 rounded bg-sky-400 shadow-sm shadow-sky-400" />
          <span>100%</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {fullCalendarDays.map((day) => {
            // Determine heat color
            let bgClass = 'bg-neutral-900 border border-neutral-800 text-neutral-600';
            if (day.score >= 85) {
              bgClass = 'bg-sky-400 text-black font-extrabold shadow-sm shadow-sky-400/50';
            } else if (day.score >= 70) {
              bgClass = 'bg-sky-600 text-white font-bold';
            } else if (day.score >= 40) {
              bgClass = 'bg-sky-950 border border-sky-700 text-sky-200';
            } else if (day.score > 0) {
              bgClass = 'bg-neutral-800 text-neutral-400';
            }

            const isSelected = day.dateStr === selectedDateStr;

            return (
              <button
                key={day.dateStr}
                onClick={() => onSelectDate(day.dateStr)}
                className={`relative flex flex-col items-center justify-center h-10 rounded-xl transition cursor-pointer ${bgClass} ${
                  isSelected ? 'ring-2 ring-white scale-105 z-10' : 'hover:opacity-90'
                }`}
                title={`Day ${day.dayNum} (${day.dateStr}): ${day.score}%`}
              >
                <span className="text-[10px] font-mono leading-none">
                  {day.dayNum}
                </span>
                {day.score > 0 && (
                  <span className="text-[8px] font-mono opacity-80 mt-0.5 leading-none">
                    {day.score}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-neutral-400 text-center pt-1 font-mono">
          Tap any day to inspect or log rules for that date
        </p>
      </div>

      {/* 7 CHARTS / ANALYTICS SECTION */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
              DISCIPLINE CHARTS
            </h2>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">14-Day View</span>
        </div>

        {/* Tab Pills for 7 Charts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { id: 'completion', label: '1. Daily %' },
            { id: 'weekly', label: '2. Weekly %' },
            { id: 'steps', label: '3. Steps' },
            { id: 'sleep', label: '4. Sleep' },
            { id: 'gym', label: '5. Gym' },
            { id: 'running', label: '6. Running' },
            { id: 'outside', label: '7. Outside' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChartTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-mono text-[11px] font-bold transition cursor-pointer ${
                activeChartTab === tab.id
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Render Chart Content based on tab */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
          {activeChartTab === 'completion' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Daily Completion Rate</span>
                <span className="font-mono text-sky-400 font-bold">Target: 100%</span>
              </div>
              <div className="h-28 flex items-end gap-1.5 pt-4">
                {recentDays.map((d) => (
                  <div key={d.dayNum} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full rounded-t bg-sky-500 transition-all duration-300"
                      style={{ height: `${Math.max(4, d.score)}%` }}
                      title={`Day ${d.dayNum}: ${d.score}%`}
                    />
                    <span className="text-[8px] font-mono text-neutral-500">
                      D{d.dayNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChartTab === 'weekly' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Weekly Pacing Adherence</span>
                <span className="font-mono text-sky-400 font-bold">{stats.weeklyCompletionRate}%</span>
              </div>
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Current Week Target</span>
                  <span className="font-mono text-white">{stats.weeklyCompletionRate}% Completed</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-cyan-400 h-3 rounded-full"
                    style={{ width: `${stats.weeklyCompletionRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Blended weekly progress combining 4 gym sessions, 1 run, and daily core consistency.
                </p>
              </div>
            </div>
          )}

          {activeChartTab === 'steps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Steps per Day</span>
                <span className="font-mono text-emerald-400 font-bold">10,000 Step Benchmark</span>
              </div>
              <div className="h-28 flex items-end gap-1.5 pt-4">
                {recentDays.map((d) => {
                  const steps = d.log?.steps?.count || 0;
                  const pct = Math.min(100, Math.round((steps / 10000) * 100));
                  return (
                    <div key={d.dayNum} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className={`w-full rounded-t ${
                          steps >= 10000 ? 'bg-emerald-400' : 'bg-emerald-900/60'
                        }`}
                        style={{ height: `${Math.max(4, pct)}%` }}
                        title={`Day ${d.dayNum}: ${steps.toLocaleString()} steps`}
                      />
                      <span className="text-[8px] font-mono text-neutral-500">
                        D{d.dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeChartTab === 'sleep' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Sleep Duration (Hours)</span>
                <span className="font-mono text-indigo-400 font-bold">7–8h Target Window</span>
              </div>
              <div className="h-28 flex items-end gap-1.5 pt-4">
                {recentDays.map((d) => {
                  const hours = (d.log?.sleep?.hours || 0) + (d.log?.sleep?.minutes || 0) / 60;
                  const pct = Math.min(100, Math.round((hours / 9) * 100));
                  const isGood = hours >= 7 && hours <= 8.5;
                  return (
                    <div key={d.dayNum} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className={`w-full rounded-t ${
                          isGood ? 'bg-indigo-400' : 'bg-indigo-900/50'
                        }`}
                        style={{ height: `${Math.max(4, pct)}%` }}
                        title={`Day ${d.dayNum}: ${hours.toFixed(1)} hrs`}
                      />
                      <span className="text-[8px] font-mono text-neutral-500">
                        D{d.dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeChartTab === 'gym' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Gym Workouts (4×/wk Target)</span>
                <span className="font-mono text-sky-400 font-bold">Compound & Hypertrophy</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 py-2">
                {recentDays.slice(0, 7).map((d) => {
                  const didGym = d.log?.gymCompleted || !!d.log?.workoutLog;
                  return (
                    <div
                      key={d.dayNum}
                      className={`p-2 rounded-xl text-center border ${
                        didGym
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                      }`}
                    >
                      <span className="text-[10px] font-mono block">D{d.dayNum}</span>
                      <span className="text-xs font-bold">{didGym ? '🏋️' : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeChartTab === 'running' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Running Session (1×/wk Target)</span>
                <span className="font-mono text-orange-400 font-bold">Aerobic Capacity</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-300">Sunday Aerobic Baseline</span>
                <span className="font-mono text-orange-400 font-bold">Completed 1/1</span>
              </div>
            </div>
          )}

          {activeChartTab === 'outside' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Outdoor Daylight Exposure</span>
                <span className="font-mono text-amber-400 font-bold">30 Min Benchmark</span>
              </div>
              <div className="h-28 flex items-end gap-1.5 pt-4">
                {recentDays.map((d) => {
                  const mins = d.log?.outside?.minutes || 0;
                  const pct = Math.min(100, Math.round((mins / 45) * 100));
                  return (
                    <div key={d.dayNum} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className={`w-full rounded-t ${
                          mins >= 30 ? 'bg-amber-400' : 'bg-amber-900/50'
                        }`}
                        style={{ height: `${Math.max(4, pct)}%` }}
                        title={`Day ${d.dayNum}: ${mins} mins`}
                      />
                      <span className="text-[8px] font-mono text-neutral-500">
                        D{d.dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RULE-BY-RULE ADHERENCE BREAKDOWN */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
          RULE-BY-RULE ADHERENCE
        </h2>

        <div className="space-y-3">
          {ruleDisplayConfig.map((rule) => {
            const adherence = stats.ruleAdherence[rule.key] || 0;
            return (
              <div key={rule.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-medium">{rule.label}</span>
                  <span className="font-mono font-bold text-white">{adherence}%</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-1.5">
                  <div
                    className={`${rule.color} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${adherence}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
