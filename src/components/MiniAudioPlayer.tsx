import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, X, Music, Sliders } from 'lucide-react';
import { formatTime } from '../utils/audioConverter';
import { EqualizerEngine } from '../utils/audioEqualizer';

export const MiniAudioPlayer: React.FC = () => {
  const {
    nowPlayingAudio,
    stopAudio,
    isPlayingAudio,
    setIsPlayingAudio,
    convertedAudioList,
    playAudio,
    setCurrentTab,
    t
  } = useApp();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  useEffect(() => {
    if (!nowPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = nowPlayingAudio.blobUrl;
      audioRef.current.volume = volume;

      // Connect to Web Audio Equalizer DSP graph
      try {
        EqualizerEngine.getInstance().connectMediaElement(audioRef.current);
      } catch (e) {
        console.warn('Could not attach EQ to mini audio element:', e);
      }

      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(err => {
        console.warn('Autoplay audio blocked or error:', err);
      });
    }
  }, [nowPlayingAudio]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || nowPlayingAudio?.durationSeconds || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleNextTrack = () => {
    if (convertedAudioList.length <= 1 || !nowPlayingAudio) return;
    const currentIndex = convertedAudioList.findIndex(a => a.id === nowPlayingAudio.id);
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * convertedAudioList.length);
    } else {
      nextIndex = (currentIndex + 1) % convertedAudioList.length;
    }
    playAudio(convertedAudioList[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (convertedAudioList.length <= 1 || !nowPlayingAudio) return;
    const currentIndex = convertedAudioList.findIndex(a => a.id === nowPlayingAudio.id);
    const prevIndex = (currentIndex - 1 + convertedAudioList.length) % convertedAudioList.length;
    playAudio(convertedAudioList[prevIndex]);
  };

  if (!nowPlayingAudio) return null;

  return (
    <div
      id="mini-audio-player"
      className="fixed bottom-16 md:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 p-3.5 rounded-2xl bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (isLoop) {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
          } else {
            handleNextTrack();
          }
        }}
      />

      {/* Top track info & close */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
            <Music className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-zinc-100">
              {nowPlayingAudio.title}
            </p>
            <p className="text-[10px] text-zinc-400 font-mono truncate">
              {nowPlayingAudio.bitrate} kbps • MP3 Audio
            </p>
          </div>
        </div>

        <button
          onClick={stopAudio}
          className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close audio player"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="space-y-1 mb-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || nowPlayingAudio.durationSeconds)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-1.5 rounded-lg transition ${
              isShuffle ? 'text-indigo-400 bg-slate-800' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={t('shuffleQueue')}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsLoop(!isLoop)}
            className={`p-1.5 rounded-lg transition ${
              isLoop ? 'text-indigo-400 bg-slate-800' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={t('repeatTrack')}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevTrack}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleNextTrack}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Equalizer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentTab('equalizer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
            title="Open Equalizer Studio"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
