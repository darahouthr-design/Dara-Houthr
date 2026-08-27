import { VideoItem, ChannelItem, AdminStats } from '../types';
import { INITIAL_VIDEOS, INITIAL_CHANNELS } from '../data/mockData';

export async function searchVideos(
  query: string,
  category = 'all',
  sort = 'relevance',
  type = 'video'
): Promise<VideoItem[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      category,
      sort,
      type
    });

    const res = await fetch(`/api/youtube/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items;
      }
    }
  } catch (err) {
    console.warn('API fetch error, using local catalog fallback:', err);
  }

  // Fallback filtering
  let results = [...INITIAL_VIDEOS];
  if (category && category !== 'all') {
    results = results.filter(v => v.categoryId.toLowerCase() === category.toLowerCase());
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channelTitle.toLowerCase().includes(q) ||
        v.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (sort === 'views') {
    results.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.likeCount - a.likeCount);
  }
  return results;
}

export async function getVideoDetails(videoId: string): Promise<VideoItem> {
  try {
    const res = await fetch(`/api/youtube/videos/${videoId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.video) return data.video;
    }
  } catch (err) {
    console.warn('Error fetching video details:', err);
  }

  const local = INITIAL_VIDEOS.find(v => v.videoId === videoId);
  if (local) return local;

  return {
    videoId,
    title: `YouTube Video (${videoId})`,
    description: 'Official video streaming via YouTube Embedded Player API.',
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    channelId: 'UC_youtube',
    channelTitle: 'YouTube Creator',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=60',
    publishedAt: new Date().toISOString(),
    duration: '04:30',
    durationSeconds: 270,
    viewCount: 1200000,
    likeCount: 45000,
    categoryId: 'entertainment',
    categoryName: 'Entertainment',
    tags: ['youtube', 'video'],
    isDownloadableAuthorized: false
  };
}

export async function getRelatedVideos(videoId: string): Promise<VideoItem[]> {
  try {
    const res = await fetch(`/api/youtube/videos/${videoId}/related`);
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) return data.items;
    }
  } catch (err) {
    console.warn('Error fetching related:', err);
  }
  return INITIAL_VIDEOS.filter(v => v.videoId !== videoId);
}

export async function getChannelDetails(channelId: string): Promise<ChannelItem> {
  try {
    const res = await fetch(`/api/youtube/channels/${channelId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.channel) return data.channel;
    }
  } catch (err) {
    console.warn('Error fetching channel details:', err);
  }

  const local = INITIAL_CHANNELS.find(c => c.channelId === channelId);
  if (local) return local;

  return {
    channelId,
    title: 'YouTube Creator Channel',
    handle: `@${channelId.slice(0, 10).toLowerCase()}`,
    description: 'Official YouTube channel with creator uploads and playlists.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    subscriberCount: '1.5M',
    videoCount: 45,
    joinedDate: '2020-01-01',
    videos: INITIAL_VIDEOS.slice(0, 4)
  };
}

export async function getChannelVideos(channelId: string): Promise<VideoItem[]> {
  const channel = await getChannelDetails(channelId);
  if (channel && channel.videos && channel.videos.length > 0) {
    return channel.videos;
  }
  return INITIAL_VIDEOS.filter(v => v.channelId === channelId || v.channelTitle === channel?.title);
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.suggestions)) {
        return data.suggestions;
      }
    }
  } catch (err) {
    console.warn('Error fetching suggestions:', err);
  }
  return [];
}

export async function getAdminTelemetry(): Promise<any> {
  try {
    const res = await fetch('/api/admin/stats');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Error fetching admin telemetry:', err);
  }

  return {
    totalRequests: 86,
    apiRequests: 42,
    cachedHits: 44,
    cacheHitRatio: '94.2%',
    cachedQueries: 14,
    conversionsCompleted: 6,
    storageUsedMB: 18.5,
    uptime: 3600,
    systemLogs: [
      { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'System healthy and ready' }
    ]
  };
}
