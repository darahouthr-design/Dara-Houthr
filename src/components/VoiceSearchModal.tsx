import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, X, Volume2 } from 'lucide-react';

export const VoiceSearchModal: React.FC = () => {
  const { isVoiceSearchOpen, setIsVoiceSearchOpen, setSearchQuery, setCurrentTab, addSearchHistory, t, language } = useApp();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isVoiceSearchOpen) {
      setTranscript('');
      setIsListening(false);
      setErrorNotice(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorNotice('Voice recognition is not supported in this browser. You can type keywords below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'km' ? 'km-KH' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorNotice(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);

        if (event.results[current].isFinal) {
          setTimeout(() => {
            handlePerformVoiceSearch(resultTranscript);
          }, 800);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setErrorNotice(`Voice input error: ${event.error}. You may enter query directly.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      return () => {
        try {
          recognition.abort();
        } catch {}
      };
    } catch (err) {
      setErrorNotice('Could not start microphone. Please check browser permissions.');
    }
  }, [isVoiceSearchOpen, language]);

  const handlePerformVoiceSearch = (queryText: string) => {
    if (!queryText.trim()) return;
    setSearchQuery(queryText.trim());
    addSearchHistory(queryText.trim());
    setIsVoiceSearchOpen(false);
    setCurrentTab('search');
  };

  if (!isVoiceSearchOpen) return null;

  return (
    <div
      id="voice-search-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
        <button
          id="btn-close-voice-modal"
          onClick={() => setIsVoiceSearchOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t('voiceSearch')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-8">
          {isListening ? t('voiceListening') : 'Tap microphone or enter query'}
        </p>

        <div className="relative mb-6">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          )}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl shadow-red-500/30 scale-105'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200'
            }`}
          >
            <Mic className="w-10 h-10" />
          </div>
        </div>

        <div className="w-full min-h-[48px] flex items-center justify-center px-4 py-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl mb-4">
          <p className="text-base font-medium text-slate-800 dark:text-zinc-200 italic">
            {transcript ? `"${transcript}"` : isListening ? '...' : 'Say a video title, artist, or topic'}
          </p>
        </div>

        {errorNotice && (
          <p className="text-xs text-amber-500 dark:text-amber-400 mb-4 px-2">
            {errorNotice}
          </p>
        )}

        <div className="w-full flex gap-2">
          <input
            type="text"
            placeholder="Or type here..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePerformVoiceSearch(transcript)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => handlePerformVoiceSearch(transcript)}
            disabled={!transcript.trim()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};
