/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, BottomNav } from './components/BottomNav';
import { TodayScreen } from './components/TodayScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { PlanScreen } from './components/PlanScreen';
import { JournalScreen } from './components/JournalScreen';
import { SettingsScreen } from './components/SettingsScreen';
import {
  loadSettings,
  saveSettings,
  loadAllDailyLogs,
  loadDailyLog,
  saveDailyLog,
  loadJournal,
  saveJournal,
  calculateArcStats,
  formatLocalDate,
  ARC_START_DATE,
  seedSampleWinterArcData,
} from './services/storage';
import { DailyLog, JournalEntry, UserSettings, ArcProgressStats } from './types';
import { WifiOff, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Determine initial date: if current date is before Oct 1, 2026, default to Day 1 (Oct 1, 2026) for immediate rich experience, while allowing user to switch to today or any day
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    const today = formatLocalDate(new Date());
    return today < ARC_START_DATE ? ARC_START_DATE : today;
  });

  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [allLogs, setAllLogs] = useState<Record<string, DailyLog>>(() => {
    const logs = loadAllDailyLogs();
    // If brand new, seed initial data for a high-performance experience
    if (Object.keys(logs).length === 0) {
      seedSampleWinterArcData();
      return loadAllDailyLogs();
    }
    return logs;
  });

  const [dailyLog, setDailyLog] = useState<DailyLog>(() => loadDailyLog(currentDateStr));
  const [journal, setJournal] = useState<JournalEntry>(() => loadJournal(currentDateStr));
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Sync online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Native iOS HealthKit bridge listener
    (window as any).__onHealthKitSync = (data: { steps?: number; sleepHours?: number }) => {
      setDailyLog((prev) => {
        let updated = { ...prev };
        if (typeof data.steps === 'number') {
          updated.steps = {
            count: data.steps,
            completed: data.steps >= 10000,
          };
        }
        if (typeof data.sleepHours === 'number') {
          const h = Math.floor(data.sleepHours);
          const m = Math.round((data.sleepHours - h) * 60);
          updated.sleep = {
            hours: h,
            minutes: m,
            completed: h >= 7 && h <= 8.5,
          };
        }
        saveDailyLog(updated);
        return updated;
      });
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      delete (window as any).__onHealthKitSync;
    };
  }, []);

  // Sync log and journal when currentDateStr changes
  useEffect(() => {
    setDailyLog(loadDailyLog(currentDateStr));
    setJournal(loadJournal(currentDateStr));
  }, [currentDateStr]);

  // Handle log updates
  const handleUpdateDailyLog = (updated: DailyLog) => {
    setDailyLog(updated);
    saveDailyLog(updated);
    setAllLogs((prev) => ({
      ...prev,
      [updated.date]: updated,
    }));
  };

  // Handle journal updates
  const handleSaveJournal = (updated: JournalEntry) => {
    setJournal(updated);
    saveJournal(updated);
  };

  // Handle settings updates
  const handleUpdateSettings = (updated: UserSettings) => {
    setSettings(updated);
    saveSettings(updated);
  };

  // Refresh all state from storage (used after import or reset)
  const handleRefreshData = () => {
    const refreshedSettings = loadSettings();
    const refreshedLogs = loadAllDailyLogs();
    setSettings(refreshedSettings);
    setAllLogs(refreshedLogs);
    setDailyLog(loadDailyLog(currentDateStr));
    setJournal(loadJournal(currentDateStr));
  };

  // Compute live Arc statistics
  const stats: ArcProgressStats = calculateArcStats(currentDateStr, settings, allLogs);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col antialiased selection:bg-sky-500/20 selection:text-sky-300">
      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500/90 text-black py-1.5 px-3 text-[11px] font-bold tracking-wide backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode • Local storage active</span>
        </div>
      )}

      {/* Main Content Area with Safe-Area insets */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-[max(16px,env(safe-area-inset-top))]">
        {activeTab === 'today' && (
          <TodayScreen
            currentDateStr={currentDateStr}
            onChangeDate={setCurrentDateStr}
            dailyLog={dailyLog}
            onUpdateDailyLog={handleUpdateDailyLog}
            allLogs={allLogs}
            settings={settings}
            stats={stats}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressScreen
            allLogs={allLogs}
            settings={settings}
            stats={stats}
            selectedDateStr={currentDateStr}
            onSelectDate={(newDate) => {
              setCurrentDateStr(newDate);
              setActiveTab('today');
            }}
          />
        )}

        {activeTab === 'plan' && (
          <PlanScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            currentDayNumber={stats.currentDayNumber}
            currentDateStr={currentDateStr}
          />
        )}

        {activeTab === 'journal' && (
          <JournalScreen
            currentDateStr={currentDateStr}
            journal={journal}
            onSaveJournal={handleSaveJournal}
            dailyLog={dailyLog}
            settings={settings}
            stats={stats}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onRefreshData={handleRefreshData}
          />
        )}
      </main>

      {/* iPhone Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        todayScore={dailyLog.dailyScore}
      />
    </div>
  );
}
