import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Compass,
  HardDriveDownload,
  Bookmark as BookmarkIcon,
  Download,
  WifiOff,
  Volume2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export type NavTab = 'quran' | 'prayer' | 'qibla' | 'offline' | 'bookmarks';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isPlayingAudio: boolean;
  onOpenPlayer?: () => void;
  offlineCount: number;
  onOpenOfflineManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isPlayingAudio,
  onOpenPlayer,
  offlineCount,
  onOpenOfflineManager,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-900/60 text-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
            {/* Zone 1: Wordmark */}
            <button
              onClick={() => onSelectTab('quran')}
              className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
                <span className="font-serif text-lg leading-none select-none">☪</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-semibold tracking-tight text-white whitespace-nowrap">
                  Al-Nur Quran
                </span>
                <span className="text-[11px] text-emerald-300/80 -mt-0.5 tracking-wide hidden sm:inline">
                  القرآن الكريم وأوقات الصلاة
                </span>
              </div>
            </button>

            {/* Zone 2: Navigation Links (Single-line unboxed text with hover underline) */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
              <button
                onClick={() => onSelectTab('quran')}
                className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === 'quran'
                    ? 'text-amber-400 border-amber-400'
                    : 'text-emerald-200/80 hover:text-white border-transparent'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>The Holy Quran</span>
              </button>

              <button
                onClick={() => onSelectTab('prayer')}
                className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === 'prayer'
                    ? 'text-amber-400 border-amber-400'
                    : 'text-emerald-200/80 hover:text-white border-transparent'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Prayer Times</span>
              </button>

              <button
                onClick={() => onSelectTab('qibla')}
                className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === 'qibla'
                    ? 'text-amber-400 border-amber-400'
                    : 'text-emerald-200/80 hover:text-white border-transparent'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Qibla</span>
              </button>

              <button
                onClick={() => onSelectTab('offline')}
                className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === 'offline'
                    ? 'text-amber-400 border-amber-400'
                    : 'text-emerald-200/80 hover:text-white border-transparent'
                }`}
              >
                <HardDriveDownload className="w-4 h-4" />
                <span>Offline Audio</span>
                {offlineCount > 0 && (
                  <span className="text-xs bg-emerald-800/80 text-emerald-200 px-1.5 py-0.2 rounded-md font-mono">
                    {offlineCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('bookmarks')}
                className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === 'bookmarks'
                    ? 'text-amber-400 border-amber-400'
                    : 'text-emerald-200/80 hover:text-white border-transparent'
                }`}
              >
                <BookmarkIcon className="w-4 h-4" />
                <span>Bookmarks</span>
              </button>
            </nav>

            {/* Zone 3: Primary Action */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {!isOnline && (
                <div
                  title="Offline mode active — using cached Quran text & downloaded audio"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30"
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </div>
              )}

              {isPlayingAudio && onOpenPlayer && (
                <button
                  onClick={onOpenPlayer}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-medium transition"
                  title="Open Audio Player"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="hidden sm:inline">Playing</span>
                </button>
              )}

              {/* Install PWA Button if available */}
              {!isInstalled && isInstallable && (
                <button
                  onClick={install}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}

              {!isInstalled && isIOS && (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-200 border border-emerald-800 rounded-lg hover:bg-emerald-900 transition whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install</span>
                </button>
              )}

              <button
                onClick={onOpenOfflineManager}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg transition whitespace-nowrap shrink-0"
              >
                <HardDriveDownload className="w-3.5 h-3.5 text-amber-400" />
                <span>Storage</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-emerald-900/70 bg-emerald-950 px-2 py-2">
          <button
            onClick={() => onSelectTab('quran')}
            className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition ${
              activeTab === 'quran' ? 'text-amber-400' : 'text-emerald-300/70 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Quran</span>
          </button>
          <button
            onClick={() => onSelectTab('prayer')}
            className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition ${
              activeTab === 'prayer' ? 'text-amber-400' : 'text-emerald-300/70 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span>Prayers</span>
          </button>
          <button
            onClick={() => onSelectTab('qibla')}
            className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition ${
              activeTab === 'qibla' ? 'text-amber-400' : 'text-emerald-300/70 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span>Qibla</span>
          </button>
          <button
            onClick={() => onSelectTab('offline')}
            className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition ${
              activeTab === 'offline' ? 'text-amber-400' : 'text-emerald-300/70 hover:text-white'
            }`}
          >
            <HardDriveDownload className="w-4 h-4 mb-0.5" />
            <span>Offline</span>
          </button>
          <button
            onClick={() => onSelectTab('bookmarks')}
            className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition ${
              activeTab === 'bookmarks' ? 'text-amber-400' : 'text-emerald-300/70 hover:text-white'
            }`}
          >
            <BookmarkIcon className="w-4 h-4 mb-0.5" />
            <span>Saved</span>
          </button>
        </div>
      </header>

      {/* iOS Safari Guided Install Sheet */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-emerald-950 border border-emerald-800 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-semibold text-amber-400">Install on iPhone / iPad</h3>
            <p className="mt-2 text-sm text-emerald-200/90 leading-relaxed">
              To install <strong>Al-Nur Quran</strong> for full offline reading and audio recitation:
            </p>
            <ol className="mt-3 space-y-2 text-xs text-emerald-100 list-decimal list-inside bg-emerald-900/50 p-3 rounded-lg border border-emerald-800">
              <li>Tap the <strong>Share</strong> icon in the Safari bottom bar.</li>
              <li>Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right corner.</li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-emerald-950 hover:bg-amber-300 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
