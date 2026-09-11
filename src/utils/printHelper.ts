/**
 * Universal Printing Utility for Almasa Dental Clinic
 * Handles printing reliably across desktop browsers, mobile devices, iframes, and WebViews/APKs.
 */

export interface PrintOptions {
  title?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  preferPopup?: boolean;
}

/**
 * Checks if the current document is running inside an iframe (e.g. AI Studio preview, embed, container).
 */
export function isRunningInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Prepares an element for printing by converting any <canvas> elements (such as digital signatures)
 * into high-resolution <img> elements so they render faithfully in cloned DOMs and popups.
 */
export function prepareClonedElement(targetEl: HTMLElement): HTMLElement {
  const clone = targetEl.cloneNode(true) as HTMLElement;
  const origCanvases = targetEl.querySelectorAll('canvas');
  const clonedCanvases = clone.querySelectorAll('canvas');

  origCanvases.forEach((orig, idx) => {
    const dest = clonedCanvases[idx];
    if (dest && orig.width > 0 && orig.height > 0) {
      try {
        const dataUrl = orig.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.maxHeight = `${orig.height}px`;
        img.style.objectFit = 'contain';
        img.className = dest.className;
        dest.parentNode?.replaceChild(img, dest);
      } catch (e) {
        console.warn('Canvas to image conversion note:', e);
      }
    }
  });

  return clone;
}

/**
 * Builds standalone printable HTML from a target element with full stylesheets, Arabic typography,
 * high-contrast print rules, and a top screen-only toolbar.
 */
export function buildPrintableHtml(targetEl: HTMLElement, title: string): string {
  const preparedClone = prepareClonedElement(targetEl);

  const styleTags = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  )
    .map((tag) => tag.outerHTML)
    .join('\n');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  ${styleTags}
  <style>
    @page {
      size: auto;
      margin: 8mm 6mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Cairo', system-ui, -apple-system, sans-serif !important;
      margin: 0 !important;
      padding: 0 !important;
      direction: rtl;
    }
    .print-screen-bar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-screen-btn {
      background: #f59e0b;
      color: #020617;
      border: none;
      padding: 8px 18px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: inherit;
      transition: background 0.2s;
    }
    .print-screen-btn:hover {
      background: #fbbf24;
    }
    .print-screen-btn-secondary {
      background: #334155;
      color: #f8fafc;
      border: none;
      padding: 8px 14px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .print-screen-btn-secondary:hover {
      background: #475569;
    }
    .print-paper-container {
      width: 100%;
      max-width: 820px;
      margin: 20px auto;
      padding: 24px;
      background: #ffffff;
    }
    @media print {
      .print-screen-bar, button, [role="button"], .print\\:hidden, .no-print {
        display: none !important;
      }
      .print-paper-container {
        margin: 0 !important;
        padding: 0 !important;
        max-width: none !important;
        width: 100% !important;
      }
      .print\\:shadow-none {
        box-shadow: none !important;
      }
      .print\\:border-none {
        border: none !important;
      }
      .print\\:w-full {
        width: 100% !important;
      }
      .print\\:m-0 {
        margin: 0 !important;
      }
      .print\\:p-0 {
        padding: 0 !important;
      }
      .print\\:static {
        position: static !important;
      }
    }
  </style>
</head>
<body>
  <!-- Screen-only helper toolbar -->
  <div class="print-screen-bar">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">💎</span>
      <div>
        <div style="font-weight: 800; font-size: 14px;">مركز د. محمد فوزي الماسة لطب وزراعة الأسنان</div>
        <div style="font-size: 11px; opacity: 0.8;">معاينة جاهزة للطباعة والتوثيق</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <button class="print-screen-btn" onclick="window.print()">
        <span>🖨️ طباعة الآن (Ctrl + P)</span>
      </button>
      <button class="print-screen-btn-secondary" onclick="window.close()">
        <span>✕ إغلاق</span>
      </button>
    </div>
  </div>

  <!-- Document Body -->
  <div class="print-paper-container">
    ${preparedClone.outerHTML}
  </div>

  <script>
    // Trigger print automatically after document and stylesheets settle
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.warn('Auto window.print note:', e);
        }
      }, 400);
    });
  </script>
