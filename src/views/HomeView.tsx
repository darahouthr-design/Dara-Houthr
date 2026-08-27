import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoItem } from '../types';
import { INITIAL_VIDEOS, CATEGORIES } from '../data/mockData';
import { searchVideos } from '../services/youtubeApi';
import { VideoCard } from '../components/VideoCard';
import {
  Play,
  Flame,
  Clock,
  Sparkles,
  Heart,
  ListPlus,
  Compass,
  ChevronRight,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    playVideo,
    selectedCategory,
    setSelectedCategory,
    watchHistory,
    favorites,
    toggleFavorite,
    isFavorite,
    setSelectedVideoForPlaylist,
    setCurrentTab,
    t,
    language
  } = useApp();

  const [heroVideo, setHeroVideo] = useState<VideoItem>(INITIAL_VIDEOS[1]);
  const [trendingVideos, setTrendingVideos] = useState<VideoItem[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<VideoItem[]>([]);
  const [categoryVideos, setCategoryVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadFeeds() {
      const trending = await searchVideos('', 'all', 'views');
      if (isMounted && trending.length > 0) {
        setTrendingVideos(trending.slice(0, 8));
        setHeroVideo(trending[0]);
      } else {
        setTrendingVideos([...INITIAL_VIDEOS].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8));
      }

      const recs = await searchVideos('khmer popular music hits', 'all', 'relevance');
      if (isMounted && recs.length > 0) {
        setRecommendedVideos(recs.slice(0, 8));
      } else {
        setRecommendedVideos([...INITIAL_VIDEOS].sort(() => 0.5 - Math.random()));
      }
    }
    loadFeeds();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryVideos() {
      if (selectedCategory === 'all') {
        setCategoryVideos(INITIAL_VIDEOS);
        return;
      }
      setIsLoadingCategory(true);
      const results = await searchVideos('', selectedCategory, 'relevance');
      if (isMounted) {
        setCategoryVideos(results.length > 0 ? results : INITIAL_VIDEOS.filter(v => v.categoryId.toLowerCase() === selectedCategory.toLowerCase()));
        setIsLoadingCategory(false);
      }
    }
    loadCategoryVideos();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  const heroFavorited = isFavorite(heroVideo.videoId);

  // Filtered videos when category is selected
  const displayVideos = categoryVideos;

  return (
    <div id="home-view-container" className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const label = language === 'km' ? cat.nameKm : cat.nameEn;

          return (
            <button
              key={cat.id}
              id={`cat-pill-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm scale-105'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Hero Section (Spotlight Featured Video) */}
      {selectedCategory === 'all' && (
        <div
          id="home-hero-section"
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800/80 min-h-[360px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-10"
        >
          {/* Background Poster with Gradient Overlays */}
          <img
            src={heroVideo.thumbnail}
            alt={heroVideo.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                <Flame className="w-3.5 h-3.5 fill-white" /> Featured Spotlight
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 text-zinc-300 text-xs font-mono backdrop-blur-md">
                {heroVideo.duration}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
              {heroVideo.title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
              {heroVideo.description}
            </p>

            <div className="text-xs text-zinc-400 flex items-center gap-3">
              <span className="font-semibold text-white">{heroVideo.channelTitle}</span>
              <span>•</span>
              <span>{(heroVideo.viewCount / 1000000).toFixed(1)}M {t('views')}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{heroVideo.categoryName || 'Music'}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn-hero-watch-now"
                onClick={() => playVideo(heroVideo)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 hover:scale-105 transition"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
                {t('heroWatchNow')}
              </button>

              <button
                onClick={() => setSelectedVideoForPlaylist(heroVideo)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-sm backdrop-blur-md flex items-center gap-2 transition"
              >
                <ListPlus className="w-4 h-4" />
                {t('heroAddPlaylist')}
              </button>

              <button
                onClick={() => toggleFavorite(heroVideo)}
                className={`p-3 rounded-2xl backdrop-blur-md transition ${
                  heroFavorited
                    ? 'bg-red-600/30 text-red-400 border border-red-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${heroFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continue Watching Section if history exists */}
      {watchHistory.length > 0 && selectedCategory === 'all' && (
        <section id="section-continue-watching">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('continueWatching')}
              </h2>
            </div>
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
                className="group relative rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden cursor-pointer hover:border-red-500/50 hover:shadow-md transition"
              >
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${Math.max(10, item.progress)}%` }}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-red-500 transition">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                    {item.channel} • {item.progress}% watched
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Videos */}
      <section id="section-trending">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('trendingNow')}
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('explore')}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {displayVideos.slice(0, 8).map((video, idx) => (
            <VideoCard key={video.videoId} video={video} showRank={idx < 3 ? idx + 1 : undefined} />
          ))}
        </div>
      </section>

      {/* Khmer Songs & Cultural Collection Spotlight */}
      {selectedCategory === 'all' && (
        <section id="section-khmer-spotlight" className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-purple-500/10 border border-amber-500/20 dark:border-amber-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇰🇭</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('popularKhmerHits')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Timeless classics, golden era melodies, and modern Cambodian culture
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCategory('khmer')}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_VIDEOS.filter(v => v.categoryId === 'khmer').map(video => (
              <VideoCard key={video.videoId} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Videos */}
      <section id="section-recommended">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('recommendedForYou')}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {recommendedVideos.map(video => (
            <VideoCard key={`rec-${video.videoId}`} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
};
