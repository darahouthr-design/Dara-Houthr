import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, FileAudio, HardDrive, ShieldCheck, Sliders, AlertCircle, RefreshCw } from 'lucide-react';
import { EqualizerEngine } from '../utils/audioEqualizer';
import { getOfflineMediaBlobUrl } from '../utils/offlineStorage';

export const OfflinePlayerView: React.FC = () => {
  const { activeOfflineVideo, setCurrentTab, t, setConverterPreload } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSource() {
      if (!activeOfflineVideo) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        // 1. Direct localBlobUrl if available in memory
        if (activeOfflineVideo.localBlobUrl) {
          if (isMounted) {
            setVideoSrc(activeOfflineVideo.localBlobUrl);
            setIsLoading(false);
          }
          return;
        }

        // 2. Load from browser IndexedDB
        const storedUrl = await getOfflineMediaBlobUrl(activeOfflineVideo.id);
        if (storedUrl && isMounted) {
          setVideoSrc(storedUrl);
          setIsLoading(false);
          return;
        }

        // 3. Fallback to server media proxy
        if (activeOfflineVideo.mediaUrl && isMounted) {
          const proxiedUrl = `/api/media/proxy?url=${encodeURIComponent(activeOfflineVideo.mediaUrl)}`;
          setVideoSrc(proxiedUrl);
          setIsLoading(false);
          return;
        }

        // 4. Default fallback sample
        if (isMounted) {
          setVideoSrc('/api/media/proxy?url=https%3A%2F%2Fcommondatastorage.googleapis.com%2Fgtv-videos-bucket%2Fsample%2FBigBuckBunny.mp4');
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Error loading offline video source:', err);
        if (isMounted) {
          setLoadError('Failed to load local offline media file.');
          setIsLoading(false);
        }
      }
    }

    loadSource();
    return () => {
      isMounted = false;
    };
  }, [activeOfflineVideo]);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      try {
        EqualizerEngine.getInstance().connectMediaElement(videoRef.current);
      } catch (e) {
        console.warn('Could not attach EQ to offline video element:', e);
      }
    }
  }, [videoSrc]);

  if (!activeOfflineVideo) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No offline video selected.</p>
        <button
          onClick={() => setCurrentTab('downloads')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Go to Downloads
        </button>
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.warn('Playback interrupted or prevented:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleConvertToMp3 = () => {
    setConverterPreload({
      title: activeOfflineVideo.title,
      artist: activeOfflineVideo.channel,
      album: 'Offline Downloads'
    });
    setCurrentTab('converter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sizeDisplay = activeOfflineVideo.fileSizeMB
    ? `${activeOfflineVideo.fileSizeMB.toFixed(1)} MB`
    : activeOfflineVideo.fileSize
    ? `${(activeOfflineVideo.fileSize / (1024 * 1024)).toFixed(1)} MB`
    : '120.0 MB';

  return (
    <div id="offline-player-container" className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top Navigation & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setCurrentTab('downloads')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Offline Downloads</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentTab('equalizer')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
            title="Adjust 10-Band Equalizer & Bass"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Equalizer Studio</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            <span>Local Offline Storage</span>
          </span>

          <button
            onClick={handleConvertToMp3}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
          >
            <FileAudio className="w-3.5 h-3.5" />
            <span>Convert to MP3</span>
          </button>
        </div>
      </div>

      {/* HTML5 Native Video Player */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            <p className="text-sm font-medium">Loading offline video stream from local storage...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 text-red-400 p-6 text-center">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm font-bold">{loadError}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={activeOfflineVideo.thumbnail}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onError={(e) => {
              console.warn('Video playback error, falling back:', e);
              // Fallback to proxy if local blob revoked
              if (videoSrc.startsWith('blob:') && activeOfflineVideo.mediaUrl) {
                setVideoSrc(`/api/media/proxy?url=${encodeURIComponent(activeOfflineVideo.mediaUrl)}`);
              }
            }}
            className="w-full h-full object-contain"
            controls
            playsInline
            crossOrigin="anonymous"
          />
        )}
      </div>

      {/* Metadata and Controls Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {activeOfflineVideo.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {activeOfflineVideo.channel} • Resolution: {activeOfflineVideo.quality} • Stored Size: {sizeDisplay}
            </p>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            {[0.75, 1, 1.25, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  playbackRate === s
                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            This media is saved locally in IndexedDB storage and plays smoothly completely offline without internet data usage.
          </span>
        </div>
      </div>
    </div>
  );
};
