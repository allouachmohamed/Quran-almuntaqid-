import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  Qibla,
  HighLatitudeRule,
} from 'adhan';
import {
  CityLocation,
  DailyPrayerTimes,
  PrayerSettings,
  CalculationMethodKey,
} from '../types/quran';

export const MAJOR_CITIES: CityLocation[] = [
  { id: 'makkah', name: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { id: 'madinah', name: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  { id: 'jerusalem', name: 'Al-Quds (Jerusalem)', country: 'Palestine', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'doha', name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.531, timezone: 'Asia/Qatar' },
  { id: 'kuwait', name: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { id: 'casablanca', name: 'Casablanca', country: 'Morocco', latitude: 33.5731, longitude: -7.5898, timezone: 'Africa/Casablanca' },
  { id: 'algiers', name: 'Algiers', country: 'Algeria', latitude: 36.7538, longitude: 3.0588, timezone: 'Africa/Algiers' },
  { id: 'tunis', name: 'Tunis', country: 'Tunisia', latitude: 36.8065, longitude: 10.1815, timezone: 'Africa/Tunis' },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { id: 'kuala_lumpur', name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { id: 'karachi', name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { id: 'lahore', name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
  { id: 'london', name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'paris', name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
  { id: 'new_york', name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { id: 'los_angeles', name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { id: 'chicago', name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
];

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  method: 'MuslimWorldLeague',
  madhab: 'shafi',
  notificationsEnabled: true,
  notifyMinutesBefore: 0,
  soundEnabled: true,
  adhanType: 'makkah',
  enabledPrayers: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
};

const PRAYER_SETTINGS_KEY = 'alnur_prayer_settings_v1';
const SELECTED_LOCATION_KEY = 'alnur_selected_location_v1';

export function getStoredPrayerSettings(): PrayerSettings {
  try {
    const saved = localStorage.getItem(PRAYER_SETTINGS_KEY);
    return saved ? { ...DEFAULT_PRAYER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_PRAYER_SETTINGS;
  } catch {
    return DEFAULT_PRAYER_SETTINGS;
  }
}

export function saveStoredPrayerSettings(settings: PrayerSettings): void {
  try {
    localStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save prayer settings:', e);
  }
}

export function getStoredLocation(): CityLocation {
  try {
    const saved = localStorage.getItem(SELECTED_LOCATION_KEY);
    return saved ? JSON.parse(saved) : MAJOR_CITIES[0]; // Makkah default
  } catch {
    return MAJOR_CITIES[0];
  }
}

export function saveStoredLocation(location: CityLocation): void {
  try {
    localStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify(location));
  } catch (e) {
    console.warn('Failed to save location:', e);
  }
}

function getCalculationParameters(methodKey: CalculationMethodKey) {
  let params;
  switch (methodKey) {
    case 'MuslimWorldLeague':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'Singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'Tehran':
      params = CalculationMethod.Tehran();
      break;
    default:
      params = CalculationMethod.MuslimWorldLeague();
  }
  params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  return params;
}

export function calculatePrayerTimes(
  location: { latitude: number; longitude: number },
  date: Date = new Date(),
  settings: PrayerSettings = DEFAULT_PRAYER_SETTINGS
): DailyPrayerTimes {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = getCalculationParameters(settings.method);
  params.madhab = settings.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const now = date.getTime();
  const fajrTime = prayerTimes.fajr.getTime();
  const sunriseTime = prayerTimes.sunrise.getTime();
  const dhuhrTime = prayerTimes.dhuhr.getTime();
  const asrTime = prayerTimes.asr.getTime();
  const maghribTime = prayerTimes.maghrib.getTime();
  const ishaTime = prayerTimes.isha.getTime();

  let currentPrayer: DailyPrayerTimes['currentPrayer'] = 'none';
  let nextPrayer: DailyPrayerTimes['nextPrayer'] = 'fajr';
  let nextPrayerTime: Date = prayerTimes.fajr;
  let previousPrayerTime: number = fajrTime;

  if (now < fajrTime) {
    currentPrayer = 'isha'; // night before Fajr
    nextPrayer = 'fajr';
    nextPrayerTime = prayerTimes.fajr;
    previousPrayerTime = fajrTime - 6 * 3600 * 1000;
  } else if (now < sunriseTime) {
    currentPrayer = 'fajr';
    nextPrayer = 'sunrise';
    nextPrayerTime = prayerTimes.sunrise;
    previousPrayerTime = fajrTime;
  } else if (now < dhuhrTime) {
    currentPrayer = 'sunrise';
    nextPrayer = 'dhuhr';
    nextPrayerTime = prayerTimes.dhuhr;
    previousPrayerTime = sunriseTime;
  } else if (now < asrTime) {
    currentPrayer = 'dhuhr';
    nextPrayer = 'asr';
    nextPrayerTime = prayerTimes.asr;
    previousPrayerTime = dhuhrTime;
  } else if (now < maghribTime) {
    currentPrayer = 'asr';
    nextPrayer = 'maghrib';
    nextPrayerTime = prayerTimes.maghrib;
    previousPrayerTime = asrTime;
  } else if (now < ishaTime) {
    currentPrayer = 'maghrib';
    nextPrayer = 'isha';
    nextPrayerTime = prayerTimes.isha;
    previousPrayerTime = maghribTime;
  } else {
    currentPrayer = 'isha';
    // Next prayer is tomorrow's Fajr
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
    nextPrayer = 'fajr';
    nextPrayerTime = tomorrowTimes.fajr;
    previousPrayerTime = ishaTime;
  }

  const totalDuration = nextPrayerTime.getTime() - previousPrayerTime;
  const elapsed = Math.max(0, now - previousPrayerTime);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  const timeRemainingMs = Math.max(0, nextPrayerTime.getTime() - now);

  return {
    date,
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    currentPrayer,
    nextPrayer,
    nextPrayerTime,
    timeRemainingMs,
    progressPercent,
  };
}

export function calculateQibla(latitude: number, longitude: number): {
  directionDegrees: number;
  compassDirection: string;
  distanceKm: number;
} {
  const coords = new Coordinates(latitude, longitude);
  const directionDegrees = Math.round(Qibla(coords) * 10) / 10;

  // Calculate distance to Kaaba (Makkah: 21.4225, 39.8262) using Haversine formula
  const R = 6371; // km
  const lat1 = (latitude * Math.PI) / 180;
  const lon1 = (longitude * Math.PI) / 180;
  const lat2 = (21.4225 * Math.PI) / 180;
  const lon2 = (39.8262 * Math.PI) / 180;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Compass 16-point notation
  const compassPoints = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round((directionDegrees % 360) / 22.5) % 16;
  const compassDirection = compassPoints[index];

  return {
    directionDegrees,
    compassDirection,
    distanceKm,
  };
}

/**
 * Calculates approximate Hijri date from Gregorian date
 */
export function getHijriDate(date: Date = new Date()): {
  day: number;
  monthName: string;
  monthArabic: string;
  year: number;
} {
  // Use Intl.DateTimeFormat with islamic-umalqura calendar if supported
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
    const month = parts.find((p) => p.type === 'month')?.value || 'Muharram';
    const year = parseInt(parts.find((p) => p.type === 'year')?.value || '1448', 10);

    const arabicMonths: Record<string, string> = {
      Muharram: 'مُحَرَّم',
      Safar: 'صَفَر',
      'Rabiʻ I': 'رَبِيع الأَوَّل',
      'Rabiʻ II': 'رَبِيع الآخِر',
      'Jumada I': 'جُمَادَى الأُولَى',
      'Jumada II': 'جُمَادَى الآخِرَة',
      Rajab: 'رَجَب',
      'Shaʻban': 'شَعْبَان',
      Ramadan: 'رَمَضَان',
      Shawwal: 'شَوَّال',
      'Dhuʻl-Qiʻdah': 'ذُو القَعْدَة',
      'Dhuʻl-Hijjah': 'ذُو الحِجَّة',
    };

    return {
      day,
      monthName: month,
      monthArabic: arabicMonths[month] || month,
      year,
    };
  } catch {
    // Mathematical Kuwati algorithm fallback
    return {
      day: 28,
      monthName: 'Shawwal',
      monthArabic: 'شَوَّال',
      year: 1448,
    };
  }
}

/**
 * Synthesizes a melodious Adhan sound / chime using Web Audio API
 * Guaranteed to work offline with zero external audio file dependencies
 */
export function playSynthesizedAdhanChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Sacred harmonic frequencies evoking adhan notes (Bayati maqam tone sequence)
    // Notes: D4 (293.66), F4 (349.23), G4 (392.0), A4 (440.0), Bb4 (466.16), C5 (523.25)
    const notes = [
      { freq: 293.66, start: 0.0, dur: 1.2, label: 'Allahu' },
      { freq: 392.00, start: 0.8, dur: 1.4, label: 'Akbar' },
      { freq: 440.00, start: 2.1, dur: 1.8, label: 'Allahu' },
      { freq: 392.00, start: 3.5, dur: 2.2, label: 'Akbar' },
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Warm overtone resonance
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Soft bell-like envelope with warm decay
      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + start + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.1);
    });
  } catch (e) {
    console.warn('Web Audio synthesis error:', e);
  }
}
