import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  VideoItem,
  PlaylistItem,
  WatchHistoryItem,
  DownloadItem,
  ConvertedAudioItem,
  UserProfile,
  AppSettings,
  PlaybackSettings,
  NavigationTab,
  DownloadQuality
} from '../types';
import { INITIAL_VIDEOS, INITIAL_PLAYLISTS } from '../data/mockData';
import { translations } from '../i18n/translations';
import { convertVideoToMp3, generateSampleVideoBlob, formatTime } from '../utils/audioConverter';
import {
  saveOfflineMediaBlob,
  getOfflineMediaBlob,
  getOfflineMediaBlobUrl,
  deleteOfflineMediaBlob,
  saveConvertedAudioBlob,
  getConvertedAudioBlob,
  deleteConvertedAudioBlob
} from '../utils/offlineStorage';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation & Routing
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  activeVideoId: string | null;
  activeVideo: VideoItem | null;
  playVideo: (video: VideoItem | string) => void;
  activeChannelId: string | null;
  openChannel: (channelId: string) => void;
  activeOfflineMedia: DownloadItem | null;
  activeOfflineVideo: DownloadItem | null;
  playOfflineMedia: (download: DownloadItem) => void;
  playOfflineVideo: (download: DownloadItem) => void;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchHistory: string[];
  addSearchHistory: (q: string) => void;
  clearSearchHistory: () => void;

  // Language & Theming
  language: 'km' | 'en';
  setLanguage: (lang: 'km' | 'en') => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  t: (key: keyof typeof translations['en']) => string;

  // User Profile & Auth
  user: UserProfile;
  loginUser: (email: string, name: string, isGoogle?: boolean) => void;
  logoutUser: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Favorites
  favorites: VideoItem[];
  isFavorite: (videoId: string) => boolean;
  toggleFavorite: (video: VideoItem) => void;
  clearFavorites: () => void;

  // Playlists
  playlists: PlaylistItem[];
  createPlaylist: (title: string, description?: string, isPublic?: boolean) => void;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newTitle: string, newDesc?: string) => void;
  addVideoToPlaylist: (playlistId: string, video: VideoItem) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  selectedVideoForPlaylist: VideoItem | null;
  setSelectedVideoForPlaylist: (video: VideoItem | null) => void;

  // Watch History
  watchHistory: WatchHistoryItem[];
  addToHistory: (video: VideoItem, position?: number, duration?: number) => void;
  removeFromHistory: (videoId: string) => void;
  removeFromWatchHistory: (videoId: string) => void;
  clearWatchHistory: () => void;
  pauseHistory: boolean;
  setPauseHistory: (paused: boolean) => void;

  // Offline Downloads (Authorized Media)
  downloads: DownloadItem[];
  startDownload: (video: VideoItem, quality?: DownloadQuality) => void;
  pauseDownload: (id: string) => void;
  resumeDownload: (id: string) => void;
  cancelDownload: (id: string) => void;
  deleteDownload: (id: string) => void;
  removeDownload: (id: string) => void;

  // Converted Audio
  convertedAudioList: ConvertedAudioItem[];
  addConvertedAudio: (audio: ConvertedAudioItem) => void;
  deleteConvertedAudio: (id: string) => void;
  removeConvertedAudio: (id: string) => void;
  converterPreload: { file?: File; title?: string; artist?: string; album?: string } | null;
  setConverterPreload: (item: { file?: File; title?: string; artist?: string; album?: string } | null) => void;
  convertDownloadToMp3: (item: DownloadItem, onProgress?: (p: number, msg: string) => void) => Promise<ConvertedAudioItem | null>;

  // Mini Audio Player
  nowPlayingAudio: ConvertedAudioItem | null;
  playAudio: (audio: ConvertedAudioItem) => void;
  stopAudio: () => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;

  // Settings & Playback
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  playbackSettings: PlaybackSettings;
  updatePlaybackSettings: (newPlayback: Partial<PlaybackSettings>) => void;

  // Feedback & Toasts
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Voice Search Modal
  isVoiceSearchOpen: boolean;
  setIsVoiceSearchOpen: (open: boolean) => void;

  // Share Modal
  shareVideoTarget: VideoItem | null;
  setShareVideoTarget: (video: VideoItem | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'videohub_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeOfflineMedia, setActiveOfflineMedia] = useState<DownloadItem | null>(null);

  // Search & Category
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'search_history');
      return saved ? JSON.parse(saved) : ['Khmer Golden Hits', 'Despacito', 'Ed Sheeran', 'Angkor Wat 4K', 'JavaScript Tutorial'];
    } catch {
      return [];
    }
  });

  // Language & Theme
  const [language, setLanguageState] = useState<'km' | 'en'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_PREFIX + 'language') as 'km' | 'en') || 'en';
  });
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_PREFIX + 'theme') as 'dark' | 'light' | 'system') || 'dark';
  });

  // User & Modals
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'user');
      return saved ? JSON.parse(saved) : {
        id: 'usr_default',
        name: 'Dara Houth',
        email: 'darahouthr@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
        language: 'en',
        theme: 'dark',
        isLoggedIn: true,
        googleLinked: true
      };
    } catch {
      return {
        id: 'usr_guest',
        name: 'Guest Viewer',
        email: 'guest@videohub.app',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Guest',
        language: 'en',
        theme: 'dark',
        isLoggedIn: false,
        googleLinked: false
      };
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [shareVideoTarget, setShareVideoTarget] = useState<VideoItem | null>(null);
  const [selectedVideoForPlaylist, setSelectedVideoForPlaylist] = useState<VideoItem | null>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'settings');
      return saved ? JSON.parse(saved) : {
        language: 'en',
        theme: 'dark',
        autoplay: true,
        defaultQuality: 'auto',
        defaultVolume: 80,
        captionsEnabled: false,
        downloadLocation: '/storage/emulated/0/Download/VideoHub',
        wifiOnlyDownloads: false,
        maxConcurrentDownloads: 3,
        autoDeleteDownloads: false,
        pauseHistory: false,
        pauseSearchHistory: false
      };
    } catch {
      return {
        language: 'en',
        theme: 'dark',
        autoplay: true,
        defaultQuality: 'auto',
        defaultVolume: 80,
        captionsEnabled: false,
        downloadLocation: '/downloads',
        wifiOnlyDownloads: false,
        maxConcurrentDownloads: 3,
        autoDeleteDownloads: false,
        pauseHistory: false,
        pauseSearchHistory: false
      };
    }
  });

  const [pauseHistory, setPauseHistory] = useState(settings.pauseHistory);

  // Favorites
  const [favorites, setFavorites] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'favorites');
      return saved ? JSON.parse(saved) : [INITIAL_VIDEOS[0], INITIAL_VIDEOS[1], INITIAL_VIDEOS[4]];
    } catch {
      return [];
    }
  });

  // Playlists
  const [playlists, setPlaylists] = useState<PlaylistItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'playlists');
      return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  // Watch History
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'watch_history');
      return saved ? JSON.parse(saved) : [
        {
          videoId: INITIAL_VIDEOS[0].videoId,
          title: INITIAL_VIDEOS[0].title,
          thumbnail: INITIAL_VIDEOS[0].thumbnail,
          channel: INITIAL_VIDEOS[0].channelTitle,
          channelAvatar: INITIAL_VIDEOS[0].channelAvatar,
          position: 145,
          duration: 282,
          progress: 51,
          lastWatchedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          videoId: INITIAL_VIDEOS[1].videoId,
          title: INITIAL_VIDEOS[1].title,
          thumbnail: INITIAL_VIDEOS[1].thumbnail,
          channel: INITIAL_VIDEOS[1].channelTitle,
          channelAvatar: INITIAL_VIDEOS[1].channelAvatar,
          position: 620,
          duration: 2535,
          progress: 24,
          lastWatchedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  // Downloads (Authorized Media)
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'downloads');
      return saved ? JSON.parse(saved) : [
        {
          id: 'dl-seed-1',
          videoId: INITIAL_VIDEOS[4].videoId,
          title: INITIAL_VIDEOS[4].title,
          thumbnail: INITIAL_VIDEOS[4].thumbnail,
          channel: INITIAL_VIDEOS[4].channelTitle,
          quality: '720p',
          fileSizeMB: 145.2,
          downloadedMB: 145.2,
          progress: 100,
          status: 'completed',
          startedAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86200000).toISOString(),
          mediaUrl: INITIAL_VIDEOS[4].authorizedMediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
          isAudioOnly: false
        }
      ];
    } catch {
      return [];
    }
  });

  // Converted Audio Items
  const [convertedAudioList, setConvertedAudioList] = useState<ConvertedAudioItem[]>([]);
  const [converterPreload, setConverterPreload] = useState<{
    file?: File;
    title?: string;
    artist?: string;
    album?: string;
  } | null>(null);

  // Mini Audio Player State
  const [nowPlayingAudio, setNowPlayingAudio] = useState<ConvertedAudioItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = String(Date.now() + Math.random());
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync with Local Storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'playlists', JSON.stringify(playlists));
    } catch {}
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'watch_history', JSON.stringify(watchHistory));
    } catch {}
  }, [watchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'downloads', JSON.stringify(downloads));
    } catch {}
  }, [downloads]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'search_history', JSON.stringify(searchHistory));
    } catch {}
  }, [searchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Translation helper
  const t = useCallback((key: keyof typeof translations['en']): string => {
    const dict = translations[language] || translations.en;
    return (dict[key] as string) || (translations.en[key] as string) || key;
  }, [language]);

  const setLanguage = (lang: 'km' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'language', lang);
    showToast(lang === 'km' ? 'បានប្តូរទៅជាភាសាខ្មែរ 🇰🇭' : 'Language switched to English 🇺🇸', 'info');
  };

  const setTheme = (thm: 'dark' | 'light' | 'system') => {
    setThemeState(thm);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'theme', thm);
    showToast(`Theme updated to ${thm}`, 'info');
  };

  const playVideo = useCallback((videoOrId: VideoItem | string) => {
    let vidItem: VideoItem | null = null;
    let vId = '';

    if (typeof videoOrId === 'string') {
      vId = videoOrId;
      const found = INITIAL_VIDEOS.find(v => v.videoId === videoOrId);
      vidItem = found || {
        videoId: videoOrId,
        title: `YouTube Video (${videoOrId})`,
        description: 'Streaming via official YouTube player.',
        thumbnail: `https://img.youtube.com/vi/${videoOrId}/hqdefault.jpg`,
        channelId: 'UC_channel',
        channelTitle: 'YouTube Creator',
        channelAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${videoOrId}`,
        publishedAt: new Date().toISOString(),
        duration: '04:30',
        durationSeconds: 270,
        viewCount: 1500000,
        likeCount: 45000,
        categoryId: 'entertainment',
        tags: ['youtube'],
        isDownloadableAuthorized: true,
        authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      };
    } else {
      vidItem = videoOrId;
      vId = videoOrId.videoId;
    }

    setActiveVideoId(vId);
    setActiveVideo(vidItem);
    setCurrentTab('player');

    // Add to history automatically
    if (!pauseHistory && vidItem) {
      setWatchHistory(prev => {
        const filtered = prev.filter(item => item.videoId !== vidItem!.videoId);
        return [
          {
            videoId: vidItem!.videoId,
            title: vidItem!.title,
            thumbnail: vidItem!.thumbnail,
            channel: vidItem!.channelTitle,
            channelAvatar: vidItem!.channelAvatar,
            position: 0,
            duration: vidItem!.durationSeconds || 240,
            progress: 0,
            lastWatchedAt: new Date().toISOString()
          },
          ...filtered
        ].slice(0, 60);
      });
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pauseHistory]);

  const openChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    setCurrentTab('channel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const playOfflineMedia = useCallback((download: DownloadItem) => {
    setActiveOfflineMedia(download);
    setCurrentTab('offline-player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addSearchHistory = useCallback((q: string) => {
    if (!q.trim() || settings.pauseSearchHistory) return;
    setSearchHistory(prev => [q, ...prev.filter(item => item.toLowerCase() !== q.toLowerCase())].slice(0, 15));
  }, [settings.pauseSearchHistory]);

  const clearSearchHistory = () => {
    setSearchHistory([]);
    showToast(t('clearSearchHistory'), 'info');
  };

  const isFavorite = (videoId: string) => {
    return favorites.some(f => f.videoId === videoId);
  };

  const toggleFavorite = (video: VideoItem) => {
    if (isFavorite(video.videoId)) {
      setFavorites(prev => prev.filter(f => f.videoId !== video.videoId));
      showToast(`Removed "${video.title.slice(0, 25)}..." from favorites`, 'info');
    } else {
      setFavorites(prev => [video, ...prev]);
      showToast(`Saved "${video.title.slice(0, 25)}..." to Favorites ❤️`, 'success');
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
    showToast('Favorites cleared', 'info');
  };

  // Playlists
  const createPlaylist = (title: string, description: string = '', isPublic: boolean = true) => {
    const gradients = [
      'from-purple-600 to-indigo-800',
      'from-amber-600 to-red-700',
      'from-emerald-600 to-teal-800',
      'from-pink-600 to-rose-800',
      'from-cyan-600 to-blue-800'
    ];
    const newPl: PlaylistItem = {
      id: `pl-${Date.now()}`,
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic,
      coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
      videoCount: 0,
      videos: []
    };
    setPlaylists(prev => [newPl, ...prev]);
    showToast(t('playlistCreated'), 'success');
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    showToast('Playlist deleted', 'info');
  };

  const renamePlaylist = (playlistId: string, newTitle: string, newDesc?: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            title: newTitle,
            description: newDesc !== undefined ? newDesc : p.description,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );
    showToast('Playlist updated', 'success');
  };

  const addVideoToPlaylist = (playlistId: string, video: VideoItem) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          if (p.videos.some(v => v.videoId === video.videoId)) {
            showToast('Video already in this playlist', 'warning');
            return p;
          }
          const updatedVideos = [...p.videos, video];
          showToast(t('videoAddedToPlaylist'), 'success');
          return {
            ...p,
            videos: updatedVideos,
            videoCount: updatedVideos.length,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );
  };

  const removeVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          const updated = p.videos.filter(v => v.videoId !== videoId);
          return {
            ...p,
            videos: updated,
            videoCount: updated.length,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );
    showToast(t('videoRemovedFromPlaylist'), 'info');
  };

  // Watch History
  const addToHistory = (video: VideoItem, position: number = 0, duration: number = 0) => {
    if (pauseHistory) return;
    const dur = duration || video.durationSeconds || 240;
    const prog = Math.min(100, Math.round((position / dur) * 100));

    setWatchHistory(prev => {
      const filtered = prev.filter(item => item.videoId !== video.videoId);
      return [
        {
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          channel: video.channelTitle,
          channelAvatar: video.channelAvatar,
          position,
          duration: dur,
          progress: prog,
          lastWatchedAt: new Date().toISOString()
        },
        ...filtered
      ].slice(0, 60);
    });
  };

  const removeFromHistory = (videoId: string) => {
    setWatchHistory(prev => prev.filter(h => h.videoId !== videoId));
    showToast('Removed from history', 'info');
  };

  const clearWatchHistory = () => {
    setWatchHistory([]);
    showToast('Watch history cleared', 'info');
  };

  // Offline Downloads (Authorized Content)
  const startDownload = (video: VideoItem, quality: DownloadQuality = '720p') => {
    if (!video.isDownloadableAuthorized) {
      showToast(t('unauthorizedDownloadNotice'), 'warning');
      return;
    }

    const sizesMap: Record<DownloadQuality, number> = {
      '360p': 45.4,
      '480p': 78.2,
      '720p': 142.8,
      '1080p': 285.6,
      'Audio': 12.5
    };

    const targetSize = sizesMap[quality] || 120;
    const downloadId = `dl-${Date.now()}`;

    const newDownload: DownloadItem = {
      id: downloadId,
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      channel: video.channelTitle,
      quality,
      fileSizeMB: targetSize,
      downloadedMB: 0,
      progress: 0,
      status: 'downloading',
      startedAt: new Date().toISOString(),
      mediaUrl: video.authorizedMediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isAudioOnly: quality === 'Audio'
    };

    setDownloads(prev => [newDownload, ...prev]);
    showToast(`${t('downloading')} (${quality})`, 'info');

    // Notify backend stats
    fetch('/api/stats/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: video.title, quality, sizeMB: targetSize })
    }).catch(() => {});

    // Active progressive simulation for local authorized storage
    let currentDownloaded = 0;
    const interval = setInterval(() => {
      setDownloads(prevList => {
        const item = prevList.find(d => d.id === downloadId);
        if (!item || item.status === 'paused' || item.status === 'canceled') {
          clearInterval(interval);
          return prevList;
        }

        const step = (targetSize / 15) * (0.8 + Math.random() * 0.4);
        currentDownloaded = Math.min(targetSize, currentDownloaded + step);
        const progress = Math.min(100, Math.round((currentDownloaded / targetSize) * 100));

        if (progress >= 100) {
          clearInterval(interval);
          showToast(`Download finished: ${video.title.slice(0, 20)}...`, 'success');
          return prevList.map(d =>
            d.id === downloadId
              ? {
                  ...d,
                  progress: 100,
                  downloadedMB: targetSize,
                  status: 'completed',
                  completedAt: new Date().toISOString()
                }
              : d
          );
        }

        return prevList.map(d =>
          d.id === downloadId
            ? {
                ...d,
                progress,
                downloadedMB: parseFloat(currentDownloaded.toFixed(1))
              }
            : d
        );
      });
    }, 600);
  };

  const pauseDownload = (id: string) => {
    setDownloads(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'paused' } : d))
    );
    showToast('Download paused', 'info');
  };

  const resumeDownload = (id: string) => {
    setDownloads(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'downloading' } : d))
    );
    showToast('Download resumed', 'info');
  };

  const cancelDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
    showToast('Download canceled', 'info');
  };

  const deleteDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
    showToast('Offline media deleted', 'info');
  };

  // Audio Converter & Mini Player
  const addConvertedAudio = (audio: ConvertedAudioItem) => {
    setConvertedAudioList(prev => [audio, ...prev]);
    showToast(`Added "${audio.title}" to Audio Library`, 'success');
    // Notify server telemetry
    fetch('/api/stats/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: audio.originalFilename, bitrate: audio.bitrate, sizeMB: audio.fileSizeBytes / (1024 * 1024) })
    }).catch(() => {});
  };

  const deleteConvertedAudio = (id: string) => {
    setConvertedAudioList(prev => prev.filter(a => a.id !== id));
    if (nowPlayingAudio?.id === id) {
      setNowPlayingAudio(null);
      setIsPlayingAudio(false);
    }
    showToast('Audio file removed from library', 'info');
  };

  const convertDownloadToMp3 = async (
    item: DownloadItem,
    onProgress?: (p: number, msg: string) => void
  ): Promise<ConvertedAudioItem | null> => {
    try {
      if (onProgress) onProgress(10, 'Fetching media stream for conversion...');
      let blob: Blob;
      try {
        if (item.localBlobUrl) {
          const res = await fetch(item.localBlobUrl);
          blob = await res.blob();
        } else if (item.mediaUrl) {
          const res = await fetch(item.mediaUrl);
          if (!res.ok) throw new Error('Fetch failed');
          blob = await res.blob();
        } else {
          blob = await generateSampleVideoBlob('khmer_beat');
        }
      } catch {
        blob = await generateSampleVideoBlob('khmer_beat');
      }

      const safeTitle = item.title || 'Converted Audio';
      const cleanFileName = (safeTitle.replace(/[^\w\s\u1780-\u17FF-]/g, '').trim() || 'audio_track') + '.mp4';
      const safeFile = new File([blob], cleanFileName, { type: 'video/mp4' });

      if (onProgress) onProgress(30, 'Converting and encoding audio to MP3...');
      const result = await convertVideoToMp3(safeFile, {
        bitrate: 192,
        title: safeTitle,
        artist: item.channel || 'Artist',
        album: 'VideoHub Downloads',
        onProgress: (p, status) => {
          if (onProgress) onProgress(p, status);
        }
      });

      const newMp3: ConvertedAudioItem = {
        id: `mp3_${Date.now()}`,
        title: safeTitle,
        artist: item.channel || 'Artist',
        album: 'VideoHub Downloads',
        durationSeconds: result.duration || 180,
        duration: formatTime(result.duration || 180),
        fileSize: result.blob.size,
        fileSizeBytes: result.blob.size,
        blobUrl: result.blobUrl,
        bitrate: 192,
        createdAt: new Date().toISOString(),
        originalFileName: cleanFileName,
        waveformSample: result.waveformSample
      };

      addConvertedAudio(newMp3);
      playAudio(newMp3);
      showToast(`Converted "${safeTitle.slice(0, 24)}..." to MP3!`, 'success');
      return newMp3;
    } catch (err: any) {
      showToast(`Conversion failed: ${err.message || 'Error'}`, 'error');
      return null;
    }
  };

  const playAudio = (audio: ConvertedAudioItem) => {
    setNowPlayingAudio(audio);
    setIsPlayingAudio(true);
  };

  const stopAudio = () => {
    setIsPlayingAudio(false);
  };

  const loginUser = (email: string, name: string, isGoogle: boolean = false) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name || 'Dara Houth',
      email: email || 'darahouthr@gmail.com',
      avatar: isGoogle
        ? 'https://i.postimg.cc/tRmS6SMJ/DSCF0067.jpg'
        : `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
      language,
      theme,
      isLoggedIn: true,
      googleLinked: isGoogle
    };
    setUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${newUser.name}!`, 'success');
  };

  const logoutUser = () => {
    const guestUser: UserProfile = {
      id: 'usr_guest',
      name: 'Guest Viewer',
      email: 'guest@videohub.app',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Guest',
      language,
      theme,
      isLoggedIn: false,
      googleLinked: false
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'user', JSON.stringify(guestUser));
    showToast('Signed out', 'info');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (newSettings.pauseHistory !== undefined) {
      setPauseHistory(newSettings.pauseHistory);
    }
    showToast('Settings saved', 'success');
  };

  const playbackSettings: PlaybackSettings = {
    autoPlayNext: settings.autoplay,
    preferredQuality: settings.defaultQuality,
    volume: settings.defaultVolume,
    playbackSpeed: 1,
    autoPlay: settings.autoplay
  };

  const updatePlaybackSettings = (newPlayback: Partial<PlaybackSettings>) => {
    const updates: Partial<AppSettings> = {};
    if (newPlayback.autoPlayNext !== undefined) {
      updates.autoplay = newPlayback.autoPlayNext;
    }
    if (newPlayback.autoPlay !== undefined) {
      updates.autoplay = newPlayback.autoPlay;
    }
    if (newPlayback.preferredQuality !== undefined) {
      updates.defaultQuality = newPlayback.preferredQuality;
    }
    if (newPlayback.volume !== undefined) {
      updates.defaultVolume = newPlayback.volume;
    }
    updateSettings(updates);
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        activeVideoId,
        activeVideo,
        playVideo,
        activeChannelId,
        openChannel,
        activeOfflineMedia,
        activeOfflineVideo: activeOfflineMedia,
        playOfflineMedia,
        playOfflineVideo: playOfflineMedia,

        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,

        language,
        setLanguage,
        theme,
        setTheme,
        t,

        user,
        loginUser,
        logoutUser,
        isAuthModalOpen,
        setIsAuthModalOpen,

        favorites,
        isFavorite,
        toggleFavorite,
        clearFavorites,

        playlists,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        selectedVideoForPlaylist,
        setSelectedVideoForPlaylist,

        watchHistory,
        addToHistory,
        removeFromHistory,
        removeFromWatchHistory: removeFromHistory,
        clearWatchHistory,
        pauseHistory,
        setPauseHistory,

        downloads,
        startDownload,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        deleteDownload,
        removeDownload: deleteDownload,

        convertedAudioList,
        addConvertedAudio,
        deleteConvertedAudio,
        removeConvertedAudio: deleteConvertedAudio,
        converterPreload,
        setConverterPreload,
        convertDownloadToMp3,

        nowPlayingAudio,
        playAudio,
        stopAudio,
        isPlayingAudio,
        setIsPlayingAudio,

        settings,
        updateSettings,
        playbackSettings,
        updatePlaybackSettings,

        toasts,
        showToast,
        removeToast,

        isVoiceSearchOpen,
        setIsVoiceSearchOpen,

        shareVideoTarget,
        setShareVideoTarget
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
