import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoItem } from '../types';
import { searchVideos } from '../services/youtubeApi';
import { VideoCard } from '../components/VideoCard';
import {
  Search,
  SlidersHorizontal,
  Clock,
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const SearchView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    t
  } = useApp();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('any');
  const [filterDuration, setFilterDuration] = useState('any');
  const [filterSort, setFilterSort] = useState('relevance');

  useEffect(() => {
    let isMounted = true;
    async function executeSearch() {
      setIsLoading(true);
      const results = await searchVideos(searchQuery, 'all', filterSort, filterType);
      if (isMounted) {
        setVideos(results);
        setIsLoading(false);
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, filterSort, filterType, filterDuration, filterDate]);

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    addSearchHistory(query);
  };

  return (
    <div id="search-view-container" className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Search Header & Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-red-500" />
            {searchQuery ? `Results for "${searchQuery}"` : 'Explore & Search Videos'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {videos.length} videos found with YouTube Data API caching
          </p>
        </div>

        <button
          id="btn-toggle-search-filters"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition ${
            showFilters
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {t('filters')}
        </button>
      </div>

      {/* Quick Search Recommendations */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Popular:
        </span>
        {[
          'VannDa Time To Rise',
          'Khmer Golden Hits',
          'Galaxy Navatra',
          'Town Production',
          'Hang Meas HDTV',
          'Preap Sovath',
          'Sinn Sisamouth',
          'Lofi Chill Beats',
          'Trending 2026',
          'Gaming Highlights'
        ].map((tag, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickSearch(tag)}
            className="px-3 py-1 bg-white dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-zinc-700 dark:hover:text-white border border-slate-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-slate-700 dark:text-zinc-200 transition whitespace-nowrap shadow-xs"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Recent Searches Bar */}
      {searchHistory.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recent:
          </span>
          {searchHistory.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickSearch(item)}
              className="px-3 py-1 bg-slate-100 dark:bg-zinc-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-zinc-800 rounded-full text-xs font-medium text-slate-600 dark:text-zinc-300 transition whitespace-nowrap"
            >
              {item}
            </button>
          ))}
          <button
            onClick={clearSearchHistory}
            className="text-[11px] text-slate-400 hover:text-red-500 shrink-0 ml-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* Advanced Filter Drawer */}
      {showFilters && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-red-500" />
              {t('filterSort')}
            </label>
            <select
              value={filterSort}
              onChange={e => setFilterSort(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="relevance">{t('sortByRelevance')}</option>
              <option value="date">{t('sortByDate')}</option>
              <option value="views">{t('sortByViews')}</option>
              <option value="rating">{t('sortByRating')}</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              {t('filterType')}
            </label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">{t('typeAll')}</option>
              <option value="video">{t('typeVideo')}</option>
              <option value="channel">{t('typeChannel')}</option>
              <option value="playlist">{t('typePlaylist')}</option>
            </select>
          </div>

          {/* Upload Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {t('filterDate')}
            </label>
            <select
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="any">{t('dateAny')}</option>
              <option value="today">{t('dateToday')}</option>
              <option value="week">{t('dateWeek')}</option>
              <option value="month">{t('dateMonth')}</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {t('filterDuration')}
            </label>
            <select
              value={filterDuration}
              onChange={e => setFilterDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="any">{t('durationAny')}</option>
              <option value="short">{t('durationShort')}</option>
              <option value="medium">{t('durationMedium')}</option>
              <option value="long">{t('durationLong')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div
              key={n}
              className="aspect-video w-full rounded-2xl bg-slate-200 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Search className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
            {t('noResultsFound')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for "Khmer songs", "Despacito", "Tech", or "Gaming".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {videos.map(video => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
