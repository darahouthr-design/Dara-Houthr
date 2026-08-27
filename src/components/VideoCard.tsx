import React, { useState } from 'react';
import { VideoItem } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Heart, ListPlus, Share2, MoreVertical, Download, Check, ShieldAlert } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  layout?: 'grid' | 'horizontal' | 'compact';
  showRank?: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, layout = 'grid', showRank }) => {
  const {
    playVideo,
    openChannel,
    isFavorite,
    toggleFavorite,
    setSelectedVideoForPlaylist,
    setShareVideoTarget,
    startDownload,
    t
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const favorited = isFavorite(video.videoId);

  const formatViews = (views: number): string => {
    if (views >= 1000000000) return (views / 1000000000).toFixed(1) + 'B';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return String(views);
  };

  const formatPublished = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 1) return 'Today';
      if (diffDays < 30) return `${diffDays}d ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
      return `${Math.floor(diffDays / 365)}y ago`;
    } catch {
      return 'Recently';
    }
  };

  if (layout === 'horizontal') {
    return (
      <div
        id={`video-card-horizontal-${video.videoId}`}
        className="group relative flex gap-3 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800/70 hover:border-red-500/50 transition shadow-sm hover:shadow-md"
      >
        {/* Thumbnail */}
        <div
          onClick={() => playVideo(video)}
          className="relative w-40 sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-semibold text-white font-mono">
            {video.duration}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <h4
              onClick={() => playVideo(video)}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 cursor-pointer group-hover:text-red-600 dark:group-hover:text-red-400 transition"
            >
              {video.title}
            </h4>
            <p
              onClick={() => openChannel(video.channelId)}
              className="text-xs text-slate-500 dark:text-zinc-400 mt-1 hover:text-slate-900 dark:hover:text-zinc-200 cursor-pointer truncate"
            >
              {video.channelTitle}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              {formatViews(video.viewCount)} {t('views')} • {formatPublished(video.publishedAt)}
            </p>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => toggleFavorite(video)}
              className={`p-1.5 rounded-lg transition ${
                favorited
                  ? 'text-red-500 bg-red-50 dark:bg-red-950/40'
                  : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title={t('heroFavorite')}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={() => setSelectedVideoForPlaylist(video)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              title={t('addVideoToPlaylist')}
            >
              <ListPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShareVideoTarget(video)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              title={t('share')}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`video-card-grid-${video.videoId}`}
      className="group flex flex-col rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/70 dark:border-zinc-800/70 overflow-hidden hover:border-red-500/50 hover:shadow-lg transition-all duration-300"
    >
      {/* Thumbnail */}
      <div
        onClick={() => playVideo(video)}
        className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 text-[11px] font-bold text-white font-mono">
          {video.duration}
        </span>

        {/* Rank Badge if specified */}
        {showRank && (
          <span className="absolute top-2 left-2 w-7 h-7 rounded-xl bg-red-600/90 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
            #{showRank}
          </span>
        )}

        {/* Authorized Download Badge */}
        {video.isDownloadableAuthorized && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
            <Check className="w-3 h-3" /> Offline Ready
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex gap-3">
        {/* Channel Avatar */}
        <button
          onClick={() => openChannel(video.channelId)}
          className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 hover:ring-2 hover:ring-red-500 transition"
        >
          <img
            src={video.channelAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${video.channelTitle}`}
            alt={video.channelTitle}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            onClick={() => playVideo(video)}
            className="text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 leading-snug cursor-pointer group-hover:text-red-600 dark:group-hover:text-red-400 transition"
          >
            {video.title}
          </h4>

          <p
            onClick={() => openChannel(video.channelId)}
            className="text-xs text-slate-500 dark:text-zinc-400 mt-1 hover:text-slate-900 dark:hover:text-zinc-200 cursor-pointer truncate font-medium"
          >
            {video.channelTitle}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
            <span>
              {formatViews(video.viewCount)} {t('views')} • {formatPublished(video.publishedAt)}
            </span>

            {/* Quick Actions Dropdown / buttons */}
            <div className="relative flex items-center gap-1">
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleFavorite(video);
                }}
                className={`p-1 rounded-lg transition ${
                  favorited ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                }`}
                title="Favorite"
              >
                <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-red-500' : ''}`} />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  setSelectedVideoForPlaylist(video);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-500 transition"
                title="Add to Playlist"
              >
                <ListPlus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  setShareVideoTarget(video);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-blue-500 transition"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
