import { EqualizerSettings } from '../types';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const EQ_BAND_LABELS = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export interface EqPreset {
  id: string;
  name: string;
  nameKm: string;
  bands: number[]; // 10 values in dB [-15 to +15]
  bassBoost?: number;
  virtualSurround?: number;
  vocalClarity?: number;
  preAmpGain?: number;
  reverb?: 'none' | 'room' | 'studio' | 'concert' | 'arena' | 'hall';
}

export const PRESETS: EqPreset[] = [
  {
    id: 'flat',
    name: 'Flat (Default)',
    nameKm: 'ធម្មតា (Default)',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bassBoost: 0,
    virtualSurround: 0,
    vocalClarity: 0,
    preAmpGain: 0,
    reverb: 'none'
  },
  {
    id: 'bass_boost',
    name: 'Bass Booster',
    nameKm: 'បាសបុកខ្លាំង (Bass Boost)',
    bands: [8, 9, 7, 4, 1, 0, 0, 0, 0, 0],
    bassBoost: 75,
    virtualSurround: 20,
    vocalClarity: 0,
    preAmpGain: 2,
    reverb: 'none'
  },
  {
    id: 'super_bass',
    name: 'Mega Sub-Bass',
    nameKm: 'បាសញ័ររញ្ជួយ (Mega Sub)',
    bands: [12, 11, 8, 4, 0, -1, 0, 0, 0, 0],
    bassBoost: 95,
    virtualSurround: 30,
    vocalClarity: 0,
    preAmpGain: 3,
    reverb: 'room'
  },
  {
    id: 'bass_reduce',
    name: 'Bass Reducer',
    nameKm: 'បន្ថយបាស (Bass Reducer)',
    bands: [-7, -8, -6, -4, 0, 0, 0, 0, 0, 0],
    bassBoost: 0,
    virtualSurround: 0,
    vocalClarity: 10,
    preAmpGain: 0,
    reverb: 'none'
  },
  {
    id: 'vocal',
    name: 'Vocal / Speech Clarity',
    nameKm: 'សម្លេងច្រៀងច្បាស់ (Vocal)',
    bands: [-3, -1, 0, 2, 5, 7, 6, 4, 2, 0],
    bassBoost: 10,
    virtualSurround: 15,
    vocalClarity: 80,
    preAmpGain: 1,
    reverb: 'studio'
  },
  {
    id: 'treble_boost',
    name: 'Treble & Clarity',
    nameKm: 'សម្លេងស្រួយថ្លា (Treble)',
    bands: [0, 0, 0, 0, 1, 3, 6, 8, 9, 10],
    bassBoost: 0,
    virtualSurround: 25,
    vocalClarity: 40,
    preAmpGain: 0,
    reverb: 'none'
  },
  {
    id: 'rock',
    name: 'Rock & Heavy',
    nameKm: 'តន្ត្រីរ៉ក់ (Rock)',
    bands: [6, 5, 4, 1, -1, 0, 3, 5, 6, 7],
    bassBoost: 50,
    virtualSurround: 35,
    vocalClarity: 30,
    preAmpGain: 2,
    reverb: 'concert'
  },
  {
    id: 'pop',
    name: 'Pop Music',
    nameKm: 'តន្ត្រីប៉ុប (Pop)',
    bands: [-1, 2, 4, 5, 3, 1, 2, 3, 4, 5],
    bassBoost: 40,
    virtualSurround: 30,
    vocalClarity: 50,
    preAmpGain: 1,
    reverb: 'room'
  },
  {
    id: 'electronic',
    name: 'Electronic / EDM',
    nameKm: 'អេឡិចត្រូនិក / EDM',
    bands: [7, 8, 5, 0, -2, 2, 5, 7, 8, 7],
    bassBoost: 80,
    virtualSurround: 50,
    vocalClarity: 20,
    preAmpGain: 3,
    reverb: 'arena'
  },
  {
    id: 'classical',
    name: 'Classical & Acoustic',
    nameKm: 'ភ្លេងបុរាណ/អេកូស្ទីក (Classical)',
    bands: [4, 3, 2, 2, -1, -1, 0, 2, 4, 5],
    bassBoost: 20,
    virtualSurround: 45,
    vocalClarity: 40,
    preAmpGain: 0,
    reverb: 'hall'
  },
  {
    id: 'jazz',
    name: 'Jazz & Blues',
    nameKm: 'ចង្វាក់ហ្សាស (Jazz)',
    bands: [3, 2, 1, 2, -1, -1, 0, 2, 4, 4],
    bassBoost: 30,
    virtualSurround: 30,
    vocalClarity: 35,
    preAmpGain: 1,
    reverb: 'studio'
  },
  {
    id: 'hiphop',
    name: 'Hip Hop & Urban',
    nameKm: 'ហ៊ីបហប (Hip Hop)',
    bands: [8, 7, 5, 1, -1, 0, 3, 4, 5, 6],
    bassBoost: 70,
    virtualSurround: 30,
    vocalClarity: 40,
    preAmpGain: 2,
    reverb: 'none'
  },
  {
    id: 'gaming_3d',
    name: '3D Spatial / Gaming',
    nameKm: 'សម្លេង 3D ជុំទិស (3D Gaming)',
    bands: [5, 4, 2, -1, 0, 3, 5, 6, 7, 8],
    bassBoost: 60,
    virtualSurround: 85,
    vocalClarity: 50,
    preAmpGain: 2,
    reverb: 'arena'
  },
  {
    id: 'karaoke',
    name: 'Karaoke / Vocal Cut',
    nameKm: 'ខារ៉ាអូខេ (Vocal Attenuate)',
    bands: [2, 1, -3, -8, -12, -10, -7, -2, 0, 1],
    bassBoost: 30,
    virtualSurround: 40,
    vocalClarity: 0,
    preAmpGain: 2,
    reverb: 'room'
  }
];

