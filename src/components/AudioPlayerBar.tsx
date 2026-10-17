import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  CheckCircle2,
  Wifi,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Reciter } from '../types/quran';
import { ALL_SURAHS, RECITERS } from '../data/quranData';
import { audioCacheService } from '../services/audioCacheService';

interface AudioPlayerBarProps {
  surahNumber: number;
  ayahNumber: number | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  selectedReciter: Reciter;
  onChangeReciter: (reciter: Reciter) => void;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  surahNumber,
  ayahNumber,
  isPlaying,
  onPlay,
  onPause,
  onNextAyah,
  onPrevAyah,
  selectedReciter,
  onChangeReciter,
  onClose,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'ayah' | 'surah'>('none');
  const [isOfflineSource, setIsOfflineSource] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const surahMeta = ALL_SURAHS.find((s) => s.number === surahNumber);

  // Determine audio URL based on whether we are playing full Surah or single Ayah
  const rawAudioUrl =
    ayahNumber !== null
      ? selectedReciter.ayahAudioUrlTemplate(surahNumber, ayahNumber)
      : selectedReciter.surahAudioUrlTemplate(surahNumber);

  // Resolve audio source (checking cache first)
  useEffect(() => {
    let isCurrent = true;

    audioCacheService.getPlayableAudioUrl(rawAudioUrl).then(({ url, isOffline }) => {
      if (isCurrent && audioRef.current) {
        setIsOfflineSource(isOffline);
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackSpeed;
        if (isPlaying) {
          audioRef.current.play().catch((e) => console.warn('Audio playback error:', e));
        }
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [rawAudioUrl, playbackSpeed, isPlaying]);

  // Handle play/pause toggles from outside
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((e) => console.warn('Audio play trigger error:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'ayah') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (ayahNumber !== null) {
      // Progress to next ayah
      if (surahMeta && ayahNumber < surahMeta.numberOfAyahs) {
        onNextAyah();
      } else if (repeatMode === 'surah') {
        onNextAyah(); // loop back
      } else {
        onPause();
      }
    } else {
      if (repeatMode === 'surah') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else {
        onPause();
      }
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
        onError={(e) => console.warn('Audio tag error:', e)}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800/80 shadow-2xl text-white transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Header Row when minimized or standard */}
          <div className="flex items-center justify-between gap-4">
            {/* Left Zone: Surah & Reciter Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-semibold text-xs shrink-0">
                {surahNumber}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white truncate leading-tight">
                    Surah {surahMeta?.englishName}
                  </h4>
                  {ayahNumber !== null && (
                    <span className="text-xs text-amber-300 font-mono shrink-0">
                      v.{ayahNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-300/80 font-mono truncate">
                  <span className="truncate">{selectedReciter.name}</span>
                  <span aria-hidden="true">·</span>
                  {isOfflineSource ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Offline Storage
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-300/80">
                      <Wifi className="w-3 h-3" />
                      Streaming
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                onClick={onPrevAyah}
                className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition"
                title="Previous Ayah"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, currentTime - 5);
                  }
                }}
                className="hidden sm:inline-flex p-2 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition"
                title="Rewind 5s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={isPlaying ? onPause : onPlay}
                className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 flex items-center justify-center shadow-md transition"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNextAyah}
                className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition"
                title="Next Ayah"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right Zone: Secondary Controls */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Playback Speed */}
              <button
                onClick={cycleSpeed}
                className="px-2 py-1 text-xs font-mono font-medium text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-900 rounded-md border border-emerald-800 transition"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Repeat Mode */}
              <button
                onClick={() => {
                  if (repeatMode === 'none') setRepeatMode('ayah');
                  else if (repeatMode === 'ayah') setRepeatMode('surah');
                  else setRepeatMode('none');
                }}
                className={`p-1.5 rounded-lg transition ${
                  repeatMode !== 'none'
                    ? 'text-amber-400 bg-emerald-900'
                    : 'text-emerald-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Mute */}
              <button
                onClick={toggleMute}
                className="hidden sm:inline-flex p-1.5 text-emerald-300 hover:text-white rounded-lg transition"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Reciter quick selector */}
              <select
                value={selectedReciter.id}
                onChange={(e) => {
                  const rec = RECITERS.find((r) => r.id === e.target.value);
                  if (rec) onChangeReciter(rec);
                }}
                className="hidden lg:inline-block bg-emerald-900 border border-emerald-800 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Minimize / Expand */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg transition"
                title={isMinimized ? 'Expand' : 'Collapse'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="text-xs text-emerald-400 hover:text-rose-300 px-2 py-1 rounded-md transition"
                title="Close Player"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Time Scrubber (Expanded view) */}
          {!isMinimized && (
            <div className="mt-2 pt-2 border-t border-emerald-900/60 flex items-center gap-3">
              <span className="text-[11px] font-mono text-emerald-300 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
              />
              <span className="text-[11px] font-mono text-emerald-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
