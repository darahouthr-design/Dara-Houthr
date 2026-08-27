import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, Share2, Globe, ExternalLink, Code } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { shareVideoTarget, setShareVideoTarget, t, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!shareVideoTarget) return null;

  const videoUrl = `https://www.youtube.com/watch?v=${shareVideoTarget.videoId}`;
  const embedCode = `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${shareVideoTarget.videoId}" title="${shareVideoTarget.title.replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  const copyToClipboard = (text: string, isEmbed = false) => {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
      showToast('Embed code copied to clipboard!', 'success');
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast(t('copiedLink'), 'success');
    }
  };

  return (
    <div
      id="share-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <button
          id="btn-close-share"
          onClick={() => setShareVideoTarget(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('share')} Video
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-sm">
              {shareVideoTarget.title}
            </p>
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
            YouTube Link
          </label>
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700">
            <Globe className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
            <input
              type="text"
              readOnly
              value={videoUrl}
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-zinc-200 focus:outline-none truncate"
            />
            <button
              onClick={() => copyToClipboard(videoUrl)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : t('copyLink')}
            </button>
          </div>
        </div>

        {/* Embed Code */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
            Official Embed Code (HTML)
          </label>
          <div className="relative p-2.5 bg-slate-900 text-zinc-300 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
            <p className="line-clamp-2">{embedCode}</p>
            <button
              onClick={() => copyToClipboard(embedCode, true)}
              className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-sans"
            >
              <Code className="w-3.5 h-3.5" />
              {copiedEmbed ? 'Embed Copied!' : 'Copy Embed Code'}
            </button>
          </div>
        </div>

        {/* Direct Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs text-slate-500">
          <span>YouTube API Compliant Link</span>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-red-600 hover:underline font-medium"
          >
            {t('watchOnYouTube')} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
