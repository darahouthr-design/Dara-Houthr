import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getSearchSuggestions } from '../services/youtubeApi';
import {
  Search,
  Mic,
  Bell,
  Sun,
  Moon,
  Globe,
  SlidersHorizontal,
  Sparkles,
  User,
  LogOut,
  Shield,
  Film,
  Check,
  TrendingUp,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setCurrentTab,
    addSearchHistory,
    language,
    setLanguage,
    theme,
    setTheme,
    user,
    logoutUser,
    setIsAuthModalOpen,
    setIsVoiceSearchOpen,
    t
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync when global searchQuery changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced suggestion fetch
  useEffect(() => {
    if (!localSearch.trim() || localSearch.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await getSearchSuggestions(localSearch);
      setSuggestions(results.slice(0, 7));
    }, 200);

    return () => clearTimeout(timer);
  }, [localSearch]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    setShowSuggestions(false);
    setSearchQuery(localSearch.trim());
    addSearchHistory(localSearch.trim());
    setCurrentTab('search');
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setLocalSearch(suggestion);
    setShowSuggestions(false);
    setSearchQuery(suggestion);
    addSearchHistory(suggestion);
    setCurrentTab('search');
  };

  const notifications = [
    {
      id: '1',
      title: 'Khmer Golden Hits updated',
      desc: 'New remastered classic track added to featured collection.',
      time: '10m ago'
    },
    {
      id: '2',
      title: 'Offline Download Ready',
      desc: 'Angkor Wat 4K Ultra HD Drone Tour is saved locally.',
      time: '1h ago'
    },
    {
      id: '3',
      title: 'YouTube API Proxy Connected',
      desc: 'Quota optimized caching active.',
      time: '3h ago'
    }
  ];

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 w-full h-16 sm:h-18 px-3 sm:px-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2 sm:gap-4 transition-colors"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          id="btn-header-home-logo"
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition">
            <Film className="w-5 h-5 fill-white/90 text-white" />
          </div>
          <div className="hidden min-[480px]:flex flex-col text-left">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              Video<span className="text-red-600">Hub</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
              Player
            </span>
          </div>
        </button>
      </div>

      {/* Middle: Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-2xl mx-1 sm:mx-4">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="header-search-input"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={localSearch}
              onFocus={() => setShowSuggestions(true)}
              onChange={e => {
                setLocalSearch(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full h-10 sm:h-11 pl-10 pr-24 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500 transition"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSuggestions([]);
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="btn-voice-search"
                type="button"
                onClick={() => setIsVoiceSearchOpen(true)}
                title={t('voiceSearch')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                id="btn-submit-search"
                type="submit"
                className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full hidden sm:flex items-center gap-1 shadow-sm transition"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 py-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in-50 duration-150">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-red-500" />
              YouTube Suggestions
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Controls (Language, Theme, Notifications, Profile) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Language Switcher */}
        <div className="relative">
          <button
            id="btn-language-selector"
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition"
          >
            <Globe className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline font-semibold">
              {language === 'km' ? 'ខ្មែរ 🇰🇭' : 'EN 🇺🇸'}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in">
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLangMenu(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <span>English (US) 🇺🇸</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-red-500" />}
              </button>
              <button
                onClick={() => {
                  setLanguage('km');
                  setShowLangMenu(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <span>ភាសាខ្មែរ (Khmer) 🇰🇭</span>
                {language === 'km' && <Check className="w-3.5 h-3.5 text-red-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          id="btn-theme-switcher"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition"
          aria-label="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="btn-notifications-bell"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
              setShowLangMenu(false);
            }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('notifications')}
                </span>
                <span className="text-[11px] text-red-500 font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                  >
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {item.desc}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          {user.isLoggedIn ? (
            <button
              id="btn-user-profile"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowLangMenu(false);
              }}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-red-500/50 transition"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
              />
            </button>
          ) : (
            <button
              id="btn-header-signin"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('signIn')}</span>
            </button>
          )}

          {showProfileMenu && user.isLoggedIn && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-100 dark:border-zinc-800">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  {t('navSettings')}
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('admin');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                >
                  <Shield className="w-4 h-4" />
                  {t('navAdmin')}
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  {t('signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
