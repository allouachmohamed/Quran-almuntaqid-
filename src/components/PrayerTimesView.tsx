import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bell,
  BellOff,
  MapPin,
  Compass,
  Volume2,
  Calendar,
  Check,
  AlertCircle,
  Sliders,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  PrayerSettings,
  CityLocation,
  DailyPrayerTimes,
  CalculationMethodKey,
  MadhabKey,
} from '../types/quran';
import {
  MAJOR_CITIES,
  calculatePrayerTimes,
  getHijriDate,
  playSynthesizedAdhanChime,
  saveStoredPrayerSettings,
  saveStoredLocation,
} from '../services/prayerService';
import { notificationService } from '../services/notificationService';

interface PrayerTimesViewProps {
  settings: PrayerSettings;
  onUpdateSettings: (settings: PrayerSettings) => void;
  location: CityLocation;
  onUpdateLocation: (location: CityLocation) => void;
  onNavigateToQibla: () => void;
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({
  settings,
  onUpdateSettings,
  location,
  onUpdateLocation,
  onNavigateToQibla,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerData: DailyPrayerTimes = calculatePrayerTimes(
    { latitude: location.latitude, longitude: location.longitude },
    currentTime,
    settings
  );

  const hijri = getHijriDate(currentTime);

  const permissionStatus = notificationService.getPermissionStatus();

  const handleRequestPermission = async () => {
    const result = await notificationService.requestPermission();
    if (result === 'granted') {
      const updated = { ...settings, notificationsEnabled: true };
      onUpdateSettings(updated);
      saveStoredPrayerSettings(updated);
    }
  };

  const handleTestNotification = () => {
    const sent = notificationService.testNotification(settings);
    setTestNotificationFeedback('Adhan test sound played & notification dispatched!');
    setTimeout(() => setTestNotificationFeedback(null), 3500);
  };

  const handleTogglePrayer = (prayerKey: keyof PrayerSettings['enabledPrayers']) => {
    const updated = {
      ...settings,
      enabledPrayers: {
        ...settings.enabledPrayers,
        [prayerKey]: !settings.enabledPrayers[prayerKey],
      },
    };
    onUpdateSettings(updated);
    saveStoredPrayerSettings(updated);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLocation: CityLocation = {
          id: 'custom-gps',
          name: 'My Current Location',
          country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
          latitude,
          longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };
        onUpdateLocation(newLocation);
        saveStoredLocation(newLocation);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || 'Could not retrieve GPS coordinates.');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const formatTimeStr = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatCountdown = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s`;
  };

  const prayersList: Array<{
    key: keyof PrayerSettings['enabledPrayers'];
    name: string;
    arabicName: string;
    time: Date;
    desc: string;
  }> = [
    { key: 'fajr', name: 'Fajr', arabicName: 'الفجر', time: prayerData.fajr, desc: 'Dawn Prayer' },
    { key: 'sunrise', name: 'Sunrise', arabicName: 'الشروق', time: prayerData.sunrise, desc: 'Solar sunrise' },
    { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', time: prayerData.dhuhr, desc: 'Midday Prayer' },
    { key: 'asr', name: 'Asr', arabicName: 'العصر', time: prayerData.asr, desc: 'Late Afternoon' },
    { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', time: prayerData.maghrib, desc: 'Sunset Prayer' },
    { key: 'isha', name: 'Isha', arabicName: 'العشاء', time: prayerData.isha, desc: 'Night Prayer' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Date & Location Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-emerald-950 border border-emerald-900 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {hijri.day} {hijri.monthArabic} ({hijri.monthName}) {hijri.year} AH
            </span>
          </div>

          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Daily Prayer Times
          </h2>

          <div className="mt-1 flex items-center gap-2 text-xs text-emerald-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">{location.name}</span>
            <span>·</span>
            <span>{location.country}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDetectGPS}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs font-medium border border-emerald-800 transition"
          >
            {gpsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Use GPS</span>
          </button>

          <button
            onClick={onNavigateToQibla}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs font-medium border border-emerald-800 transition"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Qibla Direction</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs font-medium border border-emerald-800 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-3 bg-rose-950/60 border border-rose-900 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Prominent Next Prayer Countdown Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900/90 to-emerald-950 border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Obligatory Prayer</span>
            </div>

            <div className="mt-1 flex items-baseline gap-3">
              <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white capitalize">
                {prayerData.nextPrayer}
              </h3>
              <span className="text-xl sm:text-2xl font-serif text-amber-400 font-bold">
                {prayersList.find((p) => p.key === prayerData.nextPrayer)?.arabicName}
              </span>
            </div>

            <p className="mt-1 text-sm text-emerald-200">
              Starts at <strong className="text-white font-mono">{formatTimeStr(prayerData.nextPrayerTime)}</strong>
            </p>
          </div>

          <div className="bg-emerald-950/70 p-4 sm:p-5 rounded-2xl border border-emerald-800/80 min-w-[220px] text-center">
            <span className="text-xs text-emerald-400 font-mono block mb-1">
              Time Remaining
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tracking-tight">
              {formatCountdown(prayerData.timeRemainingMs)}
            </div>
            <div className="mt-2.5 w-full bg-emerald-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000"
                style={{ width: `${prayerData.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Prayer Times List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {prayersList.map(({ key, name, arabicName, time, desc }) => {
          const isNext = prayerData.nextPrayer === key;
          const isCurrent = prayerData.currentPrayer === key;
          const isEnabled = settings.enabledPrayers[key];

          return (
            <div
              key={key}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isNext
                  ? 'bg-emerald-900/50 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                  : isCurrent
                  ? 'bg-emerald-950/70 border-emerald-700'
                  : 'bg-emerald-950/40 border-emerald-900/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-white">{name}</h4>
                    {isNext && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                        NEXT
                      </span>
                    )}
                    {isCurrent && !isNext && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200">
                        NOW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-400">{desc}</span>
                </div>

                <div className="text-right">
                  <span className="font-serif text-xl font-bold text-amber-400">
                    {arabicName}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-emerald-900/60">
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
                  {formatTimeStr(time)}
                </span>

                <button
                  onClick={() => handleTogglePrayer(key)}
                  title={isEnabled ? `Disable notification for ${name}` : `Enable notification for ${name}`}
                  className={`p-2 rounded-lg transition ${
                    isEnabled
                      ? 'text-amber-400 hover:bg-emerald-900'
                      : 'text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900'
                  }`}
                >
                  {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notifications & Adhan Notification Banner */}
      <div className="p-6 rounded-3xl bg-emerald-950 border border-emerald-900 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-semibold text-white">
                Daily Prayer Notifications & Adhan
              </h3>
            </div>
            <p className="text-xs text-emerald-300 mt-1">
              Receive timely desktop and mobile alerts with melodious Adhan call for each prayer time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {permissionStatus !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-sm transition whitespace-nowrap"
              >
                Enable Notifications
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 text-emerald-200 border border-emerald-800 text-xs font-medium">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Alerts Active</span>
              </div>
            )}

            <button
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-emerald-900/70 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-800 transition whitespace-nowrap"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Adhan Sound</span>
            </button>
          </div>
        </div>

        {testNotificationFeedback && (
          <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 font-medium">
            {testNotificationFeedback}
          </div>
        )}
      </div>

      {/* Settings / Configuration Panel */}
      {showConfig && (
        <div className="p-6 rounded-3xl bg-emerald-950 border border-emerald-900 space-y-5 animate-in fade-in duration-200">
          <h3 className="text-base font-semibold text-white">Prayer Configuration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* City Preset */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                City / Location
              </label>
              <select
                value={location.id}
                onChange={(e) => {
                  const found = MAJOR_CITIES.find((c) => c.id === e.target.value);
                  if (found) {
                    onUpdateLocation(found);
                    saveStoredLocation(found);
                  }
                }}
                className="w-full bg-emerald-900 border border-emerald-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              >
                {MAJOR_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Calculation Method */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                Calculation Method
              </label>
              <select
                value={settings.method}
                onChange={(e) => {
                  const updated = {
                    ...settings,
                    method: e.target.value as CalculationMethodKey,
                  };
                  onUpdateSettings(updated);
                  saveStoredPrayerSettings(updated);
                }}
                className="w-full bg-emerald-900 border border-emerald-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="MuslimWorldLeague">Muslim World League (MWL)</option>
                <option value="NorthAmerica">Islamic Society of North America (ISNA)</option>
                <option value="Egyptian">Egyptian General Authority</option>
                <option value="UmmAlQura">Umm Al-Qura University, Makkah</option>
                <option value="Karachi">Univ. of Islamic Sciences, Karachi</option>
                <option value="Dubai">Dubai / Gulf Region</option>
                <option value="Qatar">Ministry of Awqaf, Qatar</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Singapore">MUIS Singapore</option>
                <option value="Tehran">Institute of Geophysics, Tehran</option>
              </select>
            </div>

            {/* Madhab (Asr shadow multiplier) */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                Asr Juristic Method (Madhab)
              </label>
              <select
                value={settings.madhab}
                onChange={(e) => {
                  const updated = {
                    ...settings,
                    madhab: e.target.value as MadhabKey,
                  };
                  onUpdateSettings(updated);
                  saveStoredPrayerSettings(updated);
                }}
                className="w-full bg-emerald-900 border border-emerald-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="shafi">Standard (Shafi, Maliki, Hanbali)</option>
                <option value="hanafi">Hanafi (Later Asr time)</option>
              </select>
            </div>

            {/* Advance notification warning */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                Advance Reminder
              </label>
              <select
                value={settings.notifyMinutesBefore}
                onChange={(e) => {
                  const updated = {
                    ...settings,
                    notifyMinutesBefore: parseInt(e.target.value, 10),
                  };
                  onUpdateSettings(updated);
                  saveStoredPrayerSettings(updated);
                }}
                className="w-full bg-emerald-900 border border-emerald-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="0">At exact prayer time</option>
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="15">15 minutes before</option>
              </select>
            </div>

            {/* Sound toggle */}
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                Adhan Audio Chime
              </label>
              <button
                onClick={() => {
                  const updated = {
                    ...settings,
                    soundEnabled: !settings.soundEnabled,
                  };
                  onUpdateSettings(updated);
                  saveStoredPrayerSettings(updated);
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium border transition ${
                  settings.soundEnabled
                    ? 'bg-emerald-900 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-900'
                }`}
              >
                {settings.soundEnabled ? 'Sound Active' : 'Sound Muted'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
