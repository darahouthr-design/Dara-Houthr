import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_VIDEOS, CATEGORIES } from '../data/mockData';
import { VideoCard } from '../components/VideoCard';
import {
  Compass,
  Flame,
  Music,
  Gamepad2,
  Cpu,
  BookOpen,
  Trophy,
  Zap,
  Film,
  Radio,
  Smile
} from 'lucide-react';

export const ExploreView: React.FC = () => {
  const { playVideo, selectedCategory, setSelectedCategory, t, language } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const exploreHighlights = [
    { id: 'trending', label: 'Trending', icon: Flame, color: 'from-amber-500 to-red-600' },
    { id: 'music', label: 'Music', icon: Music, color: 'from-pink-500 to-rose-600' },
    { id: 'khmer', label: 'Khmer Culture 🇰🇭', icon: Compass, color: 'from-amber-600 to-orange-700' },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'from-purple-500 to-indigo-600' },
    { id: 'technology', label: 'Technology', icon: Cpu, color: 'from-cyan-500 to-blue-600' },
    { id: 'education', label: 'Education', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { id: 'sports', label: 'Sports', icon: Trophy, color: 'from-blue-500 to-indigo-600' },
    { id: 'shorts', label: 'Shorts & Quick Clips', icon: Zap, color: 'from-red-500 to-rose-700' },
  ];

  const filteredVideos =
    activeTab === 'all' || activeTab === 'trending'
      ? INITIAL_VIDEOS
      : INITIAL_VIDEOS.filter(v => v.categoryId.toLowerCase() === activeTab.toLowerCase());

  return (
    <div id="explore-view-container" className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-red-600 via-rose-600 to-purple-800 text-white shadow-xl">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-6 h-6 text-amber-300" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
              {t('navExplore')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Discover What's Happening on YouTube
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            Browse top chart music, viral games, technology tutorials, and iconic Cambodian classics.
          </p>
        </div>
      </div>

      {/* Category Hero Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {exploreHighlights.map(item => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-between shadow-md hover:scale-105 transition transform text-left ${
                isSelected ? 'ring-4 ring-white/50 dark:ring-white/30' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <div>
                <Icon className="w-6 h-6 mb-2" />
                <span className="font-bold text-xs sm:text-sm block">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {activeTab === 'all' ? 'All Curated Topics' : `${activeTab} Highlights`}
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            {filteredVideos.length} {t('videos')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredVideos.map(video => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};
