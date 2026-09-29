import React, { useState } from 'react';
import { WorkoutLog, ExerciseLog } from '../../types';
import { X, Plus, Trash2, Dumbbell } from 'lucide-react';

interface WorkoutModalProps {
  date: string;
  initialLog?: WorkoutLog;
  onSave: (log: WorkoutLog) => void;
  onClose: () => void;
}

export const WorkoutModal: React.FC<WorkoutModalProps> = ({
  date,
  initialLog,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialLog?.title || 'Hypertrophy Session');
  const [splitType, setSplitType] = useState<WorkoutLog['splitType']>(
    initialLog?.splitType || 'Upper'
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialLog?.durationMinutes || 60
  );
  const [notes, setNotes] = useState(initialLog?.notes || '');
  const [exercises, setExercises] = useState<ExerciseLog[]>(
    initialLog?.exercises || [
      { id: '1', name: 'Barbell Bench Press', sets: 4, reps: '8-10', weight: '85 kg' },
      { id: '2', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weight: '32 kg' },
      { id: '3', name: 'Barbell Bent Over Row', sets: 4, reps: '8-10', weight: '75 kg' },
    ]
  );

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: 3, reps: '10-12', weight: '' },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof ExerciseLog, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSave = () => {
    const log: WorkoutLog = {
      id: initialLog?.id || `workout-${Date.now()}`,
      date,
      title: title.trim() || 'Gym Workout',
      splitType,
      durationMinutes: Number(durationMinutes) || 45,
      notes,
      exercises: exercises.filter((e) => e.name.trim().length > 0),
    };
    onSave(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl max-h-[90vh] flex flex-col text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Log Gym Workout</h3>
              <p className="text-xs text-neutral-400">{date} • Winter Arc 4×/wk Target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
          {/* Workout Title & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                SESSION TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Push A / Chest & Back"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                DURATION (MINS)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min="10"
                max="240"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono-numbers"
              />
            </div>
          </div>

          {/* Split Type Selector */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
              SPLIT FOCUS
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-xs">
              {(['Upper', 'Lower', 'Push', 'Pull', 'Legs', 'Full Body', 'Cardio/Mobility'] as const).map(
                (split) => (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setSplitType(split)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-medium transition cursor-pointer ${
                      splitType === split
                        ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {split}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Exercises list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-neutral-400">
                EXERCISES & SETS ({exercises.length})
              </label>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-500 w-5">
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g. Incline DB Press)"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 transition"
                      aria-label="Remove exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Sets</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                        className="w-full rounded bg-neutral-900 border border-neutral-800 px-2 py-1 text-white font-mono-numbers text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Reps</span>
                      <input
                        type="text"
                        placeholder="8-10"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                        className="w-full rounded bg-neutral-900 border border-neutral-800 px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Load / Weight</span>
                      <input
                        type="text"
                        placeholder="80 kg"
                        value={exercise.weight || ''}
                        onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                        className="w-full rounded bg-neutral-900 border border-neutral-800 px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              SESSION NOTES
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Felt strong on compound lifts. Rest intervals kept to 90s."
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-sky-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-sky-400 active:scale-95 transition cursor-pointer shadow-lg shadow-sky-500/20"
          >
            Save Workout
          </button>
        </div>
      </div>
    </div>
  );
};
