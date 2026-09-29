import React, { useState, useEffect } from 'react';
import { X, Moon, Footprints, Droplets, Sun, Sparkles, Play, Pause, RotateCcw } from 'lucide-react';

// ======================== SLEEP MODAL ========================
export const SleepModal: React.FC<{
  initialHours: number;
  initialMinutes: number;
  onSave: (hours: number, minutes: number, completed: boolean) => void;
  onClose: () => void;
}> = ({ initialHours, initialMinutes, onSave, onClose }) => {
  const [hours, setHours] = useState(initialHours || 7);
  const [minutes, setMinutes] = useState(initialMinutes || 30);

  const total = hours + minutes / 60;
  const isTargetMet = total >= 7 && total <= 8.5;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 text-left">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Sleep Duration</h3>
              <p className="text-xs text-neutral-400">Target: 7–8 hours recovery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="text-center">
              <input
                type="number"
                min="0"
                max="16"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
                className="w-20 text-center font-mono text-3xl font-extrabold rounded-2xl bg-neutral-950 border border-neutral-800 p-2 text-white"
              />
              <span className="text-[11px] font-bold text-neutral-400 mt-1 block uppercase">Hours</span>
            </div>
            <span className="text-2xl font-mono text-neutral-500 pb-4">:</span>
            <div className="text-center">
              <input
                type="number"
                min="0"
                max="59"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                className="w-20 text-center font-mono text-3xl font-extrabold rounded-2xl bg-neutral-950 border border-neutral-800 p-2 text-white"
              />
              <span className="text-[11px] font-bold text-neutral-400 mt-1 block uppercase">Minutes</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              isTargetMet
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <span>Target State (7–8 hrs):</span>
            <span className="font-bold">{isTargetMet ? '✓ OPTIMAL RECOVERY' : 'OUTSIDE 7–8H TARGET'}</span>
          </div>

          {/* Apple Health notice */}
          <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-400 leading-relaxed">
            <span className="font-semibold text-neutral-300 block mb-0.5">Apple Health Integration</span>
            In this PWA edition, manual input is used. When wrapped into a native iOS app with HealthKit entitlements, sleep stages will sync directly from Apple Watch.
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(hours, minutes, isTargetMet);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-400 active:scale-95 transition"
          >
            Save Sleep
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== STEPS MODAL ========================
export const StepsModal: React.FC<{
  initialSteps: number;
  onSave: (steps: number, completed: boolean) => void;
  onClose: () => void;
}> = ({ initialSteps, onSave, onClose }) => {
  const [steps, setSteps] = useState(initialSteps || 0);

  const addSteps = (val: number) => {
    setSteps((prev) => Math.max(0, prev + val));
  };

  const isTargetMet = steps >= 10000;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 text-left">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Step Counter</h3>
              <p className="text-xs text-neutral-400">Target: 10,000 steps daily</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="text-center">
            <input
              type="number"
              min="0"
              step="100"
              value={steps}
              onChange={(e) => setSteps(Math.max(0, Number(e.target.value)))}
              className="w-full text-center font-mono text-3xl font-extrabold rounded-2xl bg-neutral-950 border border-neutral-800 p-3 text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] font-bold text-neutral-400 mt-1 block uppercase">
              {steps.toLocaleString()} / 10,000 steps ({Math.min(100, Math.round((steps / 10000) * 100))}%)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1000, 2500, 5000, 10000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => addSteps(val)}
                className="py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono font-bold text-neutral-300 hover:border-emerald-500 hover:text-emerald-400 transition"
              >
                +{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-400 leading-relaxed">
            <span className="font-semibold text-neutral-300 block mb-0.5">Apple Health Steps Sync</span>
            Direct background step pedometer access requires Apple HealthKit in native iOS. In PWA mode, check your iPhone Health app and enter steps here.
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(steps, isTargetMet);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition"
          >
            Save Steps
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== WATER MODAL ========================
export const WaterModal: React.FC<{
  initialGlasses: number;
  initialCompleted: boolean;
  onSave: (glasses: number, completed: boolean) => void;
  onClose: () => void;
}> = ({ initialGlasses, initialCompleted, onSave, onClose }) => {
  const [glasses, setGlasses] = useState(initialGlasses || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 text-left">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Only Water Protocol</h3>
              <p className="text-xs text-neutral-400">Zero sodas, alcohol, or sweetened drinks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="text-center">
            <span className="font-mono text-4xl font-extrabold text-cyan-400">{glasses}</span>
            <span className="text-neutral-400 text-sm block mt-1">/ 8 glasses (approx. 2.5L)</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setGlasses((g) => Math.max(0, g - 1))}
              className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 text-xl font-bold text-neutral-300 hover:text-white active:scale-95"
            >
              -
            </button>
            <button
              onClick={() => setGlasses((g) => g + 1)}
              className="flex-1 py-3.5 rounded-2xl bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              +1 Glass (300ml)
            </button>
            <button
              onClick={() => setGlasses((g) => g + 2)}
              className="px-3.5 py-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-cyan-400 hover:border-cyan-500 active:scale-95"
            >
              +2
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300">
            <span className="font-bold text-white block mb-0.5">Rule 1 Guideline</span>
            Pure water, mineral water, or black water only. Coffee/tea with zero sweeteners or milk allowed in moderation.
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(glasses, glasses >= 8);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-cyan-400"
          >
            Save Hydration
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== OUTSIDE MODAL ========================
export const OutsideModal: React.FC<{
  initialMinutes: number;
  onSave: (minutes: number, completed: boolean) => void;
  onClose: () => void;
}> = ({ initialMinutes, onSave, onClose }) => {
  const [minutes, setMinutes] = useState(initialMinutes || 0);

  const addMins = (val: number) => {
    setMinutes((m) => Math.max(0, m + val));
  };

  const isTargetMet = minutes >= 30;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 text-left">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">30 Min Outside</h3>
              <p className="text-xs text-neutral-400">Natural light & cold fresh air exposure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="text-center">
            <span className="font-mono text-4xl font-extrabold text-amber-400">{minutes}</span>
            <span className="text-neutral-400 text-sm block mt-1">/ 30 minutes outdoor target</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 30].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => addMins(val)}
                className="py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-amber-300 hover:border-amber-500 transition"
              >
                +{val} mins
              </button>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300">
            <span className="font-bold text-white block mb-0.5">Discipline Benefit</span>
            Winter daylight exposure sets circadian rhythms, enhances mental resilience, and supports deep restorative sleep.
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(minutes, isTargetMet);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400"
          >
            Save Minutes
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== PRAYER / MEDITATION MODAL ========================
export const PrayerModal: React.FC<{
  initialMinutes: number;
  onSave: (minutes: number, completed: boolean) => void;
  onClose: () => void;
}> = ({ initialMinutes, onSave, onClose }) => {
  const [minutes, setMinutes] = useState(initialMinutes || 0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(600); // 10 minutes

  useEffect(() => {
    let interval: any;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      setMinutes(10);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSecondsLeft]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSecondsLeft(600);
  };

  const timerMin = Math.floor(timerSecondsLeft / 60);
  const timerSec = timerSecondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 text-left">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">10 Min Prayer & Reflection</h3>
              <p className="text-xs text-neutral-400">Mental stillness, gratitude & spiritual grounding</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* 10-Minute Focus Countdown Timer */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block mb-1">
              FOCUS PRAYER TIMER
            </span>
            <div className="font-mono text-3xl font-extrabold text-purple-300">
              {timerMin}:{timerSec < 10 ? '0' : ''}{timerSec}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                type="button"
                onClick={toggleTimer}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                  timerRunning
                    ? 'bg-amber-500 text-black'
                    : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {timerRunning ? 'Pause' : 'Start 10 Min'}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              MANUAL DURATION (MINS)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono-numbers"
            />
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(minutes, minutes >= 10);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-400"
          >
            Save Prayer
          </button>
        </div>
      </div>
    </div>
  );
};
