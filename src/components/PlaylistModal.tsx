import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, ListPlus, Check, Lock, Globe } from 'lucide-react';

export const PlaylistModal: React.FC = () => {
  const {
    playlists,
    selectedVideoForPlaylist,
    setSelectedVideoForPlaylist,
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    t
  } = useApp();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  if (!selectedVideoForPlaylist) return null;

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createPlaylist(newTitle.trim(), newDesc.trim(), isPublic);
    // Add to the newest playlist when created
    setTimeout(() => {
      // Find the playlist and add
      setNewTitle('');
      setNewDesc('');
      setIsCreatingNew(false);
    }, 100);
  };

  return (
    <div
      id="playlist-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[85vh]">
        <button
          id="btn-close-playlist-modal"
          onClick={() => {
            setSelectedVideoForPlaylist(null);
            setIsCreatingNew(false);
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ListPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('addVideoToPlaylist')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[240px]">
              {selectedVideoForPlaylist.title}
            </p>
          </div>
        </div>

        {/* Existing Playlists list */}
        {!isCreatingNew ? (
          <>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4 max-h-60">
              {playlists.length === 0 ? (
                <p className="text-sm text-center py-6 text-slate-400">
                  {t('emptyPlaylist')}
                </p>
              ) : (
                playlists.map(pl => {
                  const isInPlaylist = pl.videos.some(
                    v => v.videoId === selectedVideoForPlaylist.videoId
                  );

                  return (
                    <button
                      key={pl.id}
                      onClick={() => {
                        if (isInPlaylist) {
                          removeVideoFromPlaylist(pl.id, selectedVideoForPlaylist.videoId);
                        } else {
                          addVideoToPlaylist(pl.id, selectedVideoForPlaylist);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition text-left ${
                        isInPlaylist
                          ? 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/80'
                          : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 dark:bg-zinc-800/60 dark:border-zinc-800 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                            pl.coverGradient || 'from-indigo-600 to-purple-600'
                          } flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                        >
                          {pl.videos.length}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">
                            {pl.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                            {pl.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {pl.videos.length} {t('videos')}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                          isInPlaylist
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              {t('createPlaylist')}
            </button>
          </>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {t('playlistTitle')} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Favorite Khmer Hits"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {t('playlistDesc')}
              </label>
              <textarea
                rows={2}
                placeholder="Add a brief description..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="check-public"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="check-public" className="text-xs text-slate-700 dark:text-zinc-300">
                {t('playlistVisibility')}
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition"
              >
                {t('savePlaylist')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
