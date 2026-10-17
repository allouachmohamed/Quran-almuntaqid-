import React, { useState, useEffect, useCallback } from 'react';
import { Header, NavTab } from './components/Header';
import { SurahList } from './components/SurahList';
import { SurahReader } from './components/SurahReader';
import { PrayerTimesView } from './components/PrayerTimesView';
import { QiblaCompass } from './components/QiblaCompass';
import { OfflineLibraryModal } from './components/OfflineLibraryModal';
import { BookmarksView } from './components/BookmarksView';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import {
  Reciter,
  PrayerSettings,
  CityLocation,
  Bookmark,
  LastReadPosition,
  DailyPrayerTimes,
} from './types/quran';
import { RECITERS, ALL_SURAHS } from './data/quranData';
import { audioCacheService } from './services/audioCacheService';
import {
  getStoredPrayerSettings,
  saveStoredPrayerSettings,
  getStoredLocation,
  saveStoredLocation,
  calculatePrayerTimes,
} from './services/prayerService';
import { notificationService } from './services/notificationService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

const BOOKMARKS_STORAGE_KEY = 'alnur_bookmarks_v1';
const LAST_READ_STORAGE_KEY = 'alnur_last_read_v1';
const SELECTED_RECITER_KEY = 'alnur_reciter_v1';

