import React, { useState } from 'react';
import {
  HardDriveDownload,
  Trash2,
  Play,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';
import { OfflineSurahRecord, Reciter } from '../types/quran';
import { ALL_SURAHS } from '../data/quranData';
import { audioCacheService } from '../services/audioCacheService';

interface OfflineLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReciter: Reciter;
  onPlaySurah: (surahNumber: number) => void;
  onDownloadSurah: (surahNumber: number) => void;
  downloadingSurahId: string | null;
  downloadProgress: number;
  onStorageChanged: () => void;
}

const POPULAR_SURAHS = [
  { number: 1, label: 'Al-Fatihah', note: 'The Opening' },
  { number: 18, label: 'Al-Kahf', note: 'Sunnah on Fridays' },
  { number: 36, label: 'Ya-Sin', note: 'Heart of the Quran' },
  { number: 55, label: 'Ar-Rahman', note: 'The Beneficent' },
  { number: 67, label: 'Al-Mulk', note: 'Protection at night' },
  { number: 112, label: 'Al-Ikhlas', note: 'The Sincerity' },
];

export const OfflineLibraryModal: React.FC<OfflineLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedReciter,
  onPlaySurah,
  onDownloadSurah,
  downloadingSurahId,
  downloadProgress,
  onStorageChanged,
}) => {
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const records = audioCacheService.getOfflineRecords();
  const totalSizeBytes = audioCacheService.getTotalOfflineSizeBytes();
  const formattedTotalSize = audioCacheService.formatBytes(totalSizeBytes);

  const handleDeleteRecord = async (surahNumber: number, reciterId: string) => {
    setDeletingId(`${reciterId}_${surahNumber}`);
    await audioCacheService.removeOfflineSurah(surahNumber, reciterId);
    setDeletingId(null);
    onStorageChanged();
  };

  const handleClearAll = async () => {
    await audioCacheService.clearAllOfflineAudio();
    setConfirmClearAll(false);
    onStorageChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-emerald-950 border border-emerald-800 p-6 sm:p-8 text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 hover:text-white transition"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HardDriveDownload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Offline Audio Library
            </h2>
            <p className="text-xs text-emerald-300">
              Manage downloaded recitations saved locally on your device
            </p>
          </div>
        </div>

        {/* Storage Summary Card */}
        <div className="mt-6 p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-mono block">
              Total Offline Storage Used
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {formattedTotalSize}
            </span>
            <span className="text-xs text-emerald-300 block mt-0.5">
              {records.length} {records.length === 1 ? 'Surah' : 'Surahs'} cached locally
            </span>
          </div>

          {records.length > 0 && (
            <div>
              {confirmClearAll ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 text-emerald-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-medium transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Storage</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Download Popular Chapters */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommended for Offline Reading</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {POPULAR_SURAHS.map((item) => {
              const isCached = records.some(
                (r) => r.surahNumber === item.number && r.reciterId === selectedReciter.id
              );
              const downloadKey = `${selectedReciter.id}_${item.number}`;
              const isDownloading = downloadingSurahId === downloadKey;

              return (
                <div
                  key={item.number}
                  className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-amber-400 font-semibold">
                        #{item.number}
                      </span>
                      {isCached && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-xs font-medium text-white block mt-1">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 block">
                      {item.note}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-emerald-900/60">
                    {isCached ? (
                      <button
                        onClick={() => {
                          onPlaySurah(item.number);
                          onClose();
                        }}
                        className="w-full py-1 text-[11px] font-medium text-emerald-300 hover:text-white bg-emerald-800/60 rounded flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>
                    ) : isDownloading ? (
                      <div className="w-full py-1 text-[11px] text-amber-300 text-center font-mono">
                        {downloadProgress}%
                      </div>
                    ) : (
                      <button
                        onClick={() => onDownloadSurah(item.number)}
                        className="w-full py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:bg-emerald-900 rounded flex items-center justify-center gap-1"
                      >
                        <HardDriveDownload className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* List of currently cached Surahs */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-emerald-300 mb-2">
            Downloaded Surahs ({records.length})
          </h3>

          {records.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-emerald-900/20 border border-emerald-900 text-xs text-emerald-400">
              No audio files downloaded yet. Download Surahs to listen offline without internet connection.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {records.map((rec) => {
                const isDeleting = deletingId === `${rec.reciterId}_${rec.surahNumber}`;

                return (
                  <div
                    key={`${rec.reciterId}_${rec.surahNumber}`}
                    className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-950 font-mono font-semibold text-amber-400 flex items-center justify-center text-[11px]">
                        {rec.surahNumber}
                      </span>
                      <div>
                        <div className="font-semibold text-white">
                          Surah {rec.englishName} ({rec.surahName})
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono">
                          {rec.reciterName} · {audioCacheService.formatBytes(rec.sizeBytes)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onPlaySurah(rec.surahNumber);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white transition"
                        title="Play"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        disabled={isDeleting}
                        onClick={() => handleDeleteRecord(rec.surahNumber, rec.reciterId)}
                        className="p-1.5 rounded-lg bg-emerald-950 hover:bg-rose-950 text-emerald-400 hover:text-rose-300 transition"
                        title="Delete from offline storage"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
