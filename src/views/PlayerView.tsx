import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoItem } from '../types';
import { getVideoDetails, getRelatedVideos } from '../services/youtubeApi';
import { VideoCard } from '../components/VideoCard';
import {
  ThumbsUp,
  Heart,
  ListPlus,
  Share2,
  ExternalLink,
  Download,
  ShieldCheck,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Sparkles,
  Tv
} from 'lucide-react';

export const PlayerView: React.FC = () => {
  const {
    activeVideoId,
    activeVideo,
    playVideo,
    openChannel,
    isFavorite,
    toggleFavorite,
    setSelectedVideoForPlaylist,
    setShareVideoTarget,
    startDownload,
    addToHistory,
    t
  } = useApp();

  const [video, setVideo] = useState<VideoItem | null>(activeVideo);
  const [relatedVideos, setRelatedVideos] = useState<VideoItem[]>([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    if (!activeVideoId) return;

    let isMounted = true;

    async function loadData() {
      const v = await getVideoDetails(activeVideoId!);
      if (isMounted) {
        setVideo(v);
        setLikeCount(v.likeCount);
        addToHistory(v, 10, v.durationSeconds || 240);
      }

      const rel = await getRelatedVideos(activeVideoId!);
      if (isMounted) {
        setRelatedVideos(rel);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeVideoId]);

  if (!activeVideoId || !video) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading video player...</p>
      </div>
    );
  }

  const favorited = isFavorite(video.videoId);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  return (
    <div
      id="video-player-page-container"
      className={`space-y-6 pb-20 animate-in fade-in duration-300 ${
        isTheaterMode ? 'max-w-none' : 'max-w-7xl mx-auto'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Player Column */}
        <div className={`space-y-4 ${isTheaterMode ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          {/* Official YouTube Embedded Player */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800">
            <iframe
              id="youtube-official-embed-frame"
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&origin=${encodeURIComponent(
                window.location.origin
              )}`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Video Title & Primary Header */}
          <div className="space-y-3">
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
              {/* Channel Info & Subscribe */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openChannel(video.channelId)}
                  className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 hover:ring-2 hover:ring-red-500 transition"
                >
                  <img
                    src={
                      video.channelAvatar ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${video.channelTitle}`
                    }
                    alt={video.channelTitle}
                    className="w-full h-full object-cover"
                  />
                </button>
                <div>
                  <h3
                    onClick={() => openChannel(video.channelId)}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-red-500 cursor-pointer transition truncate"
                  >
                    {video.channelTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    2.45M {t('subscribers')}
                  </p>
                </div>

                <button
                  id="btn-player-subscribe"
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`ml-2 px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                    isSubscribed
                      ? 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isSubscribed ? <Check className="w-3.5 h-3.5" /> : null}
                  {isSubscribed ? t('subscribed') : t('subscribe')}
                </button>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Like Button */}
                <button
                  id="btn-like-video"
                  onClick={handleLike}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                    isLiked
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                  <span>{formatNumber(likeCount)}</span>
                </button>

                {/* Favorite */}
                <button
                  id="btn-favorite-video"
                  onClick={() => toggleFavorite(video)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                    favorited
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{t('heroFavorite')}</span>
                </button>

                {/* Add to Playlist */}
                <button
                  id="btn-add-to-playlist"
                  onClick={() => setSelectedVideoForPlaylist(video)}
                  className="px-3.5 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>

                {/* Share */}
                <button
                  id="btn-share-video"
                  onClick={() => setShareVideoTarget(video)}
                  className="px-3.5 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t('share')}</span>
                </button>

                {/* Theater Mode toggle */}
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition hidden sm:flex"
                  title={t('theaterMode')}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Watch on YouTube button */}
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 flex items-center gap-1.5 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('watchOnYouTube')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Description Section with Expand/Collapse */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 text-xs sm:text-sm text-slate-800 dark:text-zinc-300 space-y-2">
            <div className="flex items-center gap-3 font-semibold text-slate-500 dark:text-zinc-400">
              <span>{formatNumber(video.viewCount)} {t('views')}</span>
              <span>•</span>
              <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-red-500 font-bold">#{video.categoryId}</span>
            </div>

            <div
              className={`leading-relaxed whitespace-pre-line ${
                isDescExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {video.description || 'No description provided.'}
            </div>

            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {video.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-[11px] font-medium text-slate-600 dark:text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="mt-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              {isDescExpanded ? t('showLess') : t('showMore')}
              {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Offline Download Status & Legal Compliance Box */}
          <div className="p-4 rounded-2xl border bg-slate-50/80 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {video.isDownloadableAuthorized
                    ? t('authorizedDownloadAvailable')
                    : 'YouTube Stream Protection'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                  {video.isDownloadableAuthorized
                    ? 'This creative media file is authorized for offline local storage and conversion.'
                    : t('unauthorizedDownloadNotice')}
                </p>
              </div>
            </div>

            {video.isDownloadableAuthorized ? (
              <button
                onClick={() => startDownload(video, '720p')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition shrink-0"
              >
                <Download className="w-4 h-4" />
                {t('downloadAuthorized')}
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 rounded-xl font-medium shrink-0">
                Online Streaming Only
              </span>
            )}
          </div>
        </div>

        {/* Related Videos Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-red-500" />
              {t('relatedVideos')}
            </h3>
          </div>

          <div className="space-y-3">
            {relatedVideos.map(relVideo => (
              <VideoCard key={`related-${relVideo.videoId}`} video={relVideo} layout="horizontal" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