export default function App() {
  const isOnline = useOnlineStatus();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('quran');
  const [activeSurahNumber, setActiveSurahNumber] = useState<number | null>(null);

  // Reciter Selection
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_RECITER_KEY);
      if (saved) {
        const found = RECITERS.find((r) => r.id === saved);
        if (found) return found;
      }
    } catch {}
    return RECITERS[0]; // Mishary Alafasy
  });

  // Audio Playback State
  const [currentPlayingSurah, setCurrentPlayingSurah] = useState<number | null>(null);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPlayerBar, setShowPlayerBar] = useState<boolean>(false);

  // Offline Audio Download State
  const [downloadingSurahId, setDownloadingSurahId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [offlineModalOpen, setOfflineModalOpen] = useState<boolean>(false);
  const [offlineCount, setOfflineCount] = useState<number>(() => {
    return audioCacheService.getOfflineRecords().length;
  });

  // Prayer Settings & Location State
  const [prayerSettings, setPrayerSettings] = useState<PrayerSettings>(getStoredPrayerSettings);
  const [location, setLocation] = useState<CityLocation>(getStoredLocation);

  // Bookmarks & Last Read State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const data = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [lastRead, setLastRead] = useState<LastReadPosition | null>(() => {
    try {
      const data = localStorage.getItem(LAST_READ_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  // Save reciter preference
  const handleReciterChange = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    try {
      localStorage.setItem(SELECTED_RECITER_KEY, reciter.id);
    } catch {}
  };

  // Start background daily prayer notification scheduler
  useEffect(() => {
    const getTimes = (): DailyPrayerTimes => {
      return calculatePrayerTimes(
        { latitude: location.latitude, longitude: location.longitude },
        new Date(),
        prayerSettings
      );
    };

    const getSettings = () => prayerSettings;

    notificationService.startPrayerScheduler(getTimes, getSettings, location.name);

    return () => {
      notificationService.stopPrayerScheduler();
    };
  }, [location, prayerSettings]);

  // Audio Handlers
  const handlePlaySurah = (surahNum: number) => {
    setCurrentPlayingSurah(surahNum);
    setCurrentPlayingAyah(null); // start from beginning continuous
    setIsPlaying(true);
    setShowPlayerBar(true);

    // Update last read position
    const meta = ALL_SURAHS.find((s) => s.number === surahNum);
    if (meta) {
      const readRecord: LastReadPosition = {
        surahNumber: surahNum,
        ayahNumber: 1,
        surahName: meta.name,
        englishName: meta.englishName,
        timestamp: Date.now(),
      };
      setLastRead(readRecord);
      try {
        localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(readRecord));
      } catch {}
    }
  };

  const handlePlayAyah = (surahNum: number, ayahNum: number) => {
    setCurrentPlayingSurah(surahNum);
    setCurrentPlayingAyah(ayahNum);
    setIsPlaying(true);
    setShowPlayerBar(true);

    const meta = ALL_SURAHS.find((s) => s.number === surahNum);
    if (meta) {
      const readRecord: LastReadPosition = {
        surahNumber: surahNum,
        ayahNumber: ayahNum,
        surahName: meta.name,
        englishName: meta.englishName,
        timestamp: Date.now(),
      };
      setLastRead(readRecord);
      try {
        localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(readRecord));
      } catch {}
    }
  };

  const handleNextAyah = () => {
    if (!currentPlayingSurah) return;
    const meta = ALL_SURAHS.find((s) => s.number === currentPlayingSurah);
    if (!meta) return;

    if (currentPlayingAyah === null) {
      setCurrentPlayingAyah(2);
    } else if (currentPlayingAyah < meta.numberOfAyahs) {
      setCurrentPlayingAyah(currentPlayingAyah + 1);
    } else {
      // Loop or pause
      setIsPlaying(false);
    }
  };

  const handlePrevAyah = () => {
    if (!currentPlayingSurah) return;
    if (currentPlayingAyah === null || currentPlayingAyah <= 1) {
      setCurrentPlayingAyah(1);
    } else {
      setCurrentPlayingAyah(currentPlayingAyah - 1);
    }
  };

  // Offline Audio Download Handler
  const handleDownloadSurah = async (surahNumber: number) => {
    const downloadKey = `${selectedReciter.id}_${surahNumber}`;
    setDownloadingSurahId(downloadKey);
    setDownloadProgress(0);

    try {
      const success = await audioCacheService.downloadSurah(
        surahNumber,
        selectedReciter.id,
        (pct) => {
          setDownloadProgress(pct);
        }
      );

      if (success) {
        setOfflineCount(audioCacheService.getOfflineRecords().length);
      }
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloadingSurahId(null);
      setDownloadProgress(0);
    }
  };

  const handleCancelDownload = (surahNumber: number) => {
    audioCacheService.cancelDownload(surahNumber, selectedReciter.id);
    setDownloadingSurahId(null);
    setDownloadProgress(0);
  };

  const handleStorageChanged = useCallback(() => {
    setOfflineCount(audioCacheService.getOfflineRecords().length);
  }, []);

  // Bookmarks Handlers
  const handleToggleBookmark = (
    surahNumber: number,
    ayahNumber: number,
    surahEnglishName: string,
    ayahText: string
  ) => {
    const existingIndex = bookmarks.findIndex(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );

    let updated: Bookmark[];
    if (existingIndex >= 0) {
      updated = bookmarks.filter((_, i) => i !== existingIndex);
    } else {
      const meta = ALL_SURAHS.find((s) => s.number === surahNumber);
      const newBookmark: Bookmark = {
        id: `${surahNumber}_${ayahNumber}_${Date.now()}`,
        surahNumber,
        ayahNumber,
        surahName: meta?.name || '',
        surahEnglishName,
        ayahText,
        createdAt: Date.now(),
      };
      updated = [newBookmark, ...bookmarks];
    }

    setBookmarks(updated);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleRemoveBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleOpenSurah = (surahNumber: number, ayahNumber?: number) => {
    setActiveSurahNumber(surahNumber);
    setActiveTab('quran');
    if (ayahNumber) {
      setCurrentPlayingAyah(ayahNumber);
    }

    const meta = ALL_SURAHS.find((s) => s.number === surahNumber);
    if (meta) {
      const readRecord: LastReadPosition = {
        surahNumber,
        ayahNumber: ayahNumber || 1,
        surahName: meta.name,
        englishName: meta.englishName,
        timestamp: Date.now(),
      };
      setLastRead(readRecord);
      try {
        localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(readRecord));
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#02120d] text-emerald-50 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950">
      {/* Primary Top Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'offline') {
            setOfflineModalOpen(true);
          }
        }}
        isPlayingAudio={isPlaying}
        onOpenPlayer={() => setShowPlayerBar(true)}
        offlineCount={offlineCount}
        onOpenOfflineManager={() => setOfflineModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quran Tab */}
        {activeTab === 'quran' && (
          <>
            {activeSurahNumber ? (
              <SurahReader
                surahNumber={activeSurahNumber}
                onBack={() => setActiveSurahNumber(null)}
                onNavigateSurah={(num) => setActiveSurahNumber(num)}
                selectedReciter={selectedReciter}
                onChangeReciter={handleReciterChange}
                currentPlayingSurah={currentPlayingSurah}
                currentPlayingAyah={currentPlayingAyah}
                isPlaying={isPlaying}
                onPlaySurah={handlePlaySurah}
                onPlayAyah={handlePlayAyah}
                onPause={() => setIsPlaying(false)}
                downloadingSurahId={downloadingSurahId}
                downloadProgress={downloadProgress}
                onDownloadSurah={handleDownloadSurah}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
              />
            ) : (
              <SurahList
                onSelectSurah={handleOpenSurah}
                onPlaySurah={handlePlaySurah}
                selectedReciter={selectedReciter}
                downloadingSurahId={downloadingSurahId}
                downloadProgress={downloadProgress}
                onDownloadSurah={handleDownloadSurah}
                onCancelDownload={handleCancelDownload}
              />
            )}
          </>
        )}

        {/* Prayer Times Tab */}
        {activeTab === 'prayer' && (
          <PrayerTimesView
            settings={prayerSettings}
            onUpdateSettings={setPrayerSettings}
            location={location}
            onUpdateLocation={setLocation}
            onNavigateToQibla={() => setActiveTab('qibla')}
          />
        )}

        {/* Qibla Direction Compass Tab */}
        {activeTab === 'qibla' && <QiblaCompass location={location} />}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onOpenSurahAtAyah={handleOpenSurah}
            onPlaySurah={handlePlaySurah}
            lastRead={lastRead}
          />
        )}
      </main>

      {/* Sticky Bottom Audio Player Bar */}
      {showPlayerBar && currentPlayingSurah && (
        <AudioPlayerBar
          surahNumber={currentPlayingSurah}
          ayahNumber={currentPlayingAyah}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onNextAyah={handleNextAyah}
          onPrevAyah={handlePrevAyah}
          selectedReciter={selectedReciter}
          onChangeReciter={handleReciterChange}
          onClose={() => {
            setIsPlaying(false);
            setShowPlayerBar(false);
          }}
        />
      )}

      {/* Offline Storage Manager Modal */}
      <OfflineLibraryModal
        isOpen={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
        selectedReciter={selectedReciter}
        onPlaySurah={handlePlaySurah}
        onDownloadSurah={handleDownloadSurah}
        downloadingSurahId={downloadingSurahId}
        downloadProgress={downloadProgress}
        onStorageChanged={handleStorageChanged}
      />

      {/* Non-intrusive offline connectivity notification */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/90 text-emerald-950 px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-md">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode — Cached Surahs & Downloaded Audio Active</span>
        </div>
      )}
    </div>
  );
}
