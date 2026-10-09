import React, { useState } from 'react';
import { UserSettings } from '../types';
import {
  exportAllData,
  importAllData,
  resetAllData,
  seedSampleWinterArcData,
} from '../services/storage';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Settings,
  Bell,
  Target,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  Smartphone,
  Shield,
  Apple,
} from 'lucide-react';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (updated: UserSettings) => void;
  onRefreshData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onRefreshData,
}) => {
  const [userName, setUserName] = useState(settings.userName || 'Operator');
  const [startDate, setStartDate] = useState(settings.startDate || '2026-10-01');
  const [endDate, setEndDate] = useState(settings.endDate || '2026-12-31');
  const [gymTarget, setGymTarget] = useState(settings.gymWeeklyTarget || 4);
  const [runTarget, setRunTarget] = useState(settings.runningWeeklyTarget || 1);
  const [stepTarget, setStepTarget] = useState(settings.stepsDailyTarget || 10000);
  const [outdoorTarget, setOutdoorTarget] = useState(settings.outdoorTargetMins || 30);
  const [prayerTarget, setPrayerTarget] = useState(settings.prayerTargetMins || 10);
  const [reminders, setReminders] = useState(settings.reminders);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState<'reset' | 'delete' | null>(null);
  const [showNativeGuide, setShowNativeGuide] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Toggle individual reminder
  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
  };

  // Request browser notification permission
  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        onUpdateSettings({ ...settings, notificationsAllowed: true });
        new Notification('Winter Arc 2026', {
          body: 'Reminders enabled. Discipline over motivation.',
          icon: '/pwa-192x192.png',
        });
      }
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    const updated: UserSettings = {
      ...settings,
      userName: userName.trim() || 'Operator',
      startDate,
      endDate,
      gymWeeklyTarget: Number(gymTarget) || 4,
      runningWeeklyTarget: Number(runTarget) || 1,
      stepsDailyTarget: Number(stepTarget) || 10000,
      outdoorTargetMins: Number(outdoorTarget) || 30,
      prayerTargetMins: Number(prayerTarget) || 10,
      reminders,
    };
    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Export Data JSON
  const handleExportData = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Winter_Arc_2026_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Data JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importAllData(content);
      if (ok) {
        setImportStatus('Data successfully restored!');
        onRefreshData();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid backup file.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Seed sample mock data for demonstration
  const handleSeedData = () => {
    seedSampleWinterArcData();
    onRefreshData();
    setImportStatus('Sample 14-day history loaded!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  // Perform Reset or Delete
  const handleConfirmAction = () => {
    if (confirmModal === 'reset' || confirmModal === 'delete') {
      resetAllData();
      onRefreshData();
      setConfirmModal(null);
      setImportStatus('Arc data cleared.');
      setTimeout(() => setImportStatus(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-md mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white font-sans">
            SYSTEM SETTINGS
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Winter Arc Configuration & Privacy
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-neutral-800 text-neutral-300 border border-neutral-700">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {/* PWA Home Screen Installation Card */}
      <div className="frost-card rounded-3xl p-5 space-y-3 border border-sky-500/20 bg-gradient-to-r from-sky-950/20 to-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white">
              IPHONE PWA INSTALLATION
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">READY NOW</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Install Winter Arc directly to your iPhone Home Screen in Safari. Launches in standalone mode with full local persistence.
        </p>
        <PWAInstallButton />
      </div>

      {/* Native iOS Xcode & HealthKit Guide Card */}
      <div className="frost-card rounded-3xl p-5 space-y-3 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 to-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white">
              NATIVE IOS APP & HEALTHKIT
            </h2>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 font-bold">SWIFTUI</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Want Apple Watch step and sleep auto-syncing? Convert this web app into a native iOS app using our ready-to-run SwiftUI + HealthKit bridge.
        </p>
        <button
          onClick={() => setShowNativeGuide(true)}
          className="w-full py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Apple className="w-3.5 h-3.5" />
          View Xcode & Swift Setup Guide
        </button>
      </div>

      {/* User Profile & Dates */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
          ARC PROTOCOL DATES & IDENTITY
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              OPERATOR CODENAME / NAME
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                END DATE
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono-numbers"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Targets Customizer */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
            TARGET THRESHOLDS
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-neutral-400 block mb-1">
              GYM (SESSIONS/WK)
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={gymTarget}
              onChange={(e) => setGymTarget(Number(e.target.value))}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono-numbers"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 block mb-1">
              RUN (SESSIONS/WK)
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={runTarget}
              onChange={(e) => setRunTarget(Number(e.target.value))}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono-numbers"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 block mb-1">
              STEPS DAILY
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              value={stepTarget}
              onChange={(e) => setStepTarget(Number(e.target.value))}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono-numbers"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 block mb-1">
              OUTSIDE (MINS)
            </label>
            <input
              type="number"
              min="10"
              step="5"
              value={outdoorTarget}
              onChange={(e) => setOutdoorTarget(Number(e.target.value))}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono-numbers"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 block mb-1">
              PRAYER / MINS
            </label>
            <input
              type="number"
              min="5"
              value={prayerTarget}
              onChange={(e) => setPrayerTarget(Number(e.target.value))}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono-numbers"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 block mb-1">
              SLEEP TARGET
            </label>
            <div className="rounded-xl bg-neutral-950/60 border border-neutral-800 px-3 py-2 text-neutral-300 font-mono-numbers">
              7–8 Hours
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full py-2.5 rounded-xl bg-sky-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-sky-400 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Settings Saved
            </>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>

      {/* Suggested Daily Reminders */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
              DISCIPLINE TIMERS & REMINDERS
            </h2>
          </div>
          <button
            onClick={requestNotifications}
            className="text-[10px] font-bold font-mono text-sky-400 hover:text-sky-300 transition"
          >
            Enable Web Push
          </button>
        </div>

        <div className="space-y-2">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/70 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-sky-400 block text-sm">
                  {rem.time}
                </span>
                <span className="text-[11px] text-neutral-300">{rem.label}</span>
              </div>
              <button
                type="button"
                onClick={() => toggleReminder(rem.id)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                  rem.enabled ? 'bg-sky-500 justify-end' : 'bg-neutral-800 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Data Management */}
      <div className="frost-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
            PRIVACY & DATA BACKUP
          </h2>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          All health, journal, and habit data is stored exclusively in your local device browser storage. No telemetry, no external ad tracking.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExportData}
            className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            Export JSON
          </button>

          <label className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleSeedData}
          className="w-full py-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 text-sky-300 hover:bg-sky-900/30 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          Load 14-Day Sample Arc History
        </button>

        <div className="pt-3 border-t border-neutral-800/80 space-y-2">
          <button
            onClick={() => setConfirmModal('reset')}
            className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Winter Arc
          </button>

          <button
            onClick={() => setConfirmModal('delete')}
            className="w-full py-2 rounded-xl text-neutral-500 hover:text-rose-400 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            Delete All Local Data
          </button>
        </div>
      </div>

      {/* Native iOS Setup Modal */}
      {showNativeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 text-left">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Native iOS + HealthKit Guide
                  </h3>
                  <p className="text-xs text-neutral-400">
                    SwiftUI + Xcode Setup Instructions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNativeGuide(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-neutral-300 no-scrollbar">
              {/* Important 403 Notice & Public URL */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <span className="font-bold text-amber-300 block">
                  ⚠️ Safari 403 Error Fix
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  If Safari shows <strong>Error 403 (Forbidden)</strong>, you are accessing the private developer URL. Use the <strong>Public Shared App URL</strong> below:
                </p>
                <div className="p-2 rounded-xl bg-black/60 border border-neutral-800 text-[11px] font-mono text-sky-300 break-all select-all">
                  https://ais-pre-rsynf57mhsatt4s3zzvh5n-439442445610.asia-east1.run.app
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('https://ais-pre-rsynf57mhsatt4s3zzvh5n-439442445610.asia-east1.run.app');
                    setCopyCodeSuccess(true);
                    setTimeout(() => setCopyCodeSuccess(false), 2000);
                  }}
                  className="w-full py-1.5 rounded-lg bg-sky-500/20 text-sky-300 text-[11px] font-bold uppercase transition hover:bg-sky-500/30 cursor-pointer"
                >
                  {copyCodeSuccess ? '✓ Copied Public URL' : 'Copy Safari Public URL'}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="font-bold text-white block">
                  Method 1: Instant PWA (No Mac Needed)
                </span>
                <p className="text-neutral-400 leading-relaxed">
                  Open the public URL in iPhone Safari, tap <strong>Share</strong>, then <strong>&quot;Add to Home Screen&quot;</strong>. The app launches full-screen in standalone mode with full local persistence.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="font-bold text-white block">
                  Method 2: Xcode Native App (With Apple HealthKit)
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 leading-relaxed">
                  <li>Open Xcode on your Mac and create a new <strong>iOS SwiftUI App</strong>.</li>
                  <li>In <strong>Signing & Capabilities</strong>, click <strong>+ Capability</strong> and select <strong>HealthKit</strong>.</li>
                  <li>In <code>Info.plist</code>, add <code>NSHealthShareUsageDescription</code> and <code>NSHealthUpdateUsageDescription</code>.</li>
                  <li>Replace your project code with the drop-in file <code>/ios-bridge/SwiftUI_HealthKit_Wrapper.swift</code> included in this project.</li>
                  <li>Build & Run on your iPhone to unlock automatic Apple Watch step & sleep tracking!</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="font-bold text-white block">
                  Method 3: Capacitor CLI
                </span>
                <pre className="p-2.5 rounded-xl bg-black border border-neutral-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
{`npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Winter Arc 2026" "com.winterarc.app" --web-dir "dist"
npm run build
npx cap add ios
npx cap open ios`}
                </pre>
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-neutral-500">
                Code: /ios-bridge/SwiftUI_HealthKit_Wrapper.swift
              </span>
              <button
                onClick={() => setShowNativeGuide(false)}
                className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {confirmModal === 'reset' ? 'Reset Winter Arc?' : 'Delete All Data?'}
            </h3>
            <p className="text-xs text-neutral-400 mt-2 mb-5">
              This will permanently erase all local habit logs, workouts, and journals. You cannot undo this unless you have an exported JSON backup.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase hover:bg-rose-500"
              >
                Confirm Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
