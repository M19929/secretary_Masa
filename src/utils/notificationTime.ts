import { NotificationItem } from '../types';

/**
 * Format a notification's timestamp into a clean, intuitive Arabic relative or absolute string.
 * Examples: "الآن", "منذ 5 دقائق", "اليوم 03:45 م", "أمس 11:20 ص", "2026/09/09 02:15 م"
 */
export function formatNotificationTime(notif: NotificationItem): string {
  if (notif.createdAt) {
    try {
      const dt = new Date(notif.createdAt);
      if (!isNaN(dt.getTime())) {
        const now = new Date();
        const diffMs = now.getTime() - dt.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);

        // Format local Egyptian 12-hour time: e.g. "03:45 م"
        let hours = dt.getHours();
        const minutes = dt.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;

        if (diffSec < 60 && diffSec >= -10) {
          return 'الآن';
        }
        if (diffMin < 60 && diffMin > 0) {
          if (diffMin === 1) return 'منذ دقيقة';
          if (diffMin === 2) return 'منذ دقيقتين';
          if (diffMin >= 3 && diffMin <= 10) return `منذ ${diffMin} دقائق`;
          return `منذ ${diffMin} دقيقة`;
        }

        const isToday =
          now.getFullYear() === dt.getFullYear() &&
          now.getMonth() === dt.getMonth() &&
          now.getDate() === dt.getDate();

        if (isToday) {
          return `اليوم ${timeStr}`;
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
          yesterday.getFullYear() === dt.getFullYear() &&
          yesterday.getMonth() === dt.getMonth() &&
          yesterday.getDate() === dt.getDate();

        if (isYesterday) {
          return `أمس ${timeStr}`;
        }

        const year = dt.getFullYear();
        const month = (dt.getMonth() + 1).toString().padStart(2, '0');
        const day = dt.getDate().toString().padStart(2, '0');
        return `${year}/${month}/${day} ${timeStr}`;
      }
    } catch (_) {}
  }

  if (notif.time && notif.time !== 'الآن') {
    return notif.date ? `${notif.date} ${notif.time}` : notif.time;
  }

  return 'الآن';
}

/**
 * Generate standard ISO, Arabic time, and Arabic date objects for new notifications
 */
export function getNotificationTimestamps() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  const time = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const date = `${year}/${month}/${day}`;

  return {
    createdAt: now.toISOString(),
    time,
    date,
  };
}
