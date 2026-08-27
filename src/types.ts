export interface VideoItem {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  channelAvatar?: string;
  publishedAt: string;
  duration: string;
  durationSeconds?: number;
  viewCount: number;
  likeCount: number;
  categoryId: string;
  categoryName?: string;
  tags: string[];
  liveBroadcastContent?: string;
  isDownloadableAuthorized?: boolean;
  authorizedMediaUrl?: string;
}

export interface ChannelItem {
  channelId: string;
  title: string;
  handle: string;
  description: string;
  avatar: string;
  banner: string;
  subscriberCount: string;
  videoCount: number;
  joinedDate: string;
  videos: VideoItem[];
}

export interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  coverGradient?: string;
  customCoverUrl?: string;
  videoCount: number;
  videos: VideoItem[];
}

export type Playlist = PlaylistItem;

export interface WatchHistoryItem {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  channelAvatar?: string;
  position: number; // in seconds
  duration: number; // in seconds
  progress: number; // percentage 0-100
  lastWatchedAt: string;
}

export interface FavoriteItem {
  videoId: string;
  video: VideoItem;
  category: string;
  addedAt: string;
}

export type DownloadQuality = '360p' | '480p' | '720p' | '1080p' | 'Audio';
export type DownloadStatus = 'downloading' | 'paused' | 'completed' | 'canceled' | 'error';

export interface DownloadItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  quality: DownloadQuality;
  fileSizeMB?: number;
  fileSize?: number;
  downloadedMB?: number;
  progress: number; // 0-100
  status: DownloadStatus;
  startedAt: string;
  completedAt?: string;
  mediaUrl?: string;
  localBlobUrl?: string;
  isAudioOnly?: boolean;
}

export interface ConvertedAudioItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  originalFilename?: string;
  originalFileName?: string;
  duration?: string;
  durationSeconds: number;
  bitrate: number; // kbps
  fileSizeBytes?: number;
  fileSize?: number;
  convertedAt?: string;
  createdAt?: string;
  blobUrl: string;
  waveformSample?: number[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  language: 'km' | 'en';
  theme: 'dark' | 'light' | 'system';
  isLoggedIn: boolean;
  googleLinked: boolean;
}

export interface EqualizerBand {
  frequency: number; // Hz: 32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000
  label: string; // e.g. '32Hz', '1kHz', '16kHz'
  gain: number; // -15 to +15 dB
  type?: BiquadFilterType;
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: string; // 'flat' | 'bass_boost' | 'vocal' | 'rock' | 'pop' | 'electronic' | 'classical' | 'jazz' | 'hiphop' | 'custom'
  bands: number[]; // 10 gain values in dB [-15 to +15]
  preAmpGain: number; // -12 to +12 dB
  bassBoost: number; // 0 to 100%
  virtualSurround: number; // 0 to 100% (3D Spatializer)
  vocalClarity: number; // 0 to 100%
  reverbPreset: 'none' | 'room' | 'studio' | 'concert' | 'arena' | 'hall';
  karaokeMode: boolean; // Vocal cancellation
  playbackSpeed: number; // 0.5x to 2.0x
  pitchShift: number; // -6 to +6 semitones
}

export interface PlaybackSettings {
  autoPlayNext: boolean;
  preferredQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  volume?: number;
  playbackSpeed?: number;
  autoPlay?: boolean;
}

export interface AppSettings {
  language: 'km' | 'en';
  theme: 'dark' | 'light' | 'system';
  autoplay: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  defaultVolume: number;
  captionsEnabled: boolean;
  downloadLocation: string;
  wifiOnlyDownloads: boolean;
  maxConcurrentDownloads: number;
  autoDeleteDownloads: boolean;
  pauseHistory: boolean;
  pauseSearchHistory: boolean;
}

export interface AdminStats {
  totalRequests: number;
  apiRequests: number;
  cachedHits: number;
  videosViewed: number;
  searchRequests: number;
  downloadsCount: number;
  conversionsCount: number;
  storageUsedMB: number;
  cacheEntries: number;
  uptimeSeconds: number;
  systemLogs: { id: string; timestamp: string; level: string; message: string }[];
}

export type NavigationTab =
  | 'home'
  | 'explore'
  | 'search'
  | 'subscriptions'
  | 'library'
  | 'downloads'
  | 'favorites'
  | 'history'
  | 'playlists'
  | 'converter'
  | 'settings'
  | 'equalizer'
  | 'about'
  | 'player'
  | 'channel'
  | 'offline-player'
  | 'admin';
