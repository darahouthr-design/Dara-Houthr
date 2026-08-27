import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MiniAudioPlayer } from './components/MiniAudioPlayer';
import { ToastContainer } from './components/Toast';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { ShareModal } from './components/ShareModal';
import { PlaylistModal } from './components/PlaylistModal';
import { AuthModal } from './components/AuthModal';

// Views
import { HomeView } from './views/HomeView';
import { PlayerView } from './views/PlayerView';
import { SearchView } from './views/SearchView';
import { ExploreView } from './views/ExploreView';
import { ChannelView } from './views/ChannelView';
import { PlaylistsView } from './views/PlaylistsView';
import { FavoritesView } from './views/FavoritesView';
import { HistoryView } from './views/HistoryView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { LibraryView } from './views/LibraryView';
import { DownloadsView } from './views/DownloadsView';
import { OfflinePlayerView } from './views/OfflinePlayerView';
import { ConverterView } from './views/ConverterView';
import { EqualizerView } from './views/EqualizerView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { AdminDashboardView } from './views/AdminDashboardView';

export const App: React.FC = () => {
  const { currentTab, theme } = useApp();

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView />;
      case 'player':
        return <PlayerView />;
      case 'search':
        return <SearchView />;
      case 'explore':
        return <ExploreView />;
      case 'channel':
        return <ChannelView />;
      case 'playlists':
        return <PlaylistsView />;
      case 'favorites':
        return <FavoritesView />;
      case 'history':
        return <HistoryView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'library':
        return <LibraryView />;
      case 'downloads':
        return <DownloadsView />;
      case 'offline-player':
        return <OfflinePlayerView />;
      case 'converter':
        return <ConverterView />;
      case 'equalizer':
        return <EqualizerView />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutView />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div
      id="videohub-root-layout"
      className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 selection:bg-red-500 selection:text-white"
    >
      {/* Top Application Header */}
      <Header />

      {/* Main Body Area */}
      <div className="flex-1 flex max-w-full">
        {/* Left Sidebar (Desktop / Tablet) */}
        <Sidebar />

        {/* Dynamic Main Content Canvas */}
        <main
          id="main-scrollable-content"
          className="flex-1 w-full max-w-full overflow-x-hidden px-3 sm:px-6 lg:px-8 py-5 sm:py-6"
        >
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Mini Audio Player for converted MP3s & authorized audio */}
      <MiniAudioPlayer />

      {/* Modals & Dialogs */}
      <VoiceSearchModal />
      <ShareModal />
      <PlaylistModal />
      <AuthModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default App;
