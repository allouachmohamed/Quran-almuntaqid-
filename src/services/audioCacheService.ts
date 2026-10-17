import { OfflineSurahRecord, Reciter } from '../types/quran';
import { ALL_SURAHS, RECITERS } from '../data/quranData';

const CACHE_NAME = 'quran-audio-v1';
const METADATA_STORAGE_KEY = 'quran_offline_records_v1';

class AudioCacheService {
  private activeDownloads: Map<string, AbortController> = new Map();

  private isCacheSupported(): boolean {
    return typeof window !== 'undefined' && 'caches' in window;
  }

  public getOfflineRecords(): OfflineSurahRecord[] {
    try {
      const data = localStorage.getItem(METADATA_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveOfflineRecords(records: OfflineSurahRecord[]): void {
    try {
      localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save offline records to localStorage:', e);
    }
  }

  public isSurahCached(surahNumber: number, reciterId: string): boolean {
    const records = this.getOfflineRecords();
    return records.some((r) => r.surahNumber === surahNumber && r.reciterId === reciterId);
  }

  public getSurahOfflineRecord(surahNumber: number, reciterId: string): OfflineSurahRecord | undefined {
    const records = this.getOfflineRecords();
    return records.find((r) => r.surahNumber === surahNumber && r.reciterId === reciterId);
  }

  /**
   * Resolves audio URL: if cached in Cache Storage API, returns an offline object URL;
   * otherwise returns original remote URL.
   */
  public async getPlayableAudioUrl(url: string): Promise<{ url: string; isOffline: boolean }> {
    if (!this.isCacheSupported()) {
      return { url, isOffline: false };
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        const blob = await match.blob();
        return { url: URL.createObjectURL(blob), isOffline: true };
      }
    } catch (e) {
      console.warn('Cache lookup error, falling back to remote stream:', e);
    }

    return { url, isOffline: false };
  }

  /**
   * Downloads Surah audio for offline playback with progress feedback
   */
  public async downloadSurah(
    surahNumber: number,
    reciterId: string,
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<boolean> {
    if (!this.isCacheSupported()) {
      throw new Error('Cache Storage API is not supported in this browser.');
    }

    const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
    const surahMeta = ALL_SURAHS.find((s) => s.number === surahNumber);
    if (!surahMeta) throw new Error(`Surah ${surahNumber} not found.`);

    const downloadKey = `${reciter.id}_${surahNumber}`;
    if (this.activeDownloads.has(downloadKey)) {
      console.warn('Download already in progress for', downloadKey);
      return false;
    }

    const abortController = new AbortController();
    this.activeDownloads.set(downloadKey, abortController);

    try {
      const cache = await caches.open(CACHE_NAME);
      const audioUrl = reciter.surahAudioUrlTemplate(surahNumber);

      const response = await fetch(audioUrl, {
        signal: abortController.signal,
        headers: { Accept: 'audio/mpeg, audio/*; q=0.9, */*; q=0.1' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      let loadedBytes = 0;

      if (!response.body) {
        // Fallback for browsers with no stream support
        const blob = await response.blob();
        const cachedResponse = new Response(blob, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': blob.size.toString(),
          },
        });
        await cache.put(audioUrl, cachedResponse);
        loadedBytes = blob.size;
      } else {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            loadedBytes += value.length;

            if (totalBytes > 0 && onProgress) {
              const pct = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
              onProgress(pct, loadedBytes, totalBytes);
            }
          }
        }

        const combinedBlob = new Blob(chunks as unknown as BlobPart[], { type: 'audio/mpeg' });
        const finalResponse = new Response(combinedBlob, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': combinedBlob.size.toString(),
          },
        });

        await cache.put(audioUrl, finalResponse);
      }

      // Record metadata
      const records = this.getOfflineRecords().filter(
        (r) => !(r.surahNumber === surahNumber && r.reciterId === reciter.id)
      );

      records.push({
        surahNumber,
        reciterId: reciter.id,
        surahName: surahMeta.name,
        englishName: surahMeta.englishName,
        reciterName: reciter.name,
        sizeBytes: loadedBytes,
        downloadedAt: Date.now(),
        cachedAyahsCount: surahMeta.numberOfAyahs,
        totalAyahs: surahMeta.numberOfAyahs,
      });

      this.saveOfflineRecords(records);
      if (onProgress) onProgress(100, loadedBytes, loadedBytes);
      return true;
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        console.log('Download aborted by user:', downloadKey);
      } else {
        console.error('Failed to download surah audio:', err);
        throw err;
      }
      return false;
    } finally {
      this.activeDownloads.delete(downloadKey);
    }
  }

  public cancelDownload(surahNumber: number, reciterId: string): void {
    const downloadKey = `${reciterId}_${surahNumber}`;
    const controller = this.activeDownloads.get(downloadKey);
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(downloadKey);
    }
  }

  public isDownloading(surahNumber: number, reciterId: string): boolean {
    return this.activeDownloads.has(`${reciterId}_${surahNumber}`);
  }

  public async removeOfflineSurah(surahNumber: number, reciterId: string): Promise<boolean> {
    const reciter = RECITERS.find((r) => r.id === reciterId);
    if (!reciter) return false;

    try {
      if (this.isCacheSupported()) {
        const cache = await caches.open(CACHE_NAME);
        const audioUrl = reciter.surahAudioUrlTemplate(surahNumber);
        await cache.delete(audioUrl);
      }

      const records = this.getOfflineRecords().filter(
        (r) => !(r.surahNumber === surahNumber && r.reciterId === reciterId)
      );
      this.saveOfflineRecords(records);
      return true;
    } catch (e) {
      console.error('Error removing offline surah:', e);
      return false;
    }
  }

  public async clearAllOfflineAudio(): Promise<boolean> {
    try {
      if (this.isCacheSupported()) {
        await caches.delete(CACHE_NAME);
      }
      this.saveOfflineRecords([]);
      return true;
    } catch (e) {
      console.error('Error clearing offline audio:', e);
      return false;
    }
  }

  public getTotalOfflineSizeBytes(): number {
    const records = this.getOfflineRecords();
    return records.reduce((sum, r) => sum + (r.sizeBytes || 0), 0);
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export const audioCacheService = new AudioCacheService();