</body>
</html>`;
}

/**
 * Shows an in-app fallback overlay if the browser popup blocker prevented opening the print window.
 */
export function showPrintFallbackModal(html: string, title: string) {
  const existing = document.getElementById('almasa-print-fallback-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'almasa-print-fallback-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '999999';
  overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '16px';
  overlay.style.direction = 'rtl';
  overlay.style.fontFamily = "'Cairo', system-ui, sans-serif";

  overlay.innerHTML = `
    <div style="background: white; border-radius: 20px; max-width: 440px; width: 100%; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); text-align: center;">
      <div style="width: 52px; height: 52px; background: #fef3c7; color: #d97706; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 16px;">
        🖨️
      </div>
      <h3 style="font-weight: 800; font-size: 17px; color: #0f172a; margin: 0 0 8px 0;">
        المستند جاهز للطباعة
      </h3>
      <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
        تم تجهيز (${title}). يرجى الضغط على الزر أدناه لفتح صفحة الطباعة وتخطي أي قيود بالمتصفح:
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button id="almasa-print-now-btn" style="width: 100%; padding: 12px 16px; background: #0f172a; color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>🖨️ فتح المستند وطباعته الآن</span>
        </button>
        <button id="almasa-print-close-btn" style="width: 100%; padding: 10px 16px; background: #f1f5f9; color: #475569; border: none; border-radius: 12px; font-weight: 600; font-size: 13px; cursor: pointer;">
          إغلاق
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('almasa-print-now-btn')?.addEventListener('click', () => {
    overlay.remove();
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      try {
        printWin.focus();
      } catch {}
    }
  });

  document.getElementById('almasa-print-close-btn')?.addEventListener('click', () => {
    overlay.remove();
  });
}

/**
 * Opens a dedicated printable popup window.
 * This completely bypasses sandboxed iframe restrictions ('allow-modals' blocks)
 * because the newly opened window has top-level privileges and can execute window.print() freely.
 */
export function openPrintablePopup(
  elementOrId: HTMLElement | string,
  title: string = 'مركز د. محمد فوزي الماسة لطب وجراحة الأسنان'
): boolean {
  try {
    const targetEl = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!targetEl) {
      console.warn('Target element not found for printable popup:', elementOrId);
      return false;
    }

    const html = buildPrintableHtml(targetEl, title);

    // Open a fresh window with about:blank (NOT blob:, avoiding Chrome blob restrictions)
    const printWin = window.open(
      '',
      '_blank',
      'width=920,height=850,top=30,left=50,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
    );

    if (!printWin) {
      console.warn('window.open was blocked by popup blocker, presenting fallback overlay');
      showPrintFallbackModal(html, title);
      return true; // Handled via fallback UI
    }

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();

    try {
      printWin.focus();
    } catch {}

    return true;
  } catch (err) {
    console.error('Failed to open printable popup:', err);
    return false;
  }
}

/**
 * Universal printElement function.
 * 1. Checks if running inside an iframe (like AI Studio preview): if so, uses openPrintablePopup to avoid iframe modal blocking.
 * 2. If in regular window, attempts native window.print() via isolated #almasa-print-root.
 * 3. If native print fails or is blocked, seamlessly falls back to the printable popup.
 */
export function printElement(
  elementOrId: HTMLElement | string,
  options: PrintOptions = {}
): boolean {
  const title = options.title || 'مركز د. محمد فوزي الماسة لطب وجراحة الأسنان';
  const inIframe = isRunningInIframe();

  try {
    let targetEl: HTMLElement | null = null;
    if (typeof elementOrId === 'string') {
      targetEl = document.getElementById(elementOrId);
    } else {
      targetEl = elementOrId;
    }

    if (!targetEl) {
      console.warn('Print target element not found, falling back to window.print()');
      try {
        window.print();
        return true;
      } catch {
        return false;
      }
    }

    // In sandboxed iframes (such as the AI Studio development environment),
    // calling window.print() is silently ignored or blocked due to missing 'allow-modals'.
    // Therefore, in an iframe, or when explicitly requested, always use the dedicated top-level popup!
    if (inIframe || options.preferPopup) {
      const success = openPrintablePopup(targetEl, title);
      if (success) {
        if (options.onSuccess) options.onSuccess();
        return true;
      }
    }

    // Otherwise, perform in-page print with isolated #almasa-print-root
    const preparedClone = prepareClonedElement(targetEl);

    let printRoot = document.getElementById('almasa-print-root');
    if (!printRoot) {
      printRoot = document.createElement('div');
      printRoot.id = 'almasa-print-root';
      document.body.appendChild(printRoot);
    }
    printRoot.innerHTML = '';
    printRoot.appendChild(preparedClone);

    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }

    document.body.classList.add('almasa-is-printing');

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      document.body.classList.remove('almasa-is-printing');
      if (printRoot) {
        printRoot.innerHTML = '';
      }
      document.title = originalTitle;
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    // Generous 60-second fallback so print settings dialog doesn't lose the DOM
    setTimeout(cleanup, 60000);

    try {
      window.focus();
      window.print();
      if (options.onSuccess) options.onSuccess();
      return true;
    } catch (windowPrintErr) {
      console.warn('In-page window.print() blocked or failed, opening popup fallback:', windowPrintErr);
      cleanup();
      const popupResult = openPrintablePopup(targetEl, title);
      if (popupResult && options.onSuccess) {
        options.onSuccess();
      }
      return popupResult;
    }
  } catch (err) {
    console.error('printElement fatal error:', err);
    if (options.onError) options.onError(err);

    // Final safety fallback
    if (typeof elementOrId === 'string' && document.getElementById(elementOrId)) {
      return openPrintablePopup(elementOrId, title);
    }
    return false;
  }
}
