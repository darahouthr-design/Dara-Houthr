import React from 'react';
import { useApp } from '../context/AppContext';
import { VideoCard } from '../components/VideoCard';
import {
  FolderHeart,
  Heart,
  History,
  ListMusic,
  DownloadCloud,
  FileAudio,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const {
    favorites,
    watchHistory,
    playlists,
    downloads,
    convertedAudioList,
    setCurrentTab,
    playVideo,
    t
  } = useApp();

  return (
    <div id="library-view-container" className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-red-500" />
            {t('navLibrary')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            All your saved media, custom playlists, offline downloads, and converted audio
          </p>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setCurrentTab('favorites')}
          className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex flex-col justify-between shadow-md hover:scale-105 transition text-left"
        >
          <Heart className="w-6 h-6 fill-white/80 mb-3" />
          <div>
            <p className="text-xs text-rose-100">{t('navFavorites')}</p>
            <p className="text-lg font-extrabold">{favorites.length} {t('videos')}</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('playlists')}
          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col justify-between shadow-md hover:scale-105 transition text-left"
        >
          <ListMusic className="w-6 h-6 mb-3" />
          <div>
            <p className="text-xs text-indigo-100">{t('navPlaylists')}</p>
            <p className="text-lg font-extrabold">{playlists.length} Lists</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('downloads')}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col justify-between shadow-md hover:scale-105 transition text-left"
        >
          <DownloadCloud className="w-6 h-6 mb-3" />
          <div>
            <p className="text-xs text-emerald-100">{t('navDownloads')}</p>
            <p className="text-lg font-extrabold">{downloads.length} Files</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('converter')}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex flex-col justify-between shadow-md hover:scale-105 transition text-left"
        >
          <FileAudio className="w-6 h-6 mb-3" />
          <div>
            <p className="text-xs text-amber-100">{t('navConverter')}</p>
            <p className="text-lg font-extrabold">{convertedAudioList.length} MP3s</p>
          </div>
        </button>
      </div>

      {/* Recent History Preview */}
      {watchHistory.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" />
              {t('recentHistory')}
            </h3>
            <button
              onClick={() => setCurrentTab('history')}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {watchHistory.slice(0, 4).map(item => (
              <div
                key={item.videoId}
                onClick={() => playVideo(item.videoId)}
                className="group p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500/50 cursor-pointer transition"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full aspect-video rounded-xl object-cover mb-2"
                />
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-red-500 transition">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">{item.channel}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Favorites Preview */}
      {favorites.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              {t('navFavorites')}
            </h3>
            <button
              onClick={() => setCurrentTab('favorites')}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favorites.slice(0, 4).map(vid => (
              <VideoCard key={vid.videoId} video={vid} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
