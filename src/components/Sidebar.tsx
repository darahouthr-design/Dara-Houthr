import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import {
  Home,
  Compass,
  Search,
  Tv,
  FolderHeart,
  DownloadCloud,
  Heart,
  History,
  ListMusic,
  FileAudio,
  Sliders,
  Settings,
  Info,
  Shield,
  Sparkles
} from 'lucide-react';

interface NavItemDef {
  id: NavigationTab;
  labelKey: any;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isSpecial?: boolean;
}

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, favorites, downloads, playlists, convertedAudioList, t } = useApp();

  const mainNav: NavItemDef[] = [
    { id: 'home', labelKey: 'navHome', icon: Home },
    { id: 'explore', labelKey: 'navExplore', icon: Compass },
    { id: 'search', labelKey: 'navSearch', icon: Search },
    { id: 'subscriptions', labelKey: 'navSubscriptions', icon: Tv },
  ];

  const libraryNav: NavItemDef[] = [
    { id: 'library', labelKey: 'navLibrary', icon: FolderHeart },
    { id: 'downloads', labelKey: 'navDownloads', icon: DownloadCloud, badge: downloads.length },
    { id: 'favorites', labelKey: 'navFavorites', icon: Heart, badge: favorites.length },
    { id: 'history', labelKey: 'navHistory', icon: History },
    { id: 'playlists', labelKey: 'navPlaylists', icon: ListMusic, badge: playlists.length },
  ];

  const toolsNav: NavItemDef[] = [
    { id: 'converter', labelKey: 'navConverter', icon: FileAudio, isSpecial: true, badge: convertedAudioList.length },
    { id: 'equalizer', labelKey: 'navEqualizer', icon: Sliders, isSpecial: true },
    { id: 'settings', labelKey: 'navSettings', icon: Settings },
    { id: 'about', labelKey: 'navAbout', icon: Info },
    { id: 'admin', labelKey: 'navAdmin', icon: Shield },
  ];

  const renderNavGroup = (title: string, items: NavItemDef[]) => (
    <div className="mb-5">
      {title && (
        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          {title}
        </p>
      )}
      <div className="space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                setCurrentTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition group ${
                isActive
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  : 'text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition group-hover:scale-110 ${
                    isActive
                      ? 'text-red-600 dark:text-red-400'
                      : item.isSpecial
                      ? 'text-indigo-500'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-zinc-400 dark:group-hover:text-zinc-200'
                  }`}
                />
                <span className="truncate">{t(item.labelKey)}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside
      id="main-sidebar"
      className="hidden md:flex flex-col w-60 xl:w-64 h-[calc(100vh-4.5rem)] sticky top-18 shrink-0 border-r border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-3 py-4 overflow-y-auto"
    >
      {renderNavGroup('', mainNav)}
      {renderNavGroup(t('navLibrary'), libraryNav)}
      {renderNavGroup('Tools & System', toolsNav)}

      {/* Compliance / Disclaimer Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-zinc-900 px-2">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 text-[11px] text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>YouTube Embedded API</span>
          </div>
          <p className="leading-relaxed">
            Respects API Terms & copyright permissions.
          </p>
        </div>
      </div>
    </aside>
  );
};
