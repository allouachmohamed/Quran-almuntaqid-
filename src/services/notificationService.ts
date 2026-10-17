import { PrayerSettings, DailyPrayerTimes } from '../types/quran';
import { playSynthesizedAdhanChime } from './prayerService';

class NotificationService {
  private checkIntervalId: number | null = null;
  private notifiedKeys: Set<string> = new Set();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  public sendNotification(title: string, options?: NotificationOptions): boolean {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notif = new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return true;
    } catch (e) {
      console.warn('Failed to dispatch notification:', e);
      return false;
    }
  }

  public testNotification(settings: PrayerSettings): boolean {
    if (settings.soundEnabled) {
      playSynthesizedAdhanChime();
    }

    const title = 'Adhan Alert — Test Notification';
    const body = 'Daily prayer time notifications are active and ready.';

    if (this.getPermissionStatus() === 'granted') {
      return this.sendNotification(title, {
        body,
        tag: 'adhan-test',
      });
    }

    return false;
  }

  /**
   * Starts scheduler to check current time against upcoming prayer times
   */
  public startPrayerScheduler(
    getTimes: () => DailyPrayerTimes,
    getSettings: () => PrayerSettings,
    locationName: string
  ): void {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
    }

    const check = () => {
      const settings = getSettings();
      if (!settings.notificationsEnabled) return;

      const times = getTimes();
      const now = new Date();
      const prayers: Array<{ key: keyof DailyPrayerTimes & keyof PrayerSettings['enabledPrayers']; name: string; time: Date }> = [
        { key: 'fajr', name: 'Fajr (Dawn)', time: times.fajr },
        { key: 'dhuhr', name: 'Dhuhr (Noon)', time: times.dhuhr },
        { key: 'asr', name: 'Asr (Afternoon)', time: times.asr },
        { key: 'maghrib', name: 'Maghrib (Sunset)', time: times.maghrib },
        { key: 'isha', name: 'Isha (Night)', time: times.isha },
      ];

      const todayStr = now.toISOString().split('T')[0];

      prayers.forEach(({ key, name, time }) => {
        if (!settings.enabledPrayers[key]) return;

        const diffSeconds = Math.round((time.getTime() - now.getTime()) / 1000);
        const notificationKey = `${todayStr}_${key}_exact`;

        // Check exact prayer time (within 30 seconds window)
        if (Math.abs(diffSeconds) <= 30 && !this.notifiedKeys.has(notificationKey)) {
          this.notifiedKeys.add(notificationKey);

          if (settings.soundEnabled) {
            playSynthesizedAdhanChime();
          }

          this.sendNotification(`Time for ${name}`, {
            body: `It is now time for ${name} prayer in ${locationName}. "Indeed, prayer has been decreed upon the believers a decree of specified times." (4:103)`,
            tag: notificationKey,
          });
        }

        // Check advance notice (e.g., 10 minutes before)
        if (settings.notifyMinutesBefore > 0) {
          const advanceSecs = settings.notifyMinutesBefore * 60;
          const advanceKey = `${todayStr}_${key}_advance`;
          if (
            diffSeconds > 0 &&
            diffSeconds <= advanceSecs &&
            diffSeconds >= advanceSecs - 30 &&
            !this.notifiedKeys.has(advanceKey)
          ) {
            this.notifiedKeys.add(advanceKey);
            this.sendNotification(`Upcoming: ${name} in ${settings.notifyMinutesBefore} minutes`, {
              body: `Prepare for ${name} prayer in ${locationName}.`,
              tag: advanceKey,
            });
          }
        }
      });
    };

    // Run check immediately and then every 20 seconds
    check();
    this.checkIntervalId = window.setInterval(check, 20000);
  }

  public stopPrayerScheduler(): void {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }
}

export const notificationService = new NotificationService();
