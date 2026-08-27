import React from 'react';
import { useApp } from '../context/AppContext';
import { Info, ShieldCheck, Film, ExternalLink, Sparkles, Heart, FileCode } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { t } = useApp();

  return (
    <div id="about-view-container" className="space-y-8 pb-20 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Brand Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-zinc-900 to-red-950 text-white shadow-xl text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-red-500/30">
          <Film className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">VideoHub Player</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Version 1.0.0 • Professional YouTube-Powered Media Suite
        </p>
        <p className="text-xs sm:text-sm text-zinc-300 mt-3 max-w-lg leading-relaxed">
          High-performance online video player and authorized media manager designed with modern streaming UX, multi-lingual Khmer/English localization, and client-side audio conversion.
        </p>
      </div>

      {/* Compliance & Policy Safeguards */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          {t('aboutComplianceTitle')}
        </h3>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">
              1. Official YouTube Embedded Player
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              All online video playback is powered strictly through YouTube's official iframe player
              API (`youtube-nocookie.com/embed`), respecting all content ownership rights, creator
              ad distribution, view tracking, and embedded playback guidelines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">
              2. Authorized Offline & Conversion System
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Offline downloads and MP3 conversion capabilities are strictly restricted to
              user-supplied local files or explicitly authorized creative media. The app does not
              bypass YouTube DRM, authentication controls, or stream encryption mechanisms.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">
              3. YouTube API Services Terms
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              By using this application, you acknowledge compliance with the{' '}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                YouTube Terms of Service <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                Google Privacy Policy <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack & Credits */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-500" />
          Technology Stack
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
            <p className="font-bold text-slate-800 dark:text-zinc-200">Frontend</p>
            <p className="text-slate-400 mt-0.5">React 18 + TypeScript</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
            <p className="font-bold text-slate-800 dark:text-zinc-200">Styling</p>
            <p className="text-slate-400 mt-0.5">Tailwind CSS</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
            <p className="font-bold text-slate-800 dark:text-zinc-200">Audio DSP</p>
            <p className="text-slate-400 mt-0.5">Web Audio API + Lamejs</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
            <p className="font-bold text-slate-800 dark:text-zinc-200">Backend Proxy</p>
            <p className="text-slate-400 mt-0.5">Express + Node.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};
