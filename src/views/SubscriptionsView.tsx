import React from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_CHANNELS, INITIAL_VIDEOS } from '../data/mockData';
import { VideoCard } from '../components/VideoCard';
import { Tv, CheckCircle2, Bell, Sparkles } from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const { openChannel, playVideo, t } = useApp();

  return (
    <div id="subscriptions-view-container" className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-red-500" />
            {t('navSubscriptions')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Latest uploads from creators and official music channels
          </p>
        </div>
      </div>

      {/* Subscribed Channels Avatars row */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {INITIAL_CHANNELS.map(ch => (
          <button
            key={ch.channelId}
            onClick={() => openChannel(ch.channelId)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div className="relative">
              <img
                src={ch.avatar}
                alt={ch.title}
                className="w-14 h-14 rounded-full object-cover border-2 border-red-500 p-0.5 group-hover:scale-105 transition shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 max-w-[70px] truncate group-hover:text-red-500 transition">
              {ch.title}
            </span>
          </button>
        ))}
      </div>

      {/* Latest Feed from Subscribed Channels */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Latest Uploads
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {INITIAL_VIDEOS.map(video => (
            <VideoCard key={`sub-${video.videoId}`} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};