export const DEFAULT_EQ_SETTINGS: EqualizerSettings = {
  enabled: true,
  preset: 'flat',
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  preAmpGain: 0,
  bassBoost: 0,
  virtualSurround: 0,
  vocalClarity: 0,
  reverbPreset: 'none',
  karaokeMode: false,
  playbackSpeed: 1.0,
  pitchShift: 0
};

export class EqualizerEngine {
  private static instance: EqualizerEngine | null = null;

  public audioCtx: AudioContext | null = null;
  private preAmpNode: GainNode | null = null;
  private filterNodes: BiquadFilterNode[] = [];
  private bassBoostNode: BiquadFilterNode | null = null;
  private vocalClarityNode: BiquadFilterNode | null = null;
  private karaokeGainNode: GainNode | null = null;
  private delaySpatializer: DelayNode | null = null;
  private spatialGainNode: GainNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private dryGainNode: GainNode | null = null;
  private wetGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private masterGainNode: GainNode | null = null;
  public analyserNode: AnalyserNode | null = null;

  private connectedElements: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode> = new WeakMap();
  private settings: EqualizerSettings = { ...DEFAULT_EQ_SETTINGS };
  private isInitialized = false;

  // Test synthesizer state
  private testOscillators: { stop: () => void }[] = [];
  public isPlayingTestTrack = false;
  public currentTestTrackId: string | null = null;

  private constructor() {
    this.loadPersistedSettings();
  }

  public static getInstance(): EqualizerEngine {
    if (!EqualizerEngine.instance) {
      EqualizerEngine.instance = new EqualizerEngine();
    }
    return EqualizerEngine.instance;
  }

  private loadPersistedSettings() {
    try {
      const saved = localStorage.getItem('videohub_equalizer_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...DEFAULT_EQ_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load persisted EQ settings:', e);
    }
  }

  public saveSettings(newSettings: Partial<EqualizerSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('videohub_equalizer_v2', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save EQ settings:', e);
    }
    this.applySettingsToNodes();
  }

  public getSettings(): EqualizerSettings {
    return { ...this.settings };
  }

