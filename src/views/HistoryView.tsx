import React from 'react';
import { useApp } from '../context/AppContext';
import { History, Trash2, Play, PauseCircle, Clock, CheckCircle2 } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const {
    watchHistory,
    clearWatchHistory,
    removeFromWatchHistory,
    playVideo,
    playbackSettings,
    updatePlaybackSettings,
    t
  } = useApp();

  return (
    <div id="history-view-container" className="space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-red-500" />
            {t('navHistory')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {watchHistory.length} {t('videos')} in your local watch activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause History toggle */}
          <button
            onClick={() =>
              updatePlaybackSettings({
                autoPlayNext: !playbackSettings.autoPlayNext
              })
            }
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Auto Next ({playbackSettings.autoPlayNext ? 'ON' : 'OFF'})</span>
          </button>

          {watchHistory.length > 0 && (
            <button
              onClick={clearWatchHistory}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('clearHistory')}
            </button>
          )}
        </div>
      </div>

      {watchHistory.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <History className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
            {t('emptyHistory')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Videos you watch will automatically be logged here with resume timestamps.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchHistory.map(item => (
            <div
              key={`${item.videoId}-${item.lastWatched}`}
              className="group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-red-500/50 transition shadow-sm"
            >
              <div
                onClick={() => playVideo(item.videoId)}
                className="flex items-center gap-3.5 cursor-pointer min-w-0 flex-1"
              >
                <div className="relative w-36 sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${Math.max(5, item.progress)}%` }}
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-red-500 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    {item.channel}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-2">
                    <span>Watched on {new Date(item.lastWatched).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-red-500 font-semibold">{item.progress}% completed</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeFromWatchHistory(item.videoId)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition ml-2"
                title="Remove from history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
