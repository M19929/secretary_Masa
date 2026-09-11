import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, PenTool, Keyboard, Sparkles, CheckCircle2 } from 'lucide-react';

interface DigitalSignaturePadProps {
  initialSignature?: string;
  defaultSignerName?: string;
  onSaveSignature: (signatureDataUrl: string) => void;
  onClearSignature?: () => void;
  width?: number;
  height?: number;
  readOnly?: boolean;
}

type SignatureFontTheme = 'diwani' | 'ruqaa' | 'formal' | 'handwritten';

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  initialSignature,
  defaultSignerName = '',
  onSaveSignature,
  onClearSignature,
  width = 500,
  height = 180,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState<string>(defaultSignerName);
  const [fontTheme, setFontTheme] = useState<SignatureFontTheme>('diwani');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSignature));
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas with retina scaling
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f2b5c'; // Rich medical navy blue fountain pen ink
    ctx.lineWidth = 2.5;

    // If there is an initial signature image, draw it
    if (initialSignature) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    } else {
      ctx.clearRect(0, 0, width, height);
      setHasDrawn(false);
    }
  }, [width, height, initialSignature]);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  // Coordinate helper relative to canvas display bounding rect
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly || signatureMode !== 'draw') return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setLastPoint(coords);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly || signatureMode !== 'draw') return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPoint) return;

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    const midX = (lastPoint.x + coords.x) / 2;
    const midY = (lastPoint.y + coords.y) / 2;
    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setLastPoint(coords);
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing || readOnly) return;
    setIsDrawing(false);
    setLastPoint(null);

    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
    }
  };

  const handleClear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    setHasDrawn(false);
    if (onClearSignature) {
      onClearSignature();
    }
  };

  // Render stylized typed signature into canvas
  const renderTypedSignature = (nameToRender: string, theme: SignatureFontTheme) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width * dpr, height * dpr);

    const cleanName = nameToRender.trim() || 'الموقع بالتفويض';

    // Background subtle watermark
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Choose font styling based on theme
    let fontStr = "bold italic 34px 'Cairo', 'Amiri', serif";
    if (theme === 'diwani') {
      fontStr = "bold italic 36px 'Amiri', 'Cairo', serif";
    } else if (theme === 'ruqaa') {
      fontStr = "bold 32px 'Cairo', sans-serif";
    } else if (theme === 'formal') {
      fontStr = "bold 30px 'Cairo', serif";
    } else {
      fontStr = "italic 32px 'Cairo', cursive, sans-serif";
    }

    ctx.font = fontStr;
    ctx.fillStyle = '#0f2b5c'; // Fountain pen ink

    const centerX = width / 2;
    const centerY = height / 2 - 10;

    // Draw main signature text
    ctx.fillText(cleanName, centerX, centerY);

    // Draw calligraphic flourish line underneath
    ctx.strokeStyle = '#0f2b5c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 130, centerY + 25);
    ctx.quadraticCurveTo(centerX - 30, centerY + 35, centerX + 60, centerY + 22);
    ctx.quadraticCurveTo(centerX + 110, centerY + 12, centerX + 140, centerY + 28);
    ctx.stroke();

    // Verification badge text
    ctx.font = "normal 10px 'Cairo', sans-serif";
    ctx.fillStyle = '#64748b';
    const nowStr = new Date().toLocaleDateString('ar-EG');
    ctx.fillText(`توقيع إلكتروني معتمد • ${nowStr}`, centerX, height - 18);

    ctx.restore();

    setHasDrawn(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl);
  };

  const handleApplyTypedSignature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    renderTypedSignature(typedName, fontTheme);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl);
  };

  return (
    <div className="w-full flex flex-col gap-2.5 select-none" dir="rtl">
      {/* Mode Switcher Tabs for Mobile Convenience */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSignatureMode('draw')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              signatureMode === 'draw'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-500" />
            <span>✍️ رسم باللمس أو القلم</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSignatureMode('type');
              if (typedName) {
                renderTypedSignature(typedName, fontTheme);
              }
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              signatureMode === 'type'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 text-sky-500" />
            <span>⌨️ كتابة الاسم (كيبورد للموبايل)</span>
          </button>
        </div>
      )}

      {/* Keyboard Name Input Form (When in Typing Mode) */}
      {signatureMode === 'type' && !readOnly && (
        <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>كتابة التوقيع عبر لوحة المفاتيح للموبايل:</span>
            </span>
            <span className="text-[11px] text-sky-700">توقيع رسمي فوري</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value);
                renderTypedSignature(e.target.value, fontTheme);
              }}
              placeholder="اكتب اسمك الثلاثي للتوقيع..."
              className="flex-1 bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => handleApplyTypedSignature()}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
            >
              توليد التوقيع ✍️
            </button>
          </div>

          {/* Quick Font Styles */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-slate-600 font-medium ml-1">نمط الخط:</span>
            {[
              { id: 'diwani', label: 'خط ديواني فخم' },
              { id: 'ruqaa', label: 'خط رقعة انسيابي' },
              { id: 'formal', label: 'توقيع رسمي كلاسيكي' },
              { id: 'handwritten', label: 'خط اليد الحر' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setFontTheme(st.id as SignatureFontTheme);
                  renderTypedSignature(typedName, st.id as SignatureFontTheme);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  fontTheme === st.id
                    ? 'bg-sky-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Display */}
      <div className="relative w-full rounded-2xl border-2 border-dashed border-amber-400/80 bg-amber-50/20 overflow-hidden shadow-inner touch-none">
        {/* Helper baseline guide */}
        <div className="absolute inset-x-8 bottom-8 border-b border-slate-300 pointer-events-none flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <span>وقع هنا / Sign Here ✍️</span>
          <span>X ........................................</span>
        </div>

        {!hasDrawn && !readOnly && signatureMode === 'draw' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs gap-2">
            <PenTool className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>يمكنك التوقيع باللمس بإصبعك أو الماوس داخل المربع</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full block ${
            readOnly || signatureMode === 'type' ? 'cursor-default' : 'cursor-crosshair'
          }`}
          style={{ height: `${height}px`, touchAction: 'none' }}
        />
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>توقيع إلكتروني معتمد وساري قانونياً</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasDrawn}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
              title="مسح التوقيع والبدء من جديد"
            >
              <Eraser className="w-3.5 h-3.5 text-rose-500" />
              <span>مسح</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!hasDrawn}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>اعتماد التوقيع ✓</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
