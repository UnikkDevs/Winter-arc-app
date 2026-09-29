import React, { useState } from 'react';
import { DailyLog, JournalEntry, UserSettings, ArcProgressStats } from '../types';
import {
  BookOpen,
  Send,
  Sparkles,
  Bot,
  Check,
  Calendar,
  AlertCircle,
  Copy,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface JournalScreenProps {
  currentDateStr: string;
  journal: JournalEntry;
  onSaveJournal: (updated: JournalEntry) => void;
  dailyLog: DailyLog;
  settings: UserSettings;
  stats: ArcProgressStats;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  currentDateStr,
  journal,
  onSaveJournal,
  dailyLog,
  settings,
  stats,
}) => {
  const [howDayWent, setHowDayWent] = useState(journal.howDayWent || '');
  const [fiveWinsText, setFiveWinsText] = useState(
    journal.fiveWinsText ||
      dailyLog.smallWins
        .filter((w) => w.text.trim())
        .map((w, i) => `${i + 1}. ${w.text}`)
        .join('\n')
  );
  const [wentWell, setWentWell] = useState(journal.wentWell || '');
  const [wentPoorly, setWentPoorly] = useState(journal.wentPoorly || '');
  const [improveTomorrow, setImproveTomorrow] = useState(journal.improveTomorrow || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Gemini Coach state
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachResponse, setCoachResponse] = useState(journal.coachFeedback || '');
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  const presetPrompts = [
    'I completed my daily rules today. What should I focus on tomorrow?',
    "I'm behind on my gym target this week. Help me reorganize the remaining sessions.",
    'I slept 6 hours last night. How should I adjust today’s training?',
    'Give me five realistic, disciplined small wins for today.',
  ];

  const handleSave = () => {
    const updated: JournalEntry = {
      date: currentDateStr,
      howDayWent,
      fiveWinsText,
      wentWell,
      wentPoorly,
      improveTomorrow,
      coachFeedback: coachResponse,
      updatedAt: new Date().toISOString(),
    };
    onSaveJournal(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAskCoach = async (promptToUse?: string) => {
    const query = promptToUse || coachPrompt;
    if (!query.trim()) return;

    setCoachLoading(true);
    setCoachError(null);

    // Build context object
    const completedRules: string[] = [];
    const pendingRules: string[] = [];

    if (dailyLog.water.completed) completedRules.push('Water only');
    else pendingRules.push('Water only');

    if (dailyLog.noJunk.completed) completedRules.push('No junk food');
    else pendingRules.push('No junk food');

    if (dailyLog.sleep.completed || dailyLog.sleep.hours >= 7) completedRules.push('7-8h sleep');
    else pendingRules.push('7-8h sleep');

    if (dailyLog.gymCompleted) completedRules.push('Gym session');
    if (dailyLog.runCompleted) completedRules.push('Running session');

    if (dailyLog.steps.count >= 10000) completedRules.push('10k steps');
    else pendingRules.push('10k steps');

    if (dailyLog.outside.minutes >= 30) completedRules.push('30m outside');
    else pendingRules.push('30m outside');

    if (dailyLog.prayer.minutes >= 10) completedRules.push('10m prayer');
    else pendingRules.push('10m prayer');

    const context = {
      dayNumber: stats.currentDayNumber,
      totalDays: stats.totalDays,
      dailyScore: dailyLog.dailyScore,
      weeklyScore: stats.weeklyCompletionRate,
      completedRules,
      pendingRules,
      gymThisWeek: dailyLog.gymCompleted ? 1 : 0,
      runsThisWeek: dailyLog.runCompleted ? 1 : 0,
      stepsToday: dailyLog.steps.count,
      sleepHours: dailyLog.sleep.hours + dailyLog.sleep.minutes / 60,
      outdoorMinutes: dailyLog.outside.minutes,
      smallWinsCount: dailyLog.smallWins.filter((w) => w.completed).length,
    };

    try {
      const res = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          context,
        }),
      });

      const data = await res.json();
      if (res.ok && data.response) {
        setCoachResponse(data.response);
        // Persist with journal
        onSaveJournal({
          date: currentDateStr,
          howDayWent,
          fiveWinsText,
          wentWell,
          wentPoorly,
          improveTomorrow,
          coachFeedback: data.response,
          updatedAt: new Date().toISOString(),
        });
      } else {
        setCoachError(data.error || 'Failed to get coach response.');
      }
    } catch (err: any) {
      console.error(err);
      setCoachError('Connection error. Please try again.');
    } finally {
      setCoachLoading(false);
      setCoachPrompt('');
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-md mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white font-sans">
            DAILY REFLECTION
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            {currentDateStr} • Day {stats.currentDayNumber} / 92
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      {/* Structured Journal Form */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        {/* Field 1: How did today go? */}
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1">
            How did today go?
          </label>
          <textarea
            rows={3}
            value={howDayWent}
            onChange={(e) => setHowDayWent(e.target.value)}
            placeholder="Honest assessment of mindset, discipline, energy, and friction..."
            className="w-full rounded-2xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
          />
        </div>

        {/* Field 2: 5 Small Wins */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-neutral-300">
              What were my 5 small wins?
            </label>
            <button
              type="button"
              onClick={() => {
                const autoWins = dailyLog.smallWins
                  .filter((w) => w.text.trim())
                  .map((w, i) => `${i + 1}. ${w.text} ${w.completed ? '✓' : ''}`)
                  .join('\n');
                if (autoWins) setFiveWinsText(autoWins);
              }}
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 transition"
            >
              Sync from Today
            </button>
          </div>
          <textarea
            rows={3}
            value={fiveWinsText}
            onChange={(e) => setFiveWinsText(e.target.value)}
            placeholder="1. Woke without snoozing&#10;2. Cold water only&#10;3. Finished heavy squats..."
            className="w-full rounded-2xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 resize-none font-mono leading-relaxed"
          />
        </div>

        {/* Field 3: What went well? */}
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1">
            What went well?
          </label>
          <input
            type="text"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            placeholder="Clear wins, unbroken habits, high focus periods"
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Field 4: What went poorly? */}
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1">
            What went poorly?
          </label>
          <input
            type="text"
            value={wentPoorly}
            onChange={(e) => setWentPoorly(e.target.value)}
            placeholder="Distractions, missed timings, procrastination friction"
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Field 5: What will I improve tomorrow? */}
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1">
            What will I improve tomorrow?
          </label>
          <input
            type="text"
            value={improveTomorrow}
            onChange={(e) => setImproveTomorrow(e.target.value)}
            placeholder="Single concrete tactical adjustment for tomorrow"
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Save Journal button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              Journal Saved
            </>
          ) : (
            'Save Journal Entry'
          )}
        </button>
      </div>

      {/* GEMINI COACH SECTION */}
      <div className="frost-card rounded-3xl p-5 space-y-4 border border-sky-500/30 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-white">
                GEMINI COACH
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono">
                AI Performance Analysis • Discipline Protocol
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
            gemini-3.8-flash
          </span>
        </div>

        {/* AI Output Card */}
        {coachResponse && (
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
              <span>COACH FEEDBACK:</span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {stats.currentDayNumber > 0 ? `DAY ${stats.currentDayNumber}` : 'TODAY'}
              </span>
            </div>
            <div className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
              {coachResponse}
            </div>
          </div>
        )}

        {coachError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{coachError}</span>
          </div>
        )}

        {/* Quick Prompt Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            QUICK COACH PROMPTS
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {presetPrompts.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskCoach(preset)}
                disabled={coachLoading}
                className="text-left p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white hover:border-sky-500/50 transition cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <span className="line-clamp-1">{preset}</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-sky-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Ask coach (e.g. adjust training, sleep recovery)..."
            value={coachPrompt}
            onChange={(e) => setCoachPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskCoach();
            }}
            disabled={coachLoading}
            className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleAskCoach()}
            disabled={coachLoading || !coachPrompt.trim()}
            className="p-2.5 rounded-xl bg-sky-500 text-black hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition cursor-pointer"
            title="Send to Coach"
          >
            {coachLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Wellness disclaimer */}
        <p className="text-[10px] text-neutral-500 text-center leading-normal">
          AI guidance is for general athletic discipline & wellness. Not medical advice.
        </p>
      </div>
    </div>
  );
};
