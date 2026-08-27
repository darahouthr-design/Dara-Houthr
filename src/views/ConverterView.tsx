import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { convertVideoToMp3, formatTime, generateSampleVideoBlob } from '../utils/audioConverter';
import { ConvertedAudioItem } from '../types';
import {
  FileAudio,
  UploadCloud,
  Play,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Music,
  Sliders,
  ShieldCheck,
  Disc,
  Clock,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ConverterView: React.FC = () => {
  const {
    convertedAudioList,
    addConvertedAudio,
    removeConvertedAudio,
    playAudio,
    nowPlayingAudio,
    isPlayingAudio,
    converterPreload,
    setConverterPreload,
    showToast,
    t
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('VideoHub Collection');
  const [bitrate, setBitrate] = useState<128 | 192 | 256 | 320>(192);

  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (converterPreload) {
      if (converterPreload.file) {
        handleFileSelect(converterPreload.file);
      } else {
        generateSampleVideoBlob('khmer_beat').then(blob => {
          const name = (converterPreload.title || 'audio_track').replace(/[^\w\s\u1780-\u17FF-]/g, '').trim() + '.mp4';
          const file = new File([blob], name, { type: 'video/mp4' });
          setSelectedFile(file);
          setTitle(converterPreload.title || name);
          setArtist(converterPreload.artist || 'Artist');
          setAlbum(converterPreload.album || 'VideoHub Collection');
        });
      }
      if (converterPreload.title) setTitle(converterPreload.title);
      if (converterPreload.artist) setArtist(converterPreload.artist);
      if (converterPreload.album) setAlbum(converterPreload.album);
      setConverterPreload(null);
    }
  }, [converterPreload]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    setTitle(cleanName);
    setArtist('Unknown Artist');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = async (sampleType: 'khmer_beat' | 'acoustic' | 'lofi') => {
    setStatusMessage('Generating sample audio stream...');
    try {
      const sampleBlob = await generateSampleVideoBlob(sampleType);
      const sampleName =
        sampleType === 'khmer_beat'
          ? 'Khmer_Traditional_Folk_Beat.mp4'
          : sampleType === 'acoustic'
          ? 'Acoustic_Guitar_Harmony.mp4'
          : 'Lofi_Chill_Melody.mp4';

      const file = new File([sampleBlob], sampleName, { type: 'video/mp4' });
      handleFileSelect(file);
      showToast(`Sample file "${sampleName}" loaded!`, 'info');
      setStatusMessage('');
    } catch (err) {
      showToast('Could not load sample file', 'error');
    }
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setProgress(0);
    setStatusMessage('Reading and decoding audio stream with Web Audio API...');

    try {
      const result = await convertVideoToMp3(selectedFile, {
        bitrate,
        title: title.trim() || selectedFile.name,
        artist: artist.trim() || 'Artist',
        album: album.trim() || 'VideoHub',
        onProgress: (p, status) => {
          setProgress(p);
          setStatusMessage(status);
        }
      });

      const audioItem: ConvertedAudioItem = {
        id: 'mp3_' + Date.now(),
        title: title.trim() || selectedFile.name,
        artist: artist.trim() || 'Artist',
        album: album.trim() || 'VideoHub',
        durationSeconds: result.duration,
        fileSize: result.blob.size,
        blobUrl: result.blobUrl,
        bitrate,
        createdAt: new Date().toISOString(),
        originalFileName: selectedFile.name
      };

      addConvertedAudio(audioItem);
      setIsConverting(false);
      setProgress(100);
      setStatusMessage('Conversion complete!');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      showToast(`Converted "${audioItem.title}" to MP3 successfully!`, 'success');
      playAudio(audioItem);
    } catch (error: any) {
      setIsConverting(false);
      setStatusMessage('');
      showToast(`Conversion failed: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div id="converter-view-container" className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileAudio className="w-6 h-6 text-amber-500" />
            {t('navConverter')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Client-side MP3 encoder using Web Audio Context & Lamejs. Fast, secure, and private.
          </p>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
          <Sparkles className="w-3.5 h-3.5" /> High Fidelity 320kbps
        </div>
      </div>

      {/* Compliance / Disclaimer Banner */}
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
          <p className="font-bold text-slate-800 dark:text-zinc-200">
            Authorized & User-Owned Content Only:
          </p>
          <p>
            {t('converterComplianceNotice')} VideoHub uses browser-local processing so your files never leave your device.
          </p>
        </div>
      </div>

      {/* Conversion Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Drag & Drop Zone + Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-3xl border-2 border-dashed transition cursor-pointer flex flex-col items-center justify-center text-center ${
              isDragOver
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 hover:border-amber-500/80 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            {selectedFile ? (
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for MP3 conversion ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Click to choose a different video</p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {t('converterDragDrop')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('converterSupportedFormats')}
                </p>
                <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {t('converterBrowseFiles')}
                </span>
              </div>
            )}
          </div>

          {/* Quick Demo Sample Files */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Or try with instant sample tracks:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('khmer_beat')}
                className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-zinc-300 hover:border-amber-500 transition text-center"
              >
                🇰🇭 Khmer Folk Beat
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('acoustic')}
                className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-zinc-300 hover:border-amber-500 transition text-center"
              >
                🎸 Acoustic Harmony
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('lofi')}
                className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-zinc-300 hover:border-amber-500 transition text-center"
              >
                ☕ Lofi Chill
              </button>
            </div>
          </div>

          {/* Metadata & Bitrate Configuration */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" /> MP3 Audio Settings & ID3 Tags
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Track Title
                </label>
                <input
                  type="text"
                  placeholder="Song Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Artist / Creator
                </label>
                <input
                  type="text"
                  placeholder="Artist Name"
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Bitrate Pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                {t('converterBitrate')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([128, 192, 256, 320] as const).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBitrate(b)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      bitrate === b
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                    }`}
                  >
                    {b} kbps
                  </button>
                ))}
              </div>
            </div>

            {/* Progress & Start Button */}
            {isConverting ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <span>{statusMessage}</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartConversion}
                disabled={!selectedFile}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 mt-2"
              >
                <FileAudio className="w-4 h-4" />
                {t('converterConvertBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Right: Converted Audio Library */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Disc className="w-4 h-4 text-amber-500" />
              {t('convertedAudioHistory')} ({convertedAudioList.length})
            </h3>
          </div>

          {convertedAudioList.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
              <Music className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                No converted MP3 files yet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Uploaded video audio extracts will appear here for instant streaming and MP3 download.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {convertedAudioList.map(audio => {
                const isThisPlaying = nowPlayingAudio?.id === audio.id && isPlayingAudio;

                return (
                  <div
                    key={audio.id}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-500/50 transition shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => playAudio(audio)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition ${
                            isThisPlaying
                              ? 'bg-amber-500 text-white ring-2 ring-amber-400 animate-pulse'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-amber-500 hover:text-white'
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {audio.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {audio.artist} • {formatTime(audio.durationSeconds)} • {audio.bitrate} kbps
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={audio.blobUrl}
                          download={`${audio.title}.mp3`}
                          className="p-2 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                          title="Download MP3 file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => removeConvertedAudio(audio.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
