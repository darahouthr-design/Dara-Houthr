import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DownloadItem } from '../types';
import {
  DownloadCloud,
  Play,
  Trash2,
  CheckCircle2,
  HardDrive,
  FileAudio,
  ShieldCheck,
  Pause,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Music
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DownloadsView: React.FC = () => {
  const {
    downloads,
    removeDownload,
    pauseDownload,
    resumeDownload,
    setCurrentTab,
    playOfflineVideo,
    convertDownloadToMp3,
    setConverterPreload,
    convertedAudioList,
    playAudio,
    nowPlayingAudio,
    showToast,
    t
  } = useApp();

  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [conversionStatus, setConversionStatus] = useState<string>('');

  const totalBytes = downloads.reduce((acc, curr) => {
    const bytes =
      curr.fileSize ||
      (curr.fileSizeMB ? curr.fileSizeMB * 1024 * 1024 : 0) ||
      120 * 1024 * 1024;
    return acc + bytes;
  }, 0);

  const formatMB = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '120.0 MB';
    if (val > 10000) {
      return (val / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return Number(val).toFixed(1) + ' MB';
  };

  const handleConvertClick = async (item: DownloadItem) => {
    setConvertingId(item.id);
    setConversionProgress(10);
    setConversionStatus('Initializing audio extraction...');

    try {
      const result = await convertDownloadToMp3(item, (p, msg) => {
        setConversionProgress(p);
        setConversionStatus(msg);
      });

      if (result) {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    } catch (err: any) {
      showToast(`Conversion error: ${err?.message || 'Failed'}`, 'error');
    } finally {
      setConvertingId(null);
      setConversionProgress(0);
      setConversionStatus('');
    }
  };

  const handleOpenInConverterStudio = (item: DownloadItem) => {
    setConverterPreload({
      title: item.title,
      artist: item.channel || 'Artist',
      album: 'VideoHub Collection'
    });
    setCurrentTab('converter');
    showToast(`Loaded "${item.title.slice(0, 25)}..." into Converter Studio`, 'info');
  };

  return (
    <div id="downloads-view-container" className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-emerald-500" />
            {t('navDownloads')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Authorized offline media stored in local browser cache and IndexedDB storage
          </p>
        </div>

        {/* Storage Stats Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
          <HardDrive className="w-4 h-4" />
          <span>
            {t('storageUsed') || 'Storage Used'}: {formatMB(totalBytes)} ({downloads.length} files)
          </span>
        </div>
      </div>

      {/* Compliance / Policy Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-3 text-xs text-slate-600 dark:text-zinc-400">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-zinc-200">
            Authorized Content Policy:
          </span>{' '}
          VideoHub complies with YouTube Terms of Service. Offline caching is only active for
          permissible creative media and user-authorized assets. YouTube DRM-protected streams are
          streamed exclusively via the official player.
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <DownloadCloud className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
            {t('emptyDownloads') || t('noDownloadsYet')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Authorized content with offline rights can be downloaded directly from the video player
            page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map(item => {
            const isCompleted = item.status === 'completed';
            const isDownloading = item.status === 'downloading';
            const isPaused = item.status === 'paused';
            const isConvertingThis = convertingId === item.id;
            
            // Check if this item already has a converted MP3 in library
            const existingMp3 = convertedAudioList.find(
              a => a.title.toLowerCase() === item.title.toLowerCase() || a.originalFileName?.includes(item.title.slice(0, 10))
            );

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border transition shadow-sm ${
                  isConvertingThis
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {isCompleted && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <button
                            onClick={() => playOfflineVideo(item)}
                            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow transition hover:scale-105"
                            title="Play Offline"
                          >
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {item.quality}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        {item.channel} • {formatMB(item.fileSizeMB || item.fileSize || 120)}
                      </p>

                      {/* Progress indicator */}
                      <div className="mt-2 space-y-1">
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isPaused
                                ? 'bg-amber-500'
                                : 'bg-indigo-600 animate-pulse'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            {isCompleted
                              ? t('completed') || 'Downloaded'
                              : isPaused
                              ? t('paused') || 'Paused'
                              : `${item.progress}% • ${item.downloadedMB ? `${item.downloadedMB}MB` : 'Downloading'}`}
                          </span>
                          <span>{item.isAudioOnly ? 'MP3' : item.format?.toUpperCase() || 'MP4'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                    {isCompleted ? (
                      <>
                        <button
                          onClick={() => playOfflineVideo(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{t('playOffline') || 'Play Offline'}</span>
                        </button>

                        {/* Convert to MP3 Button */}
                        {isConvertingThis ? (
                          <div className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Converting ({conversionProgress}%)</span>
                          </div>
                        ) : existingMp3 ? (
                          <button
                            onClick={() => playAudio(existingMp3)}
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            title="Play Converted MP3"
                          >
                            <Music className="w-3.5 h-3.5" />
                            <span>Play MP3</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConvertClick(item)}
                            className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                            title="Convert this offline file to MP3"
                          >
                            <FileAudio className="w-3.5 h-3.5 text-amber-600" />
                            <span>Convert MP3</span>
                          </button>
                        )}
                      </>
                    ) : isDownloading ? (
                      <button
                        onClick={() => pauseDownload(item.id)}
                        className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>{t('pause') || 'Pause'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => resumeDownload(item.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{t('resume') || 'Resume'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => removeDownload(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                      title={t('delete') || 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conversion live banner if active */}
                {isConvertingThis && (
                  <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      {conversionStatus || 'Extracting audio and encoding MP3...'}
                    </span>
                    <span className="font-bold">{conversionProgress}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

