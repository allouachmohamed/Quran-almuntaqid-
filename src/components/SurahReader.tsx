import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  HardDriveDownload,
  Check,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Copy,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Loader2,
} from 'lucide-react';
import { SurahDetail, Reciter, Bookmark } from '../types/quran';
import { ALL_SURAHS, RECITERS } from '../data/quranData';
import { fetchSurahDetail } from '../services/quranApiService';
import { audioCacheService } from '../services/audioCacheService';

interface SurahReaderProps {
  surahNumber: number;
  onBack: () => void;
  onNavigateSurah: (number: number) => void;
  selectedReciter: Reciter;
  onChangeReciter: (reciter: Reciter) => void;
  currentPlayingSurah: number | null;
  currentPlayingAyah: number | null;
  isPlaying: boolean;
  onPlaySurah: (surahNumber: number) => void;
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
  onPause: () => void;
  downloadingSurahId: string | null;
  downloadProgress: number;
  onDownloadSurah: (surahNumber: number) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (surahNumber: number, ayahNumber: number, surahName: string, text: string) => void;
}

export const SurahReader: React.FC<SurahReaderProps> = ({
  surahNumber,
  onBack,
  onNavigateSurah,
  selectedReciter,
  onChangeReciter,
  currentPlayingSurah,
  currentPlayingAyah,
  isPlaying,
  onPlaySurah,
  onPlayAyah,
  onPause,
  downloadingSurahId,
  downloadProgress,
  onDownloadSurah,
  bookmarks,
  onToggleBookmark,
}) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg');
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const activeAyahRef = useRef<HTMLDivElement | null>(null);

  // Load surah data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchSurahDetail(surahNumber).then((data) => {
      if (isMounted) {
        setSurah(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [surahNumber]);

  // Auto-scroll to active playing ayah
  useEffect(() => {
    if (
      currentPlayingSurah === surahNumber &&
      currentPlayingAyah !== null &&
      activeAyahRef.current
    ) {
      activeAyahRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentPlayingSurah, currentPlayingAyah, surahNumber]);

  const isCached = audioCacheService.isSurahCached(surahNumber, selectedReciter.id);
  const downloadKey = `${selectedReciter.id}_${surahNumber}`;
  const isDownloading = downloadingSurahId === downloadKey;

  const copyAyah = (ayahNum: number, text: string, translation: string) => {
    const content = `${text}\n\n"${translation}"\n— Surah ${surah?.englishName} (${surahNumber}:${ayahNum})`;
    navigator.clipboard.writeText(content);
    setCopyFeedback(ayahNum);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'base':
        return 'text-2xl sm:text-3xl leading-[2.2]';
      case 'lg':
        return 'text-3xl sm:text-4xl leading-[2.4]';
      case 'xl':
        return 'text-4xl sm:text-5xl leading-[2.6]';
    }
  };

  if (loading || !surah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-emerald-300">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm">Loading Surah {surahNumber}...</p>
      </div>
    );
  }

  const isCurrentlyPlayingSurah = currentPlayingSurah === surahNumber && isPlaying;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Top Navigation & Surah Details Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-900 shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Surah List</span>
        </button>

        {/* Surah quick switcher */}
        <div className="flex items-center gap-2">
          <button
            disabled={surahNumber <= 1}
            onClick={() => onNavigateSurah(surahNumber - 1)}
            className="p-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 disabled:opacity-30 disabled:hover:bg-emerald-900/50 transition"
            title="Previous Surah"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-emerald-300 px-2">
            {surahNumber} / 114
          </span>

          <button
            disabled={surahNumber >= 114}
            onClick={() => onNavigateSurah(surahNumber + 1)}
            className="p-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 disabled:opacity-30 disabled:hover:bg-emerald-900/50 transition"
            title="Next Surah"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs font-medium transition"
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Preferences</span>
        </button>
      </div>

      {/* Surah Editorial Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950 border border-emerald-900 text-center relative overflow-hidden shadow-lg">
        <div className="max-w-md mx-auto space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-base mb-1">
            {surah.number}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Surah {surah.englishName}
          </h1>

          <p className="font-serif text-3xl sm:text-4xl text-amber-400/95 font-bold pt-1">
            {surah.name}
          </p>

          <p className="text-xs sm:text-sm text-emerald-300">
            {surah.englishNameTranslation}
          </p>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
            <span>{surah.revelationType}</span>
            <span aria-hidden="true">·</span>
            <span>{surah.numberOfAyahs} Verses</span>
            <span aria-hidden="true">·</span>
            <span>Juz {surah.juz}</span>
          </div>

          {/* Action Row: Listen / Download */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {isCurrentlyPlayingSurah ? (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-semibold text-xs transition"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Recitation</span>
              </button>
            ) : (
              <button
                onClick={() => onPlaySurah(surahNumber)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-semibold text-xs transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Full Surah</span>
              </button>
            )}

            {isCached ? (
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-800 text-xs font-medium">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Available Offline</span>
              </div>
            ) : isDownloading ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/60 text-amber-300 border border-emerald-800 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading {downloadProgress}%</span>
              </div>
            ) : (
              <button
                onClick={() => onDownloadSurah(surahNumber)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-700/80 text-xs font-medium transition"
              >
                <HardDriveDownload className="w-4 h-4 text-amber-400" />
                <span>Save Offline</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preferences Drawer / Control Bar */}
      {showSettingsDrawer && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-900/90 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Reciter Picker */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                Reciter (Qari)
              </label>
              <select
                value={selectedReciter.id}
                onChange={(e) => {
                  const rec = RECITERS.find((r) => r.id === e.target.value);
                  if (rec) onChangeReciter(rec);
                }}
                className="w-full bg-emerald-900 border border-emerald-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Arabic Script Size */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                Script Size
              </label>
              <div className="flex items-center gap-1">
                {(['base', 'lg', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                      fontSize === size
                        ? 'bg-amber-400 text-emerald-950 font-semibold'
                        : 'bg-emerald-900 text-emerald-200 hover:text-white'
                    }`}
                  >
                    {size === 'base' ? 'Regular' : size === 'lg' ? 'Large' : 'XL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Toggles */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                Reading Mode
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                    showTranslation
                      ? 'bg-emerald-800 text-white border border-emerald-700'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setShowTransliteration(!showTransliteration)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                    showTransliteration
                      ? 'bg-emerald-800 text-white border border-emerald-700'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                  }`}
                >
                  Phonetic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bismillah Header (Except Surah 9 At-Tawbah) */}
      {surahNumber !== 9 && (
        <div className="py-6 text-center">
          <span className="font-serif text-2xl sm:text-3xl text-amber-400/90 leading-relaxed block tracking-wide select-none">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>
          {showTranslation && (
            <p className="text-xs text-emerald-400/80 mt-1 italic">
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </p>
          )}
        </div>
      )}

      {/* Ayahs Container */}
      <div className="space-y-4">
        {surah.ayahs.map((ayah) => {
          const isAyahActive =
            currentPlayingSurah === surahNumber && currentPlayingAyah === ayah.numberInSurah;
          const isBookmarked = bookmarks.some(
            (b) => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
          );

          return (
            <div
              key={ayah.numberInSurah}
              ref={isAyahActive ? activeAyahRef : null}
              className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                isAyahActive
                  ? 'bg-emerald-900/60 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-emerald-950/40 border-emerald-900/70 hover:border-emerald-800'
              }`}
            >
              {/* Header with Ayah Number & Quick Actions */}
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-800 text-xs font-mono font-medium text-amber-400 flex items-center justify-center">
                    {ayah.numberInSurah}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    {surahNumber}:{ayah.numberInSurah}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-emerald-300">
                  {/* Play specific Ayah */}
                  <button
                    onClick={() => onPlayAyah(surahNumber, ayah.numberInSurah)}
                    title="Play recitation for this verse"
                    className={`p-1.5 rounded-lg hover:bg-emerald-900 transition ${
                      isAyahActive ? 'text-amber-400' : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={() =>
                      onToggleBookmark(
                        surahNumber,
                        ayah.numberInSurah,
                        surah.englishName,
                        ayah.text
                      )
                    }
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this verse'}
                    className={`p-1.5 rounded-lg hover:bg-emerald-900 transition ${
                      isBookmarked
                        ? 'text-amber-400'
                        : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <BookmarkIcon className="w-4 h-4" />
                    )}
                  </button>

                  {/* Copy verse */}
                  <button
                    onClick={() => copyAyah(ayah.numberInSurah, ayah.text, ayah.translation)}
                    title="Copy verse text and translation"
                    className="p-1.5 rounded-lg hover:bg-emerald-900 text-emerald-400 hover:text-white transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {copyFeedback === ayah.numberInSurah && (
                    <span className="text-[11px] text-amber-300 font-medium ml-1">
                      Copied!
                    </span>
                  )}
                </div>
              </div>

              {/* Arabic Verse Text */}
              <div
                dir="rtl"
                className={`font-serif text-right text-emerald-50 ${getFontSizeClass()} font-medium tracking-normal select-text`}
              >
                {ayah.text}
                <span className="inline-flex items-center justify-center mx-2 text-amber-400 text-lg font-serif">
                  ۝{ayah.numberInSurah}
                </span>
              </div>

              {/* Phonetic Transliteration */}
              {showTransliteration && ayah.transliteration && (
                <p className="mt-3 text-xs sm:text-sm text-emerald-300/80 italic font-sans leading-relaxed">
                  {ayah.transliteration}
                </p>
              )}

              {/* English Translation */}
              {showTranslation && (
                <p className="mt-3 text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-sans">
                  {ayah.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