  public initContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.isInitialized) {
      this.setupNodeGraph();
      this.isInitialized = true;
    }

    return this.audioCtx;
  }

  private setupNodeGraph() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    // 1. PreAmp Gain
    this.preAmpNode = ctx.createGain();

    // 2. 10 Frequency Band Biquad Filters
    this.filterNodes = EQ_FREQUENCIES.map((freq, idx) => {
      const filter = ctx.createBiquadFilter();
      filter.frequency.value = freq;

      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.414; // Standard 1-octave Q
      }
      filter.gain.value = this.settings.bands[idx] || 0;
      return filter;
    });

    // 3. Bass Boost low-shelf filter at 80Hz
    this.bassBoostNode = ctx.createBiquadFilter();
    this.bassBoostNode.type = 'lowshelf';
    this.bassBoostNode.frequency.value = 80;
    this.bassBoostNode.gain.value = 0;

    // 4. Vocal Clarity peaking filter at 3000Hz
    this.vocalClarityNode = ctx.createBiquadFilter();
    this.vocalClarityNode.type = 'peaking';
    this.vocalClarityNode.frequency.value = 3000;
    this.vocalClarityNode.Q.value = 1.6;
    this.vocalClarityNode.gain.value = 0;

    // 5. 3D Spatializer Haas Delay & Panner
    this.delaySpatializer = ctx.createDelay();
    this.delaySpatializer.delayTime.value = 0.015; // 15ms Haas effect
    this.spatialGainNode = ctx.createGain();
    this.spatialGainNode.gain.value = 0;

    // 6. Convolver Reverb
    this.convolverNode = ctx.createConvolver();
    this.generateImpulseResponse(this.settings.reverbPreset);
    this.dryGainNode = ctx.createGain();
    this.wetGainNode = ctx.createGain();
    this.dryGainNode.gain.value = 1.0;
    this.wetGainNode.gain.value = 0.0;

    // 7. Karaoke Attenuator
    this.karaokeGainNode = ctx.createGain();
    this.karaokeGainNode.gain.value = 1.0;

    // 8. Dynamics Compressor (prevents loud spikes/clipping)
    this.compressorNode = ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -3.0;
    this.compressorNode.knee.value = 6.0;
    this.compressorNode.ratio.value = 4.0;
    this.compressorNode.attack.value = 0.005;
    this.compressorNode.release.value = 0.1;

    // 9. Master Gain
    this.masterGainNode = ctx.createGain();
    this.masterGainNode.gain.value = 1.0;

    // 10. Spectrum Analyser
    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.85;

    // Connect Filter Chain: PreAmp -> Filters 0..9 -> BassBoost -> VocalClarity -> Reverb Split -> Master -> Compressor -> Analyser -> Destination
    let lastNode: AudioNode = this.preAmpNode;

    for (const filter of this.filterNodes) {
      lastNode.connect(filter);
      lastNode = filter;
    }

    lastNode.connect(this.bassBoostNode);
    this.bassBoostNode.connect(this.vocalClarityNode);

    // Split for Reverb & 3D Spatializer
    const postEqNode = this.vocalClarityNode;

    // Dry path
    postEqNode.connect(this.dryGainNode);
    this.dryGainNode.connect(this.masterGainNode);

    // Wet reverb path
    postEqNode.connect(this.convolverNode);
    this.convolverNode.connect(this.wetGainNode);
    this.wetGainNode.connect(this.masterGainNode);

    // 3D Spatial delay path
    postEqNode.connect(this.delaySpatializer);
    this.delaySpatializer.connect(this.spatialGainNode);
    this.spatialGainNode.connect(this.masterGainNode);

    // Master -> Compressor -> Analyser -> Speaker Destination
    this.masterGainNode.connect(this.compressorNode);
    this.compressorNode.connect(this.analyserNode);
    this.analyserNode.connect(ctx.destination);

    this.applySettingsToNodes();
  }

  public connectMediaElement(element: HTMLMediaElement) {
    try {
      this.initContext();
      if (!this.audioCtx || !this.preAmpNode) return;

      // Check if already created
      let sourceNode = this.connectedElements.get(element);
      if (!sourceNode) {
        sourceNode = this.audioCtx.createMediaElementSource(element);
        this.connectedElements.set(element, sourceNode);
        sourceNode.connect(this.preAmpNode);
      }
    } catch (e) {
      console.warn('Media element already attached or could not connect to WebAudio:', e);
    }
  }

  public applySettingsToNodes() {
    if (!this.audioCtx || !this.isInitialized) return;

    const {
      enabled,
      bands,
      preAmpGain,
      bassBoost,
      virtualSurround,
      vocalClarity,
      reverbPreset,
      karaokeMode
    } = this.settings;

    const now = this.audioCtx.currentTime;

    // 1. PreAmp Gain
    if (this.preAmpNode) {
      const targetGain = enabled ? Math.pow(10, preAmpGain / 20) : 1.0;
      this.preAmpNode.gain.setTargetAtTime(targetGain, now, 0.05);
    }

    // 2. Bands
    this.filterNodes.forEach((node, idx) => {
      const targetGain = enabled ? (bands[idx] !== undefined ? bands[idx] : 0) : 0;
      node.gain.setTargetAtTime(targetGain, now, 0.05);
    });

    // 3. Bass Boost
    if (this.bassBoostNode) {
      const boostDb = enabled ? (bassBoost / 100) * 12 : 0; // Up to +12dB boost
      this.bassBoostNode.gain.setTargetAtTime(boostDb, now, 0.05);
    }

    // 4. Vocal Clarity
    if (this.vocalClarityNode) {
      const vocalDb = enabled ? (vocalClarity / 100) * 8 : 0; // Up to +8dB boost
      this.vocalClarityNode.gain.setTargetAtTime(vocalDb, now, 0.05);
    }

    // 5. 3D Spatializer
    if (this.spatialGainNode) {
      const spatialVal = enabled ? (virtualSurround / 100) * 0.45 : 0;
      this.spatialGainNode.gain.setTargetAtTime(spatialVal, now, 0.05);
    }

    // 6. Reverb
    this.updateReverb(enabled ? reverbPreset : 'none');

    // 7. Karaoke mode
    if (this.vocalClarityNode && karaokeMode && enabled) {
      this.vocalClarityNode.gain.setTargetAtTime(-12, now, 0.05);
    }
  }

  private generateImpulseResponse(preset: string) {
    if (!this.audioCtx || !this.convolverNode) return;
    if (preset === 'none') {
      this.convolverNode.buffer = null;
      return;
    }

    const rate = this.audioCtx.sampleRate;
    const duration = preset === 'room' ? 0.8 : preset === 'studio' ? 1.2 : preset === 'concert' ? 2.5 : preset === 'arena' ? 3.5 : 4.5;
    const decay = preset === 'room' ? 2.5 : preset === 'studio' ? 2.0 : preset === 'concert' ? 1.5 : preset === 'arena' ? 1.2 : 0.8;

    const length = rate * duration;
    const impulse = this.audioCtx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const env = Math.exp(-t * decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }

    this.convolverNode.buffer = impulse;
  }

  private updateReverb(preset: string) {
    if (!this.audioCtx || !this.dryGainNode || !this.wetGainNode) return;
    const now = this.audioCtx.currentTime;

    if (preset === 'none' || !this.settings.enabled) {
      this.dryGainNode.gain.setTargetAtTime(1.0, now, 0.05);
      this.wetGainNode.gain.setTargetAtTime(0.0, now, 0.05);
    } else {
      this.generateImpulseResponse(preset);
      const wetLevel = preset === 'room' ? 0.25 : preset === 'studio' ? 0.35 : preset === 'concert' ? 0.5 : preset === 'arena' ? 0.65 : 0.75;
      this.dryGainNode.gain.setTargetAtTime(1.0 - wetLevel * 0.3, now, 0.05);
      this.wetGainNode.gain.setTargetAtTime(wetLevel, now, 0.05);
    }
  }

  /**
   * Interactive Live Audio Test Synthesizer
   * Plays polyphonic multi-instrument loops so the user can test the equalizer in real time
   */
  public playTestSound(trackType: 'khmer_dance' | 'bass_edm' | 'acoustic_guitar' | 'pop_rock' | 'vocal_rhythm' = 'khmer_dance') {
    this.stopTestSound();
    this.initContext();
    if (!this.audioCtx || !this.preAmpNode) return;

    const ctx = this.audioCtx;
    this.isPlayingTestTrack = true;
    this.currentTestTrackId = trackType;

    const now = ctx.currentTime;
    const tempo = trackType === 'bass_edm' ? 128 : trackType === 'khmer_dance' ? 132 : trackType === 'pop_rock' ? 120 : 95;
    const beatSec = 60 / tempo;
    const totalBars = 8;
    const totalDuration = totalBars * 4 * beatSec;

    const masterTestGain = ctx.createGain();
    masterTestGain.gain.setValueAtTime(0.4, now);
    masterTestGain.connect(this.preAmpNode);

    // Track instruments setup
    const isKhmer = trackType === 'khmer_dance';
    const isEdm = trackType === 'bass_edm';
    const isRock = trackType === 'pop_rock';

    // 1. Bassline Oscillators (Sub 40Hz - 160Hz)
    const bassNotes = isKhmer ? [55, 65.41, 73.42, 82.41] : isEdm ? [41.2, 43.65, 49.0, 55.0] : [65.41, 77.78, 87.31, 98.0];
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = isEdm ? 'sawtooth' : 'triangle';

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.value = isEdm ? 240 : 320;

    bassOsc.connect(subFilter);
    subFilter.connect(bassGain);
    bassGain.connect(masterTestGain);

    // Schedule 16 beats of bass
    for (let bar = 0; bar < totalBars; bar++) {
      const root = bassNotes[bar % bassNotes.length];
      for (let beat = 0; beat < 4; beat++) {
        const t = now + (bar * 4 + beat) * beatSec;
        bassOsc.frequency.setValueAtTime(root, t);
        bassGain.gain.setValueAtTime(0.5, t);
        bassGain.gain.exponentialRampToValueAtTime(0.01, t + beatSec * 0.85);
      }
    }
    bassOsc.start(now);
    bassOsc.stop(now + totalDuration);

    // 2. Chords & Lead Melodic Arpeggio
    const leadOsc = ctx.createOscillator();
    const leadGain = ctx.createGain();
    leadOsc.type = isRock ? 'sawtooth' : 'sine';
    leadOsc.connect(leadGain);
    leadGain.connect(masterTestGain);

    const scale = isKhmer
      ? [220, 247.5, 277.2, 330, 370, 440, 495, 554.4, 660]
      : [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

    for (let step = 0; step < totalBars * 16; step++) {
      const t = now + step * (beatSec / 4);
      const note = scale[step % scale.length];
      leadOsc.frequency.setValueAtTime(note, t);
      leadGain.gain.setValueAtTime(0.25, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + (beatSec / 4) * 0.9);
    }
    leadOsc.start(now);
    leadOsc.stop(now + totalDuration);

    // 3. Rhythm Drum Clicks (Hi-Hats & Snares for Treble)
    for (let step = 0; step < totalBars * 8; step++) {
      const t = now + step * (beatSec / 2);
      const noise = ctx.createBufferSource();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = step % 2 === 1 ? 2500 : 7000;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(step % 2 === 1 ? 0.35 : 0.15, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterTestGain);

      noise.start(t);
    }

    this.testOscillators.push({
      stop: () => {
        try {
          bassOsc.stop();
          leadOsc.stop();
          masterTestGain.disconnect();
        } catch (_) {}
      }
    });

    setTimeout(() => {
      if (this.currentTestTrackId === trackType) {
        this.isPlayingTestTrack = false;
        this.currentTestTrackId = null;
      }
    }, totalDuration * 1000);
  }

  public stopTestSound() {
    this.testOscillators.forEach(osc => osc.stop());
    this.testOscillators = [];
    this.isPlayingTestTrack = false;
    this.currentTestTrackId = null;
  }
}
