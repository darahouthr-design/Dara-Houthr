import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import { Home, Compass, Search, FolderHeart, FileAudio } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, t } = useApp();

  const navItems: { id: NavigationTab; labelKey: any; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', labelKey: 'navHome', icon: Home },
    { id: 'explore', labelKey: 'navExplore', icon: Compass },
    { id: 'search', labelKey: 'navSearch', icon: Search },
    { id: 'converter', labelKey: 'navConverter', icon: FileAudio },
    { id: 'library', labelKey: 'navLibrary', icon: FolderHeart },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around px-2"
    >
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => {
              setCurrentTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              isActive
                ? 'text-red-600 dark:text-red-400 font-bold scale-105'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight truncate max-w-[60px]">
              {t(item.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
