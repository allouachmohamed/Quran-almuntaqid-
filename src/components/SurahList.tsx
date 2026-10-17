import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Play,
  HardDriveDownload,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { SurahMetadata, Reciter } from '../types/quran';
import { ALL_SURAHS } from '../data/quranData';
import { audioCacheService } from '../services/audioCacheService';

interface SurahListProps {
  onSelectSurah: (surahNumber: number) => void;
  onPlaySurah: (surahNumber: number) => void;
  selectedReciter: Reciter;
  downloadingSurahId: string | null;
  downloadProgress: number;
  onDownloadSurah: (surahNumber: number) => void;
  onCancelDownload: (surahNumber: number) => void;
}

export const SurahList: React.FC<SurahListProps> = ({
  onSelectSurah,
  onPlaySurah,
  selectedReciter,
  downloadingSurahId,
  downloadProgress,
  onDownloadSurah,
  onCancelDownload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan' | 'downloaded'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');

  const cachedRecords = audioCacheService.getOfflineRecords();

  const filteredSurahs = useMemo(() => {
    return ALL_SURAHS.filter((surah) => {
      // Search matching
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        surah.name.includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.englishNameTranslation.toLowerCase().includes(query) ||
        String(surah.number) === query;

      if (!matchesSearch) return false;

      // Filter by type
      if (filterType === 'Meccan' && surah.revelationType !== 'Meccan') return false;
      if (filterType === 'Medinan' && surah.revelationType !== 'Medinan') return false;
      if (filterType === 'downloaded') {
        const isCached = cachedRecords.some(
          (r) => r.surahNumber === surah.number && r.reciterId === selectedReciter.id
        );
        if (!isCached) return false;
      }

      // Filter by Juz
      if (selectedJuz !== 'all' && surah.juz !== selectedJuz) return false;

      return true;
    });
  }, [searchQuery, filterType, selectedJuz, cachedRecords, selectedReciter.id]);

  return (
    <div className="space-y-8 pb-20">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 border border-emerald-900/60 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/quran_serene_hero_1792264226891.jpg"
            alt="The Holy Quran open on wooden rehal stand"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-emerald-950/60" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Al-Qur’an Al-Kareem</span>
            <span aria-hidden="true">·</span>
            <span>114 Chapters</span>
            <span aria-hidden="true">·</span>
            <span>Offline Audio Cache Available</span>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
            Read, Listen & Contemplate the Holy Quran
          </h1>

          <p className="mt-4 text-emerald-200/90 text-sm sm:text-base leading-relaxed">
            Immerse yourself in authentic Arabic calligraphy, clear English translations, and offline audio recitations by world-renowned Qaris.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectSurah(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-semibold text-xs sm:text-sm transition shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Begin with Al-Fatihah</span>
            </button>
            <button
              onClick={() => onPlaySurah(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white border border-emerald-700/60 font-medium text-xs sm:text-sm transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Listen Recitation</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Surah name (e.g. Al-Kahf, يس, 18)..."
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-950/60 border border-emerald-900 rounded-xl text-sm text-white placeholder-emerald-400/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Tabs (Interactive buttons) */}
          <div className="flex items-center gap-1.5 p-1 bg-emerald-950/80 border border-emerald-900/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-amber-400 text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              All (114)
            </button>
            <button
              onClick={() => setFilterType('Meccan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filterType === 'Meccan'
                  ? 'bg-amber-400 text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              Meccan (86)
            </button>
            <button
              onClick={() => setFilterType('Medinan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filterType === 'Medinan'
                  ? 'bg-amber-400 text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              Medinan (28)
            </button>
            <button
              onClick={() => setFilterType('downloaded')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filterType === 'downloaded'
                  ? 'bg-amber-400 text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>Offline ({cachedRecords.length})</span>
            </button>
          </div>
        </div>

        {/* Juz Quick Jump Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-emerald-300">
          <span className="shrink-0 font-medium text-emerald-400">Juz:</span>
          <button
            onClick={() => setSelectedJuz('all')}
            className={`px-2.5 py-1 rounded-md shrink-0 transition ${
              selectedJuz === 'all'
                ? 'bg-emerald-800 text-amber-300 font-semibold'
                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300'
            }`}
          >
            All
          </button>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
            <button
              key={juzNum}
              onClick={() => setSelectedJuz(juzNum)}
              className={`px-2.5 py-1 rounded-md shrink-0 font-mono transition ${
                selectedJuz === juzNum
                  ? 'bg-emerald-800 text-amber-300 font-semibold'
                  : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300'
              }`}
            >
              {juzNum}
            </button>
          ))}
        </div>
      </div>

      {/* Surahs Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-emerald-950/40 border border-emerald-900/50">
          <BookOpen className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Surahs found</h3>
          <p className="text-xs text-emerald-400 mt-1">
            Try adjusting your search terms or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setSelectedJuz('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 bg-emerald-900/60 rounded-lg border border-emerald-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => {
            const isCached = cachedRecords.some(
              (r) => r.surahNumber === surah.number && r.reciterId === selectedReciter.id
            );
            const downloadKey = `${selectedReciter.id}_${surah.number}`;
            const isDownloading = downloadingSurahId === downloadKey;

            return (
              <div
                key={surah.number}
                className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-emerald-950/50 border border-emerald-900/60 hover:border-amber-500/40 hover:bg-emerald-950/80 transition-all shadow-sm"
              >
                <div>
                  {/* Top Row: Number, English Name, Arabic Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center justify-center text-xs font-semibold font-mono text-amber-400 group-hover:border-amber-400/50 transition-colors">
                        {surah.number}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors leading-tight">
                          {surah.englishName}
                        </h3>
                        <p className="text-xs text-emerald-400/80 leading-snug">
                          {surah.englishNameTranslation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-2xl font-bold text-amber-400/95 leading-none block">
                        {surah.name}
                      </span>
                    </div>
                  </div>

                  {/* Clean unboxed metadata */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400/90 font-mono">
                    <span>{surah.revelationType}</span>
                    <span aria-hidden="true" className="text-emerald-700">·</span>
                    <span>{surah.numberOfAyahs} Verses</span>
                    <span aria-hidden="true" className="text-emerald-700">·</span>
                    <span>Juz {surah.juz}</span>
                  </div>

                  {/* Offline Download Progress Bar if currently active */}
                  {isDownloading && (
                    <div className="mt-3 p-2 bg-emerald-900/40 rounded-lg border border-emerald-800">
                      <div className="flex items-center justify-between text-[11px] text-amber-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Downloading audio...</span>
                        </span>
                        <span className="font-mono">{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelDownload(surah.number);
                        }}
                        className="mt-1.5 text-[10px] text-rose-300 hover:text-rose-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-emerald-900/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectSurah(surah.number)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </button>

                    <button
                      onClick={() => onPlaySurah(surah.number)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Listen</span>
                    </button>
                  </div>

                  {/* Offline Audio Caching Action */}
                  <div>
                    {isCached ? (
                      <div
                        title="Downloaded for offline listening"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-900/50 text-emerald-300 text-[11px] font-medium border border-emerald-800"
                      >
                        <Check className="w-3 h-3 text-amber-400" />
                        <span>Saved</span>
                      </div>
                    ) : (
                      <button
                        disabled={isDownloading}
                        onClick={() => onDownloadSurah(surah.number)}
                        title={`Download audio for offline listening (${selectedReciter.name})`}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:text-amber-300 hover:bg-emerald-900/60 rounded-md transition disabled:opacity-50"
                      >
                        <HardDriveDownload className="w-3.5 h-3.5" />
                        <span>Save Offline</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
