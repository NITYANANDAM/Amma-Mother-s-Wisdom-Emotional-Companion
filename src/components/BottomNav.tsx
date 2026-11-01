import React from 'react';
import { Home, MessageCircleHeart, Scale, Sparkles, CheckCircle2, UserCog } from 'lucide-react';

export type TabType = 'home' | 'chat' | 'dilemma' | 'calm' | 'reminders' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  pendingRemindersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingRemindersCount,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'chat' as TabType,
      label: 'Amma AI',
      icon: MessageCircleHeart,
    },
    {
      id: 'dilemma' as TabType,
      label: 'Wisdom',
      icon: Scale,
    },
    {
      id: 'calm' as TabType,
      label: 'Comfort',
      icon: Sparkles,
    },
    {
      id: 'reminders' as TabType,
      label: 'Care',
      icon: CheckCircle2,
      badge: pendingRemindersCount > 0 ? pendingRemindersCount : undefined,
    },
    {
      id: 'settings' as TabType,
      label: 'Persona',
      icon: UserCog,
    },
  ];

  return (
    <nav className="shrink-0 bg-white/90 backdrop-blur-md border-t border-amber-900/10 px-2 py-1.5 flex items-center justify-around z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-rose-600 scale-105'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'stroke-[2.4] -translate-y-0.5' : 'stroke-[1.8]'
                }`}
              />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isActive ? 'font-bold text-rose-700' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1 bg-rose-500 rounded-full mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
