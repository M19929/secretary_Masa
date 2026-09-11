/**
 * Platform Detection Utility
 * Determines whether the user is running the Flutter APK / mobile client
 * or accessing via Web (which is dedicated strictly to Secretary & Reception management).
 */

export function isFlutterApkPlatform(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const search = window.location.search || '';
    const params = new URLSearchParams(search);
    const mode = (params.get('app') || params.get('mode') || params.get('view') || params.get('platform') || '').toLowerCase();

    // Explicit mobile / patient query flags used by the Flutter app
    if (mode === 'patient' || mode === 'client' || mode === 'flutter' || mode === 'apk') {
      try {
        localStorage.setItem('almasa_is_flutter_apk', 'true');
      } catch {}
      return true;
    }

    // Explicit web secretary flag
    if (mode === 'secretary' || mode === 'admin' || mode === 'web') {
      try {
        localStorage.removeItem('almasa_is_flutter_apk');
      } catch {}
      return false;
    }

    // Check if previously marked as Flutter APK in this session
    if (localStorage.getItem('almasa_is_flutter_apk') === 'true') {
      return true;
    }

    // Check Flutter InAppWebView JavaScript channel or specific user-agent
    const ua = (navigator.userAgent || '').toLowerCase();
    const hasFlutterUA = ua.includes('flutter') || ua.includes('almasamobile') || ua.includes('almasaapk');
    const hasFlutterChannel = (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview !== undefined;

    if (hasFlutterUA || hasFlutterChannel) {
      try {
        localStorage.setItem('almasa_is_flutter_apk', 'true');
      } catch {}
      return true;
    }
  } catch {}

  // By default, Web is STRICTLY and EXCLUSIVELY for the Secretary
  return false;
}
