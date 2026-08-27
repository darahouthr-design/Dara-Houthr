import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChannelItem, VideoItem } from '../types';
import { getChannelDetails, getChannelVideos } from '../services/youtubeApi';
import { VideoCard } from '../components/VideoCard';
import { Check, ExternalLink, Tv, Film, ListMusic, Info, ShieldCheck } from 'lucide-react';

export const ChannelView: React.FC = () => {
  const { activeChannelId, playVideo, t } = useApp();
  const [channel, setChannel] = useState<ChannelItem | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'playlists' | 'about'>('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!activeChannelId) return;

    let isMounted = true;
    async function loadChannel() {
      const ch = await getChannelDetails(activeChannelId!);
      if (isMounted) setChannel(ch);

      const vids = await getChannelVideos(activeChannelId!);
      if (isMounted) setVideos(vids);
    }

    loadChannel();

    return () => {
      isMounted = false;
    };
  }, [activeChannelId]);

  if (!channel) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading channel profile...</p>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  };

  return (
    <div id="channel-view-container" className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="relative h-40 sm:h-56 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-md">
        <img
          src={channel.banner}
          alt={channel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Profile Info Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <img
            src={channel.avatar}
            alt={channel.title}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-zinc-950 shadow-xl object-cover -mt-10 sm:-mt-12 relative z-10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {channel.title}
              </h1>
              <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500/20" />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {channel.handle} • {channel.subscriberCount} {t('subscribers')} • {channel.videoCount} {t('videos')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setIsSubscribed(!isSubscribed)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-md ${
              isSubscribed
                ? 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isSubscribed && <Check className="w-4 h-4" />}
            {isSubscribed ? t('subscribed') : t('subscribe')}
          </button>

          <a
            href={`https://www.youtube.com/${channel.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
            title="Open on YouTube"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 text-sm font-semibold px-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'videos'
              ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Film className="w-4 h-4" />
          {t('videos')}
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'about'
              ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Info className="w-4 h-4" />
          {t('channelAbout')}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {videos.map(video => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 max-w-3xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
              {channel.description || 'No channel description provided.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Joined YouTube</p>
              <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                {new Date(channel.joinedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Total Views</p>
              <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5 font-mono">
                {channel.totalViews?.toLocaleString() || '150,000,000+'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Location</p>
              <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">Worldwide / Cambodia</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
