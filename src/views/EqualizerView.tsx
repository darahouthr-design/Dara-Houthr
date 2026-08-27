import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  EqualizerEngine,
  EQ_FREQUENCIES,
  EQ_BAND_LABELS,
  PRESETS,
  EqPreset
} from '../utils/audioEqualizer';
import {
  Sliders,
  Power,
  Volume2,
  Sparkles,
  RotateCcw,
  Play,
  Square,
  Music,
  Radio,
  Headphones,
  Zap,
  Mic,
  Disc,
  Layers,
  Activity,
  Waves
} from 'lucide-react';

export const EqualizerView: React.FC = () => {
  const { showToast, t, language, nowPlayingAudio } = useApp();
  const eq = EqualizerEngine.getInstance();

  const [settings, setSettings] = useState(eq.getSettings());
  const [isPlayingTest, setIsPlayingTest] = useState(eq.isPlayingTestTrack);
  const [selectedTestTrack, setSelectedTestTrack] = useState<
    'khmer_dance' | 'bass_edm' | 'pop_rock' | 'acoustic_guitar'
  >('khmer_dance');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync state from engine on mount
  useEffect(() => {
    eq.initContext();
    setSettings(eq.getSettings());
  }, []);

  // Real-time canvas spectrum visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = eq.analyserNode;
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 0; y < height; y += height / 4) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      if (analyser && (isPlayingTest || nowPlayingAudio || settings.enabled)) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Flat line when inactive
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 0;
        }
      }

      // Draw dynamic frequency response curve
      const barCount = 32;
      const barWidth = (width / barCount) - 3;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        const percent = value / 255;
        const barHeight = Math.max(4, percent * (height - 12));
        const x = i * (barWidth + 3) + 2;
        const y = height - barHeight;

        // Gradient for visual spectrum
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        if (settings.enabled) {
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(0.5, '#8b5cf6');
          gradient.addColorStop(1, '#ec4899');
        } else {
          gradient.addColorStop(0, '#64748b');
          gradient.addColorStop(1, '#94a3b8');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();

        // Top glow dot for active peaks
        if (value > 100 && settings.enabled) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y - 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlayingTest, nowPlayingAudio, settings.enabled]);

  // Handler: Toggle Equalizer On/Off
  const handleToggleEnabled = () => {
    const nextEnabled = !settings.enabled;
    const updated = { ...settings, enabled: nextEnabled };
    setSettings(updated);
    eq.saveSettings(updated);
    showToast(
      nextEnabled
        ? 'Equalizer processing activated (100%)'
        : 'Equalizer bypassed (flat output)',
      'info'
    );
  };

  // Handler: Apply Preset
  const handleSelectPreset = (preset: EqPreset) => {
    const updated = {
      ...settings,
      preset: preset.id,
      bands: [...preset.bands],
      bassBoost: preset.bassBoost ?? settings.bassBoost,
      virtualSurround: preset.virtualSurround ?? settings.virtualSurround,
      vocalClarity: preset.vocalClarity ?? settings.vocalClarity,
      preAmpGain: preset.preAmpGain ?? settings.preAmpGain,
      reverbPreset: preset.reverb ?? settings.reverbPreset
    };
    setSettings(updated);
    eq.saveSettings(updated);
    showToast(`Preset: ${language === 'km' ? preset.nameKm : preset.name}`, 'success');
  };

  // Handler: Adjust single band gain
  const handleBandChange = (index: number, val: number) => {
    const nextBands = [...settings.bands];
    nextBands[index] = val;
    const updated = { ...settings, bands: nextBands, preset: 'custom' };
    setSettings(updated);
    eq.saveSettings(updated);
  };

  // Handler: Adjust general DSP sliders
  const handleSettingChange = <K extends keyof typeof settings>(key: K, val: typeof settings[K]) => {
    const updated = { ...settings, [key]: val, preset: key === 'bands' ? 'custom' : settings.preset };
    setSettings(updated);
    eq.saveSettings(updated);
  };

  // Handler: Reset to Flat
  const handleReset = () => {
    const flatPreset = PRESETS.find(p => p.id === 'flat')!;
    handleSelectPreset(flatPreset);
    showToast(t('eqReset') || 'Equalizer reset to 0 dB', 'info');
  };

  // Handler: Test Sound
  const toggleTestSound = () => {
    if (isPlayingTest) {
      eq.stopTestSound();
      setIsPlayingTest(false);
    } else {
      eq.playTestSound(selectedTestTrack);
      setIsPlayingTest(true);
      showToast('Playing multi-frequency test loop...', 'info');
    }
  };

  const testTracks = [
    { id: 'khmer_dance', name: '🇰🇭 Khmer Melodic Beat', desc: 'Pentatonic melody & rhythm' },
    { id: 'bass_edm', name: '🔊 808 Sub-Bass EDM', desc: 'Heavy sub-bass & hi-hats' },
    { id: 'pop_rock', name: '🎸 Pop & Rock Drive', desc: 'Guitar drive & snare snap' },
    { id: 'acoustic_guitar', name: '🎹 Acoustic Warmth', desc: 'Chords & harmonic sparkle' }
  ];

  const getBandCategory = (freq: number) => {
    if (freq <= 64) return 'Sub-Bass';
    if (freq <= 250) return 'Bass';
    if (freq <= 1000) return 'Midrange';
    if (freq <= 4000) return 'Presence';
    return 'Treble';
  };

  return (
    <div id="equalizer-studio-container" className="space-y-6 pb-20 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Studio Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sliders className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {t('eqTitle') || 'Audio Equalizer Studio'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                100% Web Audio DSP
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              {t('eqSubtitle') ||
                '100% Real-Time 10-Band Web Audio Equalizer, 3D Spatial Sound & Bass DSP'}
            </p>
          </div>

          {/* Master Controls: Power Switch & Reset */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Reset all sliders to flat (0 dB)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('eqReset') || 'Flat (0 dB)'}</span>
            </button>

            <button
              onClick={handleToggleEnabled}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                settings.enabled
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Power className={`w-4 h-4 ${settings.enabled ? 'animate-pulse' : ''}`} />
              <span>{settings.enabled ? t('eqActive') || 'Active (ON)' : t('eqBypass') || 'Bypass (OFF)'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Spectrum Canvas Analyzer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              {t('eqRealtimeVisualizer') || 'Real-Time Audio Spectrum Visualizer'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {nowPlayingAudio ? 'Streaming Converted MP3' : isPlayingTest ? 'Synthesizing Test Audio' : 'Engine Ready'}
            </span>
          </div>

          <div className="w-full h-24 bg-slate-950/70 rounded-2xl border border-slate-800/80 p-2 overflow-hidden relative shadow-inner">
            <canvas
              ref={canvasRef}
              width={640}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Live Audio Test Suite (Immediate Audible Verification) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              {t('eqTestSound') || 'Interactive Sound Test Suite'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Test every frequency slider with real-time synthesized multi-layer acoustic tracks
            </p>
          </div>

          {/* Test Play / Stop Button */}
          <button
            onClick={toggleTestSound}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow transition active:scale-95 ${
              isPlayingTest
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-500/25'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
            }`}
          >
            {isPlayingTest ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>{t('eqStopTestSound') || 'Stop Sound Test'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{t('eqTestSound') || 'Play Live Test'}</span>
              </>
            )}
          </button>
        </div>

        {/* Track Selection Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {testTracks.map(track => {
            const isSelected = selectedTestTrack === track.id;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setSelectedTestTrack(track.id as any);
                  if (isPlayingTest) {
                    eq.playTestSound(track.id as any);
                  }
                }}
                className={`p-2.5 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/60 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <p className="text-xs font-bold truncate">{track.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">{track.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Presets Palette */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t('eqPresets') || 'Sound Presets'}
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {settings.preset === 'custom' ? 'Custom Tuning' : `Active: ${settings.preset.toUpperCase()}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => {
            const isActive = settings.preset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20 ring-2 ring-red-500/20'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                {language === 'km' ? preset.nameKm : preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 10-Band Precision Frequency Graphic Sliders */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              {t('eqBands') || '10-Band Graphic Frequency Sliders'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Adjust individual frequency bands from -15 dB to +15 dB with 100% precision
            </p>
          </div>
        </div>

        {/* Vertical Sliders Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-2 pt-2">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const gain = settings.bands[idx] ?? 0;
            const label = EQ_BAND_LABELS[idx];
            const category = getBandCategory(freq);

            return (
              <div
                key={freq}
                className="flex flex-col items-center p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 space-y-2.5 transition hover:border-indigo-400/50"
              >
                {/* dB Tag */}
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    gain > 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : gain < 0
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {gain > 0 ? `+${gain}` : gain} dB
                </span>

                {/* Vertical Range Slider Container */}
                <div className="relative h-44 flex items-center justify-center">
                  {/* Center zero line */}
                  <div className="absolute w-6 h-0.5 bg-slate-300 dark:bg-zinc-700 pointer-events-none" />

                  {/* Vertical HTML Input Range Slider */}
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    step={1}
                    value={gain}
                    disabled={!settings.enabled}
                    onChange={e => handleBandChange(idx, parseInt(e.target.value, 10))}
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl'
                    }}
                    className="w-5 h-40 appearance-none bg-slate-200 dark:bg-zinc-700 rounded-full cursor-pointer accent-red-600 disabled:opacity-40"
                  />
                </div>

                {/* Frequency Label */}
                <div className="text-center space-y-0.5">
                  <p className="text-xs font-black text-slate-800 dark:text-zinc-200">
                    {label}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">
                    {category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Enhancement & DSP Modulators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pre-Amp & Bass Booster */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            {t('eqPreAmp') || 'Pre-Amp Gain & Bass Booster'}
          </h3>

          {/* Pre-Amp Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300">
                Pre-Amp Master Gain
              </span>
              <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {settings.preAmpGain > 0 ? `+${settings.preAmpGain}` : settings.preAmpGain} dB
              </span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={settings.preAmpGain}
              disabled={!settings.enabled}
              onChange={e => handleSettingChange('preAmpGain', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-12 dB (Soft)</span>
              <span>0 dB</span>
              <span>+12 dB (Punch)</span>
            </div>
          </div>

          {/* Bass Booster DSP Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {t('eqBassBoost') || 'Sub-Bass Analog Booster'}
              </span>
              <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400">
                {settings.bassBoost}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.bassBoost}
              disabled={!settings.enabled}
              onChange={e => handleSettingChange('bassBoost', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Off (0%)</span>
              <span>Moderate (50%)</span>
              <span>Mega Sub (100%)</span>
            </div>
          </div>
        </div>

        {/* 3D Spatial Surround & Vocal Clarity */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-4 h-4 text-purple-500" />
            {t('eqSurround') || '3D Spatial Surround & Vocal DSP'}
          </h3>

          {/* 3D Spatial Surround Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-purple-500" />
                3D Spatial Immersion
              </span>
              <span className="font-mono text-xs font-extrabold text-purple-600 dark:text-purple-400">
                {settings.virtualSurround}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.virtualSurround}
              disabled={!settings.enabled}
              onChange={e => handleSettingChange('virtualSurround', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Stereo</span>
              <span>Wide Stage</span>
              <span>3D Theater</span>
            </div>
          </div>

          {/* Vocal Clarity Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-rose-500" />
                {t('eqVocalClarity') || 'Vocal Clarity & Speech Enhancement'}
              </span>
              <span className="font-mono text-xs font-extrabold text-rose-600 dark:text-rose-400">
                {settings.vocalClarity}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.vocalClarity}
              disabled={!settings.enabled}
              onChange={e => handleSettingChange('vocalClarity', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Natural (0%)</span>
              <span>Intelligible (50%)</span>
              <span>Ultra Crisp (100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acoustic Atmosphere (Reverb) & Karaoke Mode */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Disc className="w-4 h-4 text-cyan-500" />
          {t('eqReverb') || 'Acoustic Atmosphere (Reverb) & Karaoke Vocal Mode'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reverb Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Acoustic Environment / Reverb
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'Dry (None)' },
                { id: 'room', label: 'Living Room' },
                { id: 'studio', label: 'Recording Studio' },
                { id: 'concert', label: 'Concert Hall' },
                { id: 'arena', label: 'Open Arena' },
                { id: 'hall', label: 'Grand Cathedral' }
              ].map(rev => (
                <button
                  key={rev.id}
                  disabled={!settings.enabled}
                  onClick={() => handleSettingChange('reverbPreset', rev.id as any)}
                  className={`p-2 rounded-xl text-xs font-bold border transition ${
                    settings.reverbPreset === rev.id
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-800 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {rev.label}
                </button>
              ))}
            </div>
          </div>

          {/* Karaoke Mode Toggle */}
          <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-500" />
                  {t('eqKaraoke') || 'Karaoke Mode (Vocal Cut)'}
                </span>
                <input
                  type="checkbox"
                  checked={settings.karaokeMode}
                  disabled={!settings.enabled}
                  onChange={e => handleSettingChange('karaokeMode', e.target.checked)}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Attenuates lead vocals and center frequency harmonics to sing along with instrumental backing.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status: {settings.karaokeMode ? 'Karaoke Active' : 'Standard Full Vocal'}</span>
              <span>100% DSP Web Audio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
