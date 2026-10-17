export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMetadata {
  number: number;
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
  revelationOrder: number;
  juz: number;
  page: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  transliteration?: string;
  audioUrl?: string;
  juz: number;
  page: number;
}

export interface SurahDetail extends SurahMetadata {
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  audioQuality: string;
  surahAudioUrlTemplate: (surahNumber: number) => string;
  ayahAudioUrlTemplate: (surahNumber: number, ayahNumber: number) => string;
}

export interface OfflineSurahRecord {
  surahNumber: number;
  reciterId: string;
  surahName: string;
  englishName: string;
  reciterName: string;
  sizeBytes: number;
  downloadedAt: number;
  cachedAyahsCount: number;
  totalAyahs: number;
}

export type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'NorthAmerica'
  | 'Egyptian'
  | 'UmmAlQura'
  | 'Karachi'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Singapore'
  | 'Tehran';

export type MadhabKey = 'shafi' | 'hanafi';

export interface PrayerSettings {
  method: CalculationMethodKey;
  madhab: MadhabKey;
  notificationsEnabled: boolean;
  notifyMinutesBefore: number; // 0 = at time, 10 = 10 mins before
  soundEnabled: boolean;
  adhanType: 'makkah' | 'madinah' | 'alafasy' | 'chime';
  enabledPrayers: {
    fajr: boolean;
    sunrise: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface DailyPrayerTimes {
  date: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  currentPrayer: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'none';
  nextPrayer: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  nextPrayerTime: Date;
  timeRemainingMs: number;
  progressPercent: number;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahText: string;
  createdAt: number;
  note?: string;
}

export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  englishName: string;
  timestamp: number;
}
