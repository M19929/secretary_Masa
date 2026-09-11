// Audio chime synthesizer using Web Audio API (reliable, offline-safe, zero external dependencies)
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Pleasant two-tone chime (880Hz -> 1320Hz, A5 -> E6)
    const now = ctx.currentTime;
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (harmonious sparkle)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// Request and trigger browser / system background notification
export async function sendBrowserNotification(title: string, body: string, icon: string = '/icon-192.png') {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  try {
    let permission = Notification.permission;
    if (permission !== 'granted' && permission !== 'denied') {
      try {
        permission = await Notification.requestPermission();
      } catch (permErr) {
        console.warn('Notification permission request error:', permErr);
      }
    }

    if (permission === 'granted') {
      const notificationOptions = {
        body,
        icon: icon || '/icon-192.png',
        badge: '/favicon.png',
        dir: 'rtl' as NotificationDirection,
        lang: 'ar',
        tag: 'almasa-clinic-' + Date.now(),
        renotify: true,
        data: { url: '/' }
      };

      // 1. Prefer Service Worker registration for true system/background notification
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && 'showNotification' in registration) {
            await registration.showNotification(title, notificationOptions as any);
            return true;
          }
        } catch (swErr) {
          console.warn('SW notification fallback to Window Notification:', swErr);
        }
      }

      // 2. Fallback to Window Notification
      new Notification(title, notificationOptions);
      return true;
    }
  } catch (e) {
    console.warn('Browser notification error:', e);
  }
  return false;
}
