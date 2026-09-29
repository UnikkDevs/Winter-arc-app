import React, { useState } from 'react';
import { UserSettings } from '../types';
import { downloadICSFile, shareToAppleReminders } from '../services/appleIntegrations';
import {
  Calendar,
  Dumbbell,
  Flame,
  Footprints,
  Sun,
  Sparkles,
  Moon,
  Download,
  Share2,
  Check,
  RefreshCw,
} from 'lucide-react';

interface PlanScreenProps {
  settings: UserSettings;
  onUpdateSettings: (updated: UserSettings) => void;
  currentDayNumber: number;
  currentDateStr: string;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({
  settings,
  onUpdateSettings,
  currentDayNumber,
  currentDateStr,
}) => {
  const [schedule, setSchedule] = useState(settings.preferredSchedule);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [icsDownloaded, setIcsDownloaded] = useState(false);
  const [remindersShared, setRemindersShared] = useState(false);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ] as const;

  const handleDayTypeChange = (
    day: (typeof daysOfWeek)[number],
    type: 'Gym' | 'Run' | 'Rest'
  ) => {
    const updated = { ...schedule, [day]: type };
    setSchedule(updated);
  };

  const handleSaveSchedule = () => {
    onUpdateSettings({
      ...settings,
      preferredSchedule: schedule,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetToDefault = () => {
    const defaultSched: UserSettings['preferredSchedule'] = {
      Monday: 'Gym',
      Tuesday: 'Gym',
      Wednesday: 'Rest',
      Thursday: 'Gym',
      Friday: 'Rest',
      Saturday: 'Gym',
      Sunday: 'Run',
    };
    setSchedule(defaultSched);
    onUpdateSettings({
      ...settings,
      preferredSchedule: defaultSched,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportICS = () => {
    downloadICSFile(settings);
    setIcsDownloaded(true);
    setTimeout(() => setIcsDownloaded(false), 3000);
  };

  const handleExportReminders = async () => {
    const ok = await shareToAppleReminders(currentDayNumber, currentDateStr);
    if (ok) {
      setRemindersShared(true);
      setTimeout(() => setRemindersShared(false), 3000);
    }
  };

  // Count current planned days
  const gymDaysCount = Object.values(schedule).filter((v) => v === 'Gym').length;
  const runDaysCount = Object.values(schedule).filter((v) => v === 'Run').length;
  const restDaysCount = Object.values(schedule).filter((v) => v === 'Rest').length;

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-md mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white font-sans">
            WINTER ARC PLAN
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            92-Day Systematic Routine • Oct 1 – Dec 31
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* Benchmark Rules Card */}
      <div className="frost-card rounded-3xl p-5 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
          CORE PERFORMANCE TARGETS
        </h2>
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Gym Target</span>
              <span className="font-mono font-bold text-white">4 sessions/wk</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-orange-500/10 text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Run Target</span>
              <span className="font-mono font-bold text-white">1 session/wk</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Step Target</span>
              <span className="font-mono font-bold text-white">10,000 steps/day</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Outside</span>
              <span className="font-mono font-bold text-white">30 min/day</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Prayer/Mind</span>
              <span className="font-mono font-bold text-white">10 min/day</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Sleep Target</span>
              <span className="font-mono font-bold text-white">7–8 hours/night</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Schedule Builder */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
              WEEKLY TRAINING SPLIT
            </h2>
            <p className="text-[11px] text-neutral-400">
              Customize preferred Gym & Run days
            </p>
          </div>
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition cursor-pointer"
            title="Reset to default schedule"
          >
            <RefreshCw className="w-3 h-3" />
            Default
          </button>
        </div>

        {/* Days editor */}
        <div className="space-y-2.5">
          {daysOfWeek.map((day) => {
            const currentType = schedule[day];

            return (
              <div
                key={day}
                className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/70"
              >
                <div className="w-28">
                  <span className="text-xs font-bold text-white block">{day}</span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {currentType === 'Gym' && '🏋️ Compound Lifting'}
                    {currentType === 'Run' && '🏃 Aerobic Base'}
                    {currentType === 'Rest' && '🧘 Recovery / Mobility'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['Gym', 'Run', 'Rest'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleDayTypeChange(day, type)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition cursor-pointer ${
                        currentType === type
                          ? type === 'Gym'
                            ? 'bg-sky-500 text-black'
                            : type === 'Run'
                            ? 'bg-orange-500 text-black'
                            : 'bg-neutral-800 text-white'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Allocation status */}
        <div className="p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400">Schedule Allocation:</span>
          <span className="text-sky-400 font-bold">{gymDaysCount} Gym</span>
          <span className="text-orange-400 font-bold">{runDaysCount} Run</span>
          <span className="text-neutral-400">{restDaysCount} Recovery</span>
        </div>

        <button
          onClick={handleSaveSchedule}
          className="w-full py-3 rounded-2xl bg-sky-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-sky-400 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Schedule Saved
            </>
          ) : (
            'Save Schedule'
          )}
        </button>
      </div>

      {/* APPLE ECOSYSTEM INTEGRATION SECTION */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
            APPLE ECOSYSTEM EXPORT
          </h2>
          <p className="text-[11px] text-neutral-400">
            Calendar sync & Reminders checklist for iPhone
          </p>
        </div>

        <div className="space-y-3">
          {/* Apple Calendar .ics generator */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Apple Calendar (.ics)</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Export recurring calendar events directly to Apple Calendar for all scheduled Gym, Run, and Outdoor sessions across the entire 92-day Arc.
            </p>
            <button
              onClick={handleExportICS}
              className="w-full mt-2 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              {icsDownloaded ? 'Downloaded (.ics)' : 'Export to Apple Calendar'}
            </button>
          </div>

          {/* Apple Reminders Checklist */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Apple Reminders Export</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">READY</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Export or share the 10-rule behavioural checklist formatted for native iOS Reminders app or Share Sheet.
            </p>
            <button
              onClick={handleExportReminders}
              className="w-full mt-2 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              {remindersShared ? 'Shared / Copied!' : 'Export to Apple Reminders'}
            </button>
          </div>

          {/* Apple HealthKit Architecture Notice */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1.5 text-xs text-neutral-400">
            <div className="flex items-center justify-between text-neutral-300 font-bold">
              <span>Apple HealthKit Architecture</span>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">NATIVE TARGET</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Apple restricts direct HealthKit access from standard web browser sandboxes. This PWA is architected for seamless future wrapping in Xcode with Swift/SwiftUI + HealthKit entitlements for native background step, sleep stage, and workout telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
