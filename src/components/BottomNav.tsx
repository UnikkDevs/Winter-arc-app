import React from 'react';
import { Calendar, BarChart3, CheckSquare, BookOpen, Settings } from 'lucide-react';

export type TabType = 'today' | 'progress' | 'plan' | 'journal' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  todayScore: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, todayScore }) => {
  const tabs = [
    {
      id: 'today' as TabType,
      label: 'TODAY',
      icon: CheckSquare,
      badge: todayScore > 0 ? `${todayScore}%` : null,
    },
    {
      id: 'progress' as TabType,
      label: 'PROGRESS',
      icon: BarChart3,
    },
    {
      id: 'plan' as TabType,
      label: 'PLAN',
      icon: Calendar,
    },
    {
      id: 'journal' as TabType,
      label: 'JOURNAL',
      icon: BookOpen,
    },
    {
      id: 'settings' as TabType,
      label: 'SETTINGS',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 frost-nav select-none pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <div className="max-w-md mx-auto px-3 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[58px] min-h-[46px] rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {/* Subtle top indicator bar */}
              {isActive && (
                <div className="absolute -top-2 w-8 h-1 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-sm shadow-sky-400/50 animate-in fade-in" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-sky-400' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-black px-1 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono-numbers">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-wider font-bold uppercase transition-colors ${
                  isActive ? 'text-white font-extrabold' : 'text-neutral-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
