import React from 'react';
import {
  Bookmark as BookmarkIcon,
  BookOpen,
  Trash2,
  Play,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Bookmark, LastReadPosition } from '../types/quran';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
  onOpenSurahAtAyah: (surahNumber: number, ayahNumber?: number) => void;
  onPlaySurah: (surahNumber: number) => void;
  lastRead: LastReadPosition | null;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onRemoveBookmark,
  onOpenSurahAtAyah,
  onPlaySurah,
  lastRead,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950 border border-emerald-900 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookmarkIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Bookmarks & Saved Verses
            </h2>
            <p className="text-xs text-emerald-300">
              Personal reflections and verses saved for contemplation
            </p>
          </div>
        </div>
      </div>

      {/* Last Read Position Card */}
      {lastRead && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900/80 to-emerald-950 border border-amber-500/30 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-mono font-bold text-base shrink-0">
              {lastRead.surahNumber}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Last Read Chapter</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Surah {lastRead.englishName} ({lastRead.surahName})
              </h3>
              <p className="text-xs text-emerald-300 font-mono mt-0.5">
                Verse {lastRead.ayahNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSurahAtAyah(lastRead.surahNumber, lastRead.ayahNumber)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-semibold shadow-sm transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resume Reading</span>
            </button>
            <button
              onClick={() => onPlaySurah(lastRead.surahNumber)}
              className="p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-white border border-emerald-700 text-xs transition"
              title="Listen to Surah"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* Saved Verses List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">
          Saved Verses ({bookmarks.length})
        </h3>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
            <BookmarkIcon className="w-10 h-10 text-emerald-700 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-white">No bookmarks yet</h4>
            <p className="text-xs text-emerald-400 mt-1 max-w-sm mx-auto">
              Tap the bookmark icon on any verse while reading to preserve it in your personal collection.
            </p>
          </div>
        ) : (
          bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-900 hover:border-emerald-800 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-900 text-amber-300 border border-emerald-800">
                    {bm.surahNumber}:{bm.ayahNumber}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Surah {bm.surahEnglishName}
                  </span>
                  <span className="text-xs text-emerald-400/80 font-serif">
                    {bm.surahName}
                  </span>
                </div>

                <p
                  dir="rtl"
                  className="font-serif text-lg text-emerald-100 text-right line-clamp-2"
                >
                  {bm.ayahText}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-mono pt-1">
                  <Clock className="w-3 h-3" />
                  <span>Saved {new Date(bm.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onOpenSurahAtAyah(bm.surahNumber, bm.ayahNumber)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white text-xs font-medium transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read</span>
                </button>

                <button
                  onClick={() => onRemoveBookmark(bm.id)}
                  className="p-1.5 rounded-lg bg-emerald-950 hover:bg-rose-950 text-emerald-400 hover:text-rose-300 transition"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
