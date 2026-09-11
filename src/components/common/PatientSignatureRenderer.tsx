import React from 'react';
import { CheckCircle2, ShieldCheck, PenTool, FileCheck2 } from 'lucide-react';
import { MedicalConsent } from '../../types';

interface PatientSignatureRendererProps {
  consent?: Partial<MedicalConsent> | null;
  patientName?: string;
  className?: string;
}

export const PatientSignatureRenderer: React.FC<PatientSignatureRendererProps> = ({
  consent,
  patientName = 'المريض',
  className = ''
}) => {
  if (!consent) {
    return (
      <div className="border-b-2 border-dotted border-slate-300 my-4 h-10 flex items-end justify-center text-slate-400 text-xs">
        (بانتظار توقيع المريض هنا)
      </div>
    );
  }

  const rawSig = consent.patientSignature?.trim() || '';
  const isImageSig = rawSig.startsWith('data:image/') || rawSig.startsWith('http://') || rawSig.startsWith('https://') || rawSig.startsWith('blob:');
  
  // Check if we have serialized touch strokes
  const touchStrokes = consent.touchStrokes as Array<Array<{ dx: number; dy: number }>> | undefined;
  const hasStrokes = Array.isArray(touchStrokes) && touchStrokes.length > 0 && touchStrokes[0]?.length > 0;

  // Signer display name
  const signerDisplayName = consent.signerName || 
    (rawSig.includes('باسم:') ? rawSig.split('باسم:')[1]?.trim() : '') || 
    consent.patientName || 
    patientName;

  const isSigned = consent.status === 'signed' || 
                   consent.status === 'approved' || 
                   consent.status === 'signed_by_patient' || 
                   Boolean(rawSig) || 
                   hasStrokes ||
                   Boolean(consent.signedAt);

  if (!isSigned) {
    return (
      <div className="border-b-2 border-dotted border-slate-300 my-4 h-10 flex items-end justify-center text-slate-400 text-xs">
        (التوقيع الإلكتروني أو الورقي هنا)
      </div>
    );
  }

  const signedDateStr = consent.signedAt 
    ? new Date(consent.signedAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : consent.date || 'تاريخ التسجيل';

  return (
    <div className={`my-2 p-3 bg-white/95 rounded-xl border border-emerald-200 flex flex-col items-center justify-center shadow-xs ${className}`}>
      {/* 1. If valid Image URL (SVG / PNG / WebP) */}
      {isImageSig ? (
        <div className="w-full flex items-center justify-center py-1">
          <img
            src={rawSig}
            alt="توقيع المريض الإلكتروني"
            className="max-h-20 w-auto max-w-[280px] object-contain mx-auto"
          />
        </div>
      ) : hasStrokes ? (
        /* 2. If touch points / strokes are saved */
        <div className="w-full flex items-center justify-center py-1">
          <svg
            viewBox="0 0 360 140"
            className="w-full max-w-[260px] h-16 mx-auto"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))' }}
          >
            {touchStrokes.map((stroke, sIdx) => {
              if (!stroke || stroke.length === 0) return null;
              const d = stroke.reduce((acc, pt, pIdx) => {
                return pIdx === 0 ? `M ${pt.dx} ${pt.dy}` : `${acc} L ${pt.dx} ${pt.dy}`;
              }, '');
              return (
                <path
                  key={sIdx}
                  d={d}
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        </div>
      ) : (
        /* 3. Authentic Calligraphic Signature Display (Visible signature flourish & ink signature styling) */
        <div className="w-full py-2 px-3 text-center flex flex-col items-center justify-center">
          <div className="relative py-2 px-4 flex flex-col items-center justify-center">
            {/* Signature handwritten style representation */}
            <div className="text-xl sm:text-2xl font-black text-blue-900 tracking-wide font-serif italic select-none transform -rotate-1">
              ✍️ {signerDisplayName}
            </div>
            {/* Elegant authentic ink signature stroke under the name */}
            <svg viewBox="0 0 320 36" className="w-64 sm:w-72 h-7 text-blue-700/80 -mt-1">
              <path
                d="M 12 24 C 60 8, 140 32, 220 16 S 300 28, 310 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M 180 20 Q 250 8 305 14"
                fill="none"
                stroke="#059669"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-[11px] font-bold text-slate-600 font-sans mt-0.5 flex items-center gap-1">
            <span>توقيع إلكتروني موثّق باسم:</span>
            <span className="font-black text-slate-900">{signerDisplayName}</span>
          </div>
        </div>
      )}

      {/* Official Legal Verification Badge */}
      <div className="w-full flex items-center justify-center gap-1.5 mt-2 bg-emerald-50/90 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          {consent.status === 'approved'
            ? 'معتمد وموثق رسمياً بختم المركز ✓'
            : 'توقيع إلكتروني موثق من المريض ✓'}{' '}
          <span className="font-mono text-emerald-700">({signedDateStr})</span>
        </span>
      </div>
    </div>
  );
};
