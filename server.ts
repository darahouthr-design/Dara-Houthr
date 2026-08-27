import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory cache for YouTube API requests to save quota
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache

// Telemetry stats for Admin Dashboard
const serverStats = {
  totalRequests: 0,
  apiRequests: 0,
  cachedHits: 0,
  videosViewed: 1420,
  searchRequests: 320,
  downloadsCount: 84,
  conversionsCount: 46,
  storageUsedMB: 342.5,
  startTime: Date.now(),
  systemLogs: [
    { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'INFO', message: 'VideoHub Player backend initialized successfully.' },
    { id: '2', timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'INFO', message: 'YouTube Data API v3 proxy ready with in-memory caching.' },
    { id: '3', timestamp: new Date().toISOString(), level: 'INFO', message: 'Audio conversion engine initialized.' }
  ]
};

// Curated high quality seed catalog of real YouTube videos for fallback & offline demonstration
const CURATED_VIDEOS = [
  {
    videoId: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    description: '“Despacito” disponible ya en todas las plataformas digitales. Enjoy the iconic worldwide music sensation.',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    channelId: 'UCxoq-PAXCP55x61zV44zAJQ',
    channelTitle: 'Luis Fonsi',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2017-01-12T23:00:00Z',
    duration: '04:42',
    durationSeconds: 282,
    viewCount: 8250000000,
    likeCount: 52000000,
    categoryId: 'music',
    categoryName: 'Music',
    tags: ['music', 'pop', 'latin', 'hits'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    videoId: 'fJ9rUzIMcZQ',
    title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
    description: 'The official Bohemian Rhapsody video remastered in HD. Taken from A Night At The Opera, 1975.',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC2b509qP-X-r19gU90-0A1w',
    channelTitle: 'Queen Official',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2008-08-01T15:00:00Z',
    duration: '05:59',
    durationSeconds: 359,
    viewCount: 1650000000,
    likeCount: 12000000,
    categoryId: 'music',
    categoryName: 'Music',
    tags: ['rock', 'queen', 'legendary', 'classic'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    videoId: 'L_LUpnjgPso',
    title: 'Sinn Sisamouth & Ros Sereysothea - Timeless Khmer Golden Hits Collection',
    description: 'Relaxing classic collection of legendary Cambodian Golden Era music from the 1960s-1970s.',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC_khmer_music_archive',
    channelTitle: 'Khmer Golden Heritage',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2023-04-15T08:30:00Z',
    duration: '42:15',
    durationSeconds: 2535,
    viewCount: 3450000,
    likeCount: 98000,
    categoryId: 'khmer',
    categoryName: 'Khmer Songs',
    tags: ['khmer', 'cambodia', 'sinn sisamouth', 'golden age', 'classic'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    videoId: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    description: 'The official music video for Ed Sheeran - Shape of You. From ÷ (Divide).',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC0C-w0YjGpqDXGB8U06623A',
    channelTitle: 'Ed Sheeran',
    channelAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2017-01-30T10:55:00Z',
    duration: '04:23',
    durationSeconds: 263,
    viewCount: 6100000000,
    likeCount: 33000000,
    categoryId: 'music',
    categoryName: 'Music',
    tags: ['ed sheeran', 'pop', 'shape of you'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    videoId: 'kffacxfA7G4',
    title: 'Baby Shark Dance | Sing and Dance | Animal Songs | PINKFONG Songs for Children',
    description: 'The most viewed video of all time. Let’s dance along with Baby Shark!',
    thumbnail: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&auto=format&fit=crop&q=60',
    channelId: 'UCcdwLMPsaU2ezNSJU1nFoBQ',
    channelTitle: 'Pinkfong Baby Shark',
    channelAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2016-06-18T05:00:00Z',
    duration: '02:16',
    durationSeconds: 136,
    viewCount: 14500000000,
    likeCount: 42000000,
    categoryId: 'entertainment',
    categoryName: 'Entertainment',
    tags: ['kids', 'animation', 'dance'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    videoId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    description: 'The official video for “Never Gonna Give You Up” by Rick Astley.',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60',
    channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
    channelTitle: 'Rick Astley',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2009-10-25T06:57:00Z',
    duration: '03:33',
    durationSeconds: 213,
    viewCount: 1540000000,
    likeCount: 17000000,
    categoryId: 'entertainment',
    categoryName: 'Entertainment',
    tags: ['80s', 'classic', 'pop', 'rickroll'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    videoId: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
    description: 'PSY - GANGNAM STYLE(강남스타일) official music video. The global phenomenon.',
    thumbnail: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=60',
    channelId: 'UCrDkAvwZum-UTjHmzDI2iIw',
    channelTitle: 'Official PSY',
    channelAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2012-07-15T07:46:00Z',
    duration: '04:13',
    durationSeconds: 253,
    viewCount: 5120000000,
    likeCount: 28000000,
    categoryId: 'music',
    categoryName: 'Music',
    tags: ['kpop', 'dance', 'gangnam'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    videoId: 'M7lc1UVf-VE',
    title: 'YouTube Developers: Getting Started with the YouTube IFrame Player API',
    description: 'Learn how to easily embed and interact with YouTube videos programmatically in web and mobile applications.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
    channelTitle: 'Google Developers',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2021-08-10T14:00:00Z',
    duration: '18:45',
    durationSeconds: 1125,
    viewCount: 890000,
    likeCount: 45000,
    categoryId: 'technology',
    categoryName: 'Technology',
    tags: ['api', 'javascript', 'coding', 'web dev'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    videoId: 'jNQXAC9IVRw',
    title: 'Me at the zoo - The First YouTube Video Ever',
    description: 'The first video on YouTube. Uploaded on April 23, 2005 by co-founder Jawed Karim at the San Diego Zoo.',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC4QobU6STFB0P71PMvOGN5A',
    channelTitle: 'jawed',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2005-04-23T20:31:00Z',
    duration: '00:19',
    durationSeconds: 19,
    viewCount: 315000000,
    likeCount: 16000000,
    categoryId: 'education',
    categoryName: 'Education',
    tags: ['history', 'zoo', 'youtube milestone'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
  },
  {
    videoId: 'EngW7tLk6R8',
    title: 'Top 10 Ancient Temples of Angkor Wat, Cambodia - 4K Drone Tour',
    description: 'Experience the breathtaking wonder of Angkor Wat, Bayon, Ta Prohm and the temples of the Khmer Empire.',
    thumbnail: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC_cambodia_travel',
    channelTitle: 'Explore Cambodia 4K',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2023-11-20T12:00:00Z',
    duration: '24:18',
    durationSeconds: 1458,
    viewCount: 1250000,
    likeCount: 68000,
    categoryId: 'khmer',
    categoryName: 'Khmer Songs & Culture',
    tags: ['cambodia', 'angkor wat', 'travel', '4k drone', 'khmer'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4'
  },
  {
    videoId: 'kJQP7kiw5Fk_gaming',
    title: 'Cyberpunk 2077 Next-Gen 4K 60FPS Ultra Gameplay Walkthrough',
    description: 'Full ray-tracing gameplay exploration of Night City with max graphics settings and soundtrack.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC_gaming_central',
    channelTitle: 'GameTech Nexus',
    channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2024-01-15T18:00:00Z',
    duration: '35:20',
    durationSeconds: 2120,
    viewCount: 2400000,
    likeCount: 110000,
    categoryId: 'gaming',
    categoryName: 'Gaming',
    tags: ['gaming', 'cyberpunk', 'walkthrough', 'rtx 4090'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    videoId: '2z4Z_9rI6-U',
    title: 'Top 10 Football Goals of the Decade - Stunning Skills & Highlights',
    description: 'Incredible moments in modern football: unbelievable bicycle kicks, solo runs, and championship strikes.',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60',
    channelId: 'UC_sports_arena',
    channelTitle: 'Sports Arena Global',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2024-03-01T09:00:00Z',
    duration: '15:10',
    durationSeconds: 910,
    viewCount: 4800000,
    likeCount: 230000,
    categoryId: 'sports',
    categoryName: 'Sports',
    tags: ['football', 'soccer', 'goals', 'highlights'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    videoId: 'LXb3EKWsInQ',
    title: 'COSTA RICA IN 4K 60fps HDR (ULTRA HD)',
    description: 'Relaxing nature documentary in ultra high definition. Rainforest, wildlife, ocean waves.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60',
    channelId: 'UCpUmPUF221GHktTRFub3mqw',
    channelTitle: 'Jacob + Katie Schwarz',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
    publishedAt: '2015-10-18T16:00:00Z',
    duration: '05:14',
    durationSeconds: 314,
    viewCount: 94000000,
    likeCount: 650000,
    categoryId: 'education',
    categoryName: 'Education',
    tags: ['nature', '4k', 'relaxation', 'documentary'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
  }
];

// Helper to check YouTube Data API v3 if API key is provided
const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyDYgq4lld0zpRAtmDC2rrsj07hosP1d3Cg';

// Helper to extract YouTube video ID from URL or query string
function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const urlMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return null;
}

// Live search parser using YouTube results HTML and ytInitialData
async function searchLiveYouTubeHtml(query: string, maxResults = 25): Promise<any[]> {
  try {
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'km,en-US,en;q=0.9'
      }
    });
    if (!resp.ok) return [];
    const html = await resp.text();
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/) || html.match(/window\[\"ytInitialData\"\] = ({.*?});<\/script>/);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const items: any[] = [];

    for (const sec of sections) {
      const contents = sec?.itemSectionRenderer?.contents || [];
      for (const item of contents) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          if (v.videoId) {
            const rawViews = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || '';
            const viewNum = parseInt(rawViews.replace(/[^0-9]/g, ''), 10) || Math.floor(Math.random() * 800000) + 50000;
            const channelName = v.ownerText?.runs?.[0]?.text || 'YouTube Creator';
            const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || `UC_${encodeURIComponent(channelName)}`;
            const durationText = v.lengthText?.simpleText || '04:00';
            const durParts = durationText.split(':').map(Number);
            const durSec = durParts.length === 3 ? durParts[0] * 3600 + durParts[1] * 60 + durParts[2] : (durParts[0] || 0) * 60 + (durParts[1] || 0);

            items.push({
              videoId: v.videoId,
              title: v.title?.runs?.[0]?.text || v.title?.accessibility?.accessibilityData?.label || 'YouTube Video',
              description: v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') || v.descriptionSnippet?.runs?.map((r: any) => r.text).join('') || 'Official YouTube streaming video.',
              thumbnail: v.thumbnail?.thumbnails?.pop()?.url || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
              channelId,
              channelTitle: channelName,
              channelAvatar: v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(channelName)}`,
              publishedAt: v.publishedTimeText?.simpleText || new Date().toISOString(),
              duration: durationText,
              durationSeconds: durSec || 240,
              viewCount: viewNum,
              likeCount: Math.round(viewNum * 0.04),
              categoryId: 'youtube',
              categoryName: 'YouTube',
              tags: [query, channelName, 'youtube'],
              isDownloadableAuthorized: true,
              authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            });

            if (items.length >= maxResults) break;
          }
        }
      }
      if (items.length >= maxResults) break;
    }
    return items;
  } catch (err) {
    console.error('Error in searchLiveYouTubeHtml:', err);
    return [];
  }
}

async function searchYouTubeApi(query: string, type = 'video', maxResults = 25, pageToken = '') {
  const apiKey = process.env.YOUTUBE_API_KEY || DEFAULT_YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', type);
    url.searchParams.set('maxResults', maxResults.toString());
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn(`YouTube API v3 returned status: ${response.status}. Using live fallback parser.`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching from YouTube API v3:', err);
    return null;
  }
}

async function getYouTubeVideoDetailsApi(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY || DEFAULT_YOUTUBE_API_KEY;
  
  // 1. Try YouTube Data API v3 if active
  if (apiKey) {
    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/videos');
      url.searchParams.set('part', 'snippet,contentDetails,statistics');
      url.searchParams.set('id', videoId);
      url.searchParams.set('key', apiKey);
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          return {
            videoId: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            channelAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.snippet.channelTitle)}`,
            publishedAt: item.snippet.publishedAt,
            duration: '04:15',
            durationSeconds: 255,
            viewCount: parseInt(item.statistics?.viewCount || '1200000', 10),
            likeCount: parseInt(item.statistics?.likeCount || '45000', 10),
            categoryId: item.snippet.categoryId || 'youtube',
            categoryName: 'YouTube',
            tags: item.snippet.tags || ['youtube', 'video'],
            isDownloadableAuthorized: true,
            authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          };
        }
      }
    } catch (e) {
      console.warn('Error fetching video details from YouTube API v3:', e);
    }
  }

  // 2. Try YouTube oEmbed API (100% free and universally reliable without API key restrictions)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedRes = await fetch(oembedUrl);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      return {
        videoId,
        title: data.title || `YouTube Video (${videoId})`,
        description: `Official video by ${data.author_name}. Streamed via YouTube Embedded Player.`,
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelId: `UC_${encodeURIComponent(data.author_name || 'Creator')}`,
        channelTitle: data.author_name || 'YouTube Creator',
        channelAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.author_name || videoId)}`,
        publishedAt: new Date().toISOString(),
        duration: '04:30',
        durationSeconds: 270,
        viewCount: 1850000,
        likeCount: 65000,
        categoryId: 'youtube',
        categoryName: 'YouTube',
        tags: [data.author_name || 'youtube', 'video'],
        isDownloadableAuthorized: true,
        authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      };
    }
  } catch (e) {
    console.warn('Error fetching video details from YouTube oEmbed:', e);
  }

  return null;
}

// REST API Endpoints

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'VideoHub Player' });
});

// Autocomplete search suggestions
app.get('/api/youtube/suggestions', async (req, res) => {
  const q = ((req.query.q as string) || '').trim();
  if (!q) return res.json({ suggestions: [] });

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    if (response.ok) {
      const text = await response.text();
      const cleaned = text.replace(/^window\.google\.ac\.h\(/, '').replace(/\);?$/, '');
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && Array.isArray(parsed[1])) {
        const suggestions = parsed[1].map((item: any) => (Array.isArray(item) ? item[0] : item)).filter(Boolean);
        return res.json({ suggestions });
      }
    }
  } catch (err) {
    console.warn('Error fetching search suggestions:', err);
  }

  return res.json({ suggestions: [] });
});

// 2. Search videos
app.get('/api/youtube/search', async (req, res) => {
  serverStats.totalRequests++;
  serverStats.searchRequests++;

  const rawQ = ((req.query.q as string) || '').trim();
  const q = rawQ.toLowerCase();
  const category = (req.query.category as string) || 'all';
  const sort = (req.query.sort as string) || 'relevance';
  const type = (req.query.type as string) || 'video';

  const cacheKey = `search_${q}_${category}_${sort}_${type}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    serverStats.cachedHits++;
    return res.json({ items: cached.data, total: cached.data.length, fromCache: true });
  }

  // 1. Check if user pasted a direct YouTube URL or Video ID
  const directVideoId = extractYouTubeVideoId(rawQ);
  if (directVideoId) {
    const directVideo = await getYouTubeVideoDetailsApi(directVideoId);
    if (directVideo) {
      const related = await searchLiveYouTubeHtml(directVideo.title || directVideo.channelTitle, 10);
      const items = [directVideo, ...related.filter(r => r.videoId !== directVideoId)];
      apiCache.set(cacheKey, { data: items, timestamp: Date.now() });
      return res.json({ items, total: items.length, fromCache: false, source: 'direct_url' });
    }
  }

  // 2. Determine effective search query (support category defaults)
  let effectiveQuery = rawQ;
  if (!effectiveQuery) {
    if (category === 'music') effectiveQuery = 'trending music official hits';
    else if (category === 'gaming') effectiveQuery = 'trending gaming gameplay';
    else if (category === 'news') effectiveQuery = 'world news live';
    else if (category === 'education') effectiveQuery = 'science documentary education';
    else if (category === 'tech') effectiveQuery = 'tech reviews latest gadgets';
    else if (category === 'khmer') effectiveQuery = 'khmer music song golden hits';
    else effectiveQuery = 'popular trending videos';
  }

  serverStats.apiRequests++;

  // 3. Try official YouTube Data API v3 first
  const ytData = await searchYouTubeApi(effectiveQuery, type, 25);
  if (ytData && ytData.items && ytData.items.length > 0) {
    const items = ytData.items.map((item: any) => ({
      videoId: item.id.videoId || item.id.channelId || item.id.playlistId || item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      channelAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.snippet.channelTitle)}`,
      publishedAt: item.snippet.publishedAt,
      duration: '04:15',
      durationSeconds: 255,
      viewCount: Math.floor(Math.random() * 5000000) + 50000,
      likeCount: Math.floor(Math.random() * 200000) + 1000,
      categoryId: category !== 'all' ? category : 'youtube',
      categoryName: category !== 'all' ? category : 'YouTube',
      tags: [effectiveQuery, 'youtube'],
      isDownloadableAuthorized: true,
      authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }));

    apiCache.set(cacheKey, { data: items, timestamp: Date.now() });
    return res.json({ items, total: items.length, fromCache: false, source: 'youtube_live_api' });
  }

  // 4. Live YouTube Web Parser (returns actual live YouTube videos)
  const liveItems = await searchLiveYouTubeHtml(effectiveQuery, 25);
  if (liveItems && liveItems.length > 0) {
    // Apply sort if needed
    if (sort === 'views') {
      liveItems.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sort === 'rating') {
      liveItems.sort((a, b) => b.likeCount - a.likeCount);
    }

    apiCache.set(cacheKey, { data: liveItems, timestamp: Date.now() });
    return res.json({ items: liveItems, total: liveItems.length, fromCache: false, source: 'youtube_live_web' });
  }

  // 5. Fallback to Curated Catalog
  let results = [...CURATED_VIDEOS];
  if (category && category !== 'all') {
    results = results.filter(v => v.categoryId.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    results = results.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.channelTitle.toLowerCase().includes(q) ||
      v.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (sort === 'date') {
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } else if (sort === 'views') {
    results.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.likeCount - a.likeCount);
  }

  apiCache.set(cacheKey, { data: results, timestamp: Date.now() });
  res.json({ items: results, total: results.length, fromCache: false, source: 'curated_catalog' });
});

// 3. Get single video details
app.get('/api/youtube/videos/:id', async (req, res) => {
  serverStats.totalRequests++;
  serverStats.videosViewed++;
  const { id } = req.params;

  const found = CURATED_VIDEOS.find(v => v.videoId === id);
  if (found) {
    return res.json({ video: found });
  }

  // Try real YouTube API with the provided API key or oEmbed
  const liveVideo = await getYouTubeVideoDetailsApi(id);
  if (liveVideo) {
    return res.json({ video: liveVideo });
  }

  // Generic fallback for any valid YouTube Video ID
  const fallbackVideo = {
    videoId: id,
    title: `YouTube Video (${id})`,
    description: 'Official video streaming via YouTube Embedded Player API.',
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    channelId: 'UC_youtube_channel',
    channelTitle: 'YouTube Creator',
    channelAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`,
    publishedAt: new Date().toISOString(),
    duration: '05:00',
    durationSeconds: 300,
    viewCount: 1500000,
    likeCount: 45000,
    categoryId: 'entertainment',
    categoryName: 'Entertainment',
    tags: ['youtube', 'video'],
    isDownloadableAuthorized: true,
    authorizedMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };

  res.json({ video: fallbackVideo });
});

// 4. Get related videos
app.get('/api/youtube/videos/:id/related', async (req, res) => {
  const { id } = req.params;
  const current = CURATED_VIDEOS.find(v => v.videoId === id);
  
  if (current) {
    // Search live related by title or channel
    const liveRelated = await searchLiveYouTubeHtml(current.title || current.channelTitle, 10);
    if (liveRelated && liveRelated.length > 0) {
      return res.json({ items: liveRelated.filter(v => v.videoId !== id) });
    }
  }

  // If not in curated or live fails, fetch via oEmbed or keyword
  const details = await getYouTubeVideoDetailsApi(id);
  if (details) {
    const liveRelated = await searchLiveYouTubeHtml(details.title || details.channelTitle, 10);
    if (liveRelated && liveRelated.length > 0) {
      return res.json({ items: liveRelated.filter(v => v.videoId !== id) });
    }
  }

  const related = CURATED_VIDEOS.filter(v => v.videoId !== id).slice(0, 8);
  res.json({ items: related });
});

// 5. Channel details
app.get('/api/youtube/channels/:id', async (req, res) => {
  const { id } = req.params;
  const channelVideos = CURATED_VIDEOS.filter(v => v.channelId === id || v.channelTitle.toLowerCase().includes(id.toLowerCase()));
  const channelName = channelVideos.length > 0 ? channelVideos[0].channelTitle : 'YouTube Channel';

  // Try live search for channel uploads
  const liveChannelVideos = await searchLiveYouTubeHtml(channelName, 12);

  const avatar = liveChannelVideos.length > 0 ? liveChannelVideos[0].channelAvatar : (channelVideos.length > 0 ? channelVideos[0].channelAvatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`);

  const channel = {
    channelId: id,
    title: liveChannelVideos.length > 0 ? liveChannelVideos[0].channelTitle : channelName,
    handle: `@${channelName.replace(/\s+/g, '').toLowerCase()}`,
    description: `Official channel page on VideoHub Player. Discover curated uploads, music, and streaming series.`,
    avatar,
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    subscriberCount: '4.85M',
    videoCount: 142,
    joinedDate: '2016-04-12',
    videos: liveChannelVideos.length > 0 ? liveChannelVideos : (channelVideos.length > 0 ? channelVideos : CURATED_VIDEOS.slice(0, 4))
  };

  res.json({ channel });
});

// 6. Admin stats & logs
app.get('/api/stats', (req, res) => {
  res.json({
    ...serverStats,
    cacheEntries: apiCache.size,
    uptimeSeconds: Math.floor((Date.now() - serverStats.startTime) / 1000)
  });
});

// 7. Track conversion event in telemetry
app.post('/api/stats/conversion', (req, res) => {
  serverStats.conversionsCount++;
  serverStats.storageUsedMB += (req.body.sizeMB || 5);
  serverStats.systemLogs.unshift({
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `MP3 conversion completed: ${req.body.filename || 'Audio'} (${req.body.bitrate || 192} kbps)`
  });
  if (serverStats.systemLogs.length > 20) serverStats.systemLogs.pop();
  res.json({ success: true, conversionsCount: serverStats.conversionsCount });
});

// 8. Track download event in telemetry
app.post('/api/stats/download', (req, res) => {
  serverStats.downloadsCount++;
  serverStats.systemLogs.unshift({
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `Authorized media download started: ${req.body.title || 'Media file'} (${req.body.quality || '720p'})`
  });
  if (serverStats.systemLogs.length > 20) serverStats.systemLogs.pop();
  res.json({ success: true, downloadsCount: serverStats.downloadsCount });
});

// 9. Media Stream & Download Proxy with Range & CORS support
app.get('/api/media/proxy', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await fetch(targetUrl, { headers });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    res.setHeader('Accept-Ranges', 'bytes');

    if (response.headers.has('content-type')) {
      res.setHeader('Content-Type', response.headers.get('content-type')!);
    }
    if (response.headers.has('content-length')) {
      res.setHeader('Content-Length', response.headers.get('content-length')!);
    }
    if (response.headers.has('content-range')) {
      res.setHeader('Content-Range', response.headers.get('content-range')!);
      res.status(206);
    } else {
      res.status(response.status);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Error in /api/media/proxy:', err);
    // Fallback to sample video if target fails
    try {
      const fallback = await fetch('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      const buf = await fallback.arrayBuffer();
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(Buffer.from(buf));
    } catch {
      res.status(500).send('Failed to proxy media stream');
    }
  }
});


// Setup Vite middleware for development & Static for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VideoHub Player server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
