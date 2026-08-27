import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EqualizerView } from './EqualizerView';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Sliders,
  HardDrive,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Check,
  Volume2,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    playbackSettings,
    updatePlaybackSettings,
    clearWatchHistory,
    clearFavorites,
    downloads,
    convertedAudioList,
    showToast,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'equalizer' | 'playback' | 'storage'>('equalizer');

  const handleClearAllStorage = () => {
    if (window.confirm('Are you sure you want to reset all stored playlists, favorites, and history?')) {
      localStorage.clear();
      showToast('All local storage data reset', 'info');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <div id="settings-view-container" className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-500" />
            {t('navSettings')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {language === 'km'
              ? 'គ្រប់គ្រងមុខងារ Equalizer កែប្រែសម្លេង រូបរាង ភាសា និងទំហំផ្ទុក'
              : 'Manage audio equalizer studio, theme, language, playback preferences, and data'}
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-zinc-800 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'equalizer'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('navEqualizer') || 'មុខងារ Equalizer'}</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'general'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{t('appearanceSection') || 'Appearance & Language'}</span>
          </button>

          <button
            onClick={() => setActiveTab('playback')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'playback'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('playbackSection') || 'Playback'}</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'storage'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{t('storageSection') || 'Storage'}</span>
          </button>
        </div>
      </div>

      {/* Render Equalizer Tab */}
      {activeTab === 'equalizer' && <EqualizerView />}

      {/* Render General Appearance & Language Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Appearance & Theme */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              {t('settingsTheme')}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  theme === 'light'
                    ? 'bg-slate-50 border-red-500 ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t('themeLight')}</p>
                    <p className="text-[11px] text-slate-500">Clean, crisp light canvas</p>
                  </div>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-red-500" />}
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-red-500 ring-2 ring-red-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-white">{t('themeDark')}</p>
                    <p className="text-[11px] text-zinc-400">Eye-safe midnight aesthetic</p>
                  </div>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-red-500" />}
              </button>
            </div>
          </div>

          {/* Language Preferences */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-500" />
              {t('settingsLanguage')}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('en')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  language === 'en'
                    ? 'bg-slate-50 dark:bg-zinc-800 border-red-500 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">English 🇺🇸</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">United States / Global</p>
                </div>
                {language === 'en' && <Check className="w-4 h-4 text-red-500" />}
              </button>

              <button
                onClick={() => setLanguage('km')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  language === 'km'
                    ? 'bg-slate-50 dark:bg-zinc-800 border-red-500 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">ភាសាខ្មែរ (Khmer) 🇰🇭</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Cambodian Khmer translation</p>
                </div>
                {language === 'km' && <Check className="w-4 h-4 text-red-500" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Playback Settings Tab */}
      {activeTab === 'playback' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            {t('settingsPlayback')}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('playbackAutoplay')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Play next recommended video when current video ends
                </p>
              </div>
              <input
                type="checkbox"
                checked={playbackSettings.autoPlayNext}
                onChange={e => updatePlaybackSettings({ autoPlayNext: e.target.checked })}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('playbackQuality')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Default preferred streaming resolution
                </p>
              </div>
              <select
                value={playbackSettings.preferredQuality}
                onChange={e => updatePlaybackSettings({ preferredQuality: e.target.value as any })}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-semibold"
              >
                <option value="auto">Auto Adaptive</option>
                <option value="1080p">1080p FHD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Render Storage & Privacy Controls Tab */}
      {activeTab === 'storage' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            {t('settingsStorage')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <p className="text-xs text-slate-500 dark:text-zinc-400">Offline Downloads</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {downloads.length} files saved
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <p className="text-xs text-slate-500 dark:text-zinc-400">Converted MP3 Files</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {convertedAudioList.length} items
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={clearWatchHistory}
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              {t('clearHistory')}
            </button>

            <button
              onClick={clearFavorites}
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              Clear Favorites
            </button>

            <button
              onClick={handleClearAllStorage}
              className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

