import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoCard } from '../components/VideoCard';
import { Heart, Trash2, Filter } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { favorites, clearFavorites, t } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...new Set(favorites.map(v => v.categoryId).filter(Boolean))];

  const filteredFavorites =
    activeCategory === 'all'
      ? favorites
      : favorites.filter(v => v.categoryId.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div id="favorites-view-container" className="space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            {t('navFavorites')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {favorites.length} {t('videos')} saved to your favorites collection
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('clearHistory')}
          </button>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Heart className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
            {t('emptyFavorites')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click the heart icon on any video to add it to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredFavorites.map(video => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
