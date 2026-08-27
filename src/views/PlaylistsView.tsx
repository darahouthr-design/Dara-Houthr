import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Playlist } from '../types';
import { VideoCard } from '../components/VideoCard';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Lock,
  Globe,
  MoreVertical,
  Edit2,
  Share2,
  ArrowRight
} from 'lucide-react';

export const PlaylistsView: React.FC = () => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    playVideo,
    removeVideoFromPlaylist,
    t
  } = useApp();

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(playlists[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createPlaylist(title.trim(), description.trim(), isPublic);
    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const handlePlayAll = () => {
    if (selectedPlaylist && selectedPlaylist.videos.length > 0) {
      playVideo(selectedPlaylist.videos[0]);
    }
  };

  return (
    <div id="playlists-view-container" className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ListMusic className="w-6 h-6 text-red-500" />
            {t('navPlaylists')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Organize and queue your favorite YouTube videos and songs
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          {t('createPlaylist')}
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <ListMusic className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
            {t('emptyPlaylist')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Create custom playlists to group songs, documentaries, or study videos.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow"
          >
            Create First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Playlist selector cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Your Playlists ({playlists.length})
            </h3>
            {playlists.map(pl => {
              const isSelected = selectedPlaylist?.id === pl.id;

              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className={`group p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-zinc-800 border-slate-900 dark:border-zinc-700 shadow-md'
                      : 'bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 hover:border-red-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${
                        pl.coverGradient || 'from-indigo-600 to-rose-600'
                      } flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm`}
                    >
                      {pl.videos.length}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold truncate">{pl.title}</h4>
                      <p className="text-xs opacity-70 flex items-center gap-1.5 mt-0.5">
                        {pl.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {pl.videos.length} {t('videos')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deletePlaylist(pl.id);
                      if (selectedPlaylist?.id === pl.id) {
                        setSelectedPlaylist(playlists.filter(p => p.id !== pl.id)[0] || null);
                      }
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                    title={t('deletePlaylist')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Playlist Content */}
          {selectedPlaylist && (
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-bold tracking-widest text-red-400">
                      Playlist
                    </span>
                    <span className="text-xs opacity-70">•</span>
                    <span className="text-xs opacity-70 flex items-center gap-1">
                      {selectedPlaylist.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {selectedPlaylist.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold">{selectedPlaylist.title}</h2>
                  <p className="text-xs text-zinc-300 mt-1 max-w-md">
                    {selectedPlaylist.description || 'Custom user playlist.'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2">
                    {selectedPlaylist.videos.length} items • Created on{' '}
                    {new Date(selectedPlaylist.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={handlePlayAll}
                  disabled={selectedPlaylist.videos.length === 0}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition shrink-0"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {t('playAll')}
                </button>
              </div>

              {/* Videos in playlist */}
              {selectedPlaylist.videos.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                    No videos in this playlist yet.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click the "Save to Playlist" button on any video card to add it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPlaylist.videos.map((vid, idx) => (
                    <div
                      key={`${selectedPlaylist.id}-${vid.videoId}-${idx}`}
                      className="group flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500/50 transition"
                    >
                      <div
                        onClick={() => playVideo(vid)}
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                      >
                        <span className="w-6 text-center text-xs font-bold text-slate-400">
                          {idx + 1}
                        </span>
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-20 aspect-video rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-red-500 transition">
                            {vid.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {vid.channelTitle} • {vid.duration}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeVideoFromPlaylist(selectedPlaylist.id, vid.videoId)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('createPlaylist')}
            </h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('playlistTitle')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Favorite Khmer Beats"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('playlistDesc')}
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or mood description..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-check-public"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <label htmlFor="modal-check-public" className="text-xs text-slate-700 dark:text-zinc-300">
                  {t('playlistVisibility')}
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {t('savePlaylist')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
