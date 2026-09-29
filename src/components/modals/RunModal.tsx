import React, { useState } from 'react';
import { RunLog } from '../../types';
import { X, Flame } from 'lucide-react';

interface RunModalProps {
  date: string;
  initialLog?: RunLog;
  onSave: (log: RunLog) => void;
  onClose: () => void;
}

export const RunModal: React.FC<RunModalProps> = ({
  date,
  initialLog,
  onSave,
  onClose,
}) => {
  const [distanceKm, setDistanceKm] = useState(initialLog?.distanceKm || 5.0);
  const [durationMinutes, setDurationMinutes] = useState(initialLog?.durationMinutes || 28);
  const [notes, setNotes] = useState(initialLog?.notes || '');

  // Calculate pace
  const paceMin = distanceKm > 0 ? durationMinutes / distanceKm : 0;
  const paceMinutes = Math.floor(paceMin);
  const paceSeconds = Math.round((paceMin - paceMinutes) * 60);
  const formattedPace = `${paceMinutes}:${paceSeconds < 10 ? '0' : ''}${paceSeconds} /km`;

  const handleSave = () => {
    const log: RunLog = {
      id: initialLog?.id || `run-${Date.now()}`,
      date,
      distanceKm: Number(distanceKm) || 0,
      durationMinutes: Number(durationMinutes) || 0,
      paceMinPerKm: formattedPace,
      notes,
    };
    onSave(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl flex flex-col text-left">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Log Weekly Run</h3>
              <p className="text-xs text-neutral-400">{date} • Winter Arc 1×/wk Target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                DISTANCE (KM)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="50"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                DURATION (MINS)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono-numbers"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Calculated Average Pace</span>
            <span className="font-mono font-bold text-orange-400 text-sm">{formattedPace}</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              RUN NOTES / WEATHER
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cold morning air. Kept heart rate disciplined in zone 2."
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-orange-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-orange-400 active:scale-95 transition cursor-pointer"
          >
            Save Run
          </button>
        </div>
      </div>
    </div>
  );
};
