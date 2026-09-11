import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Phone,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { CLINIC_INFO } from '../../data/mockData';

// Coordinates for Midan El Shon, El Mahalla El Kubra (مركز د. محمد فوزي الماسة)
export const CLINIC_COORDINATES = {
  lat: 30.9705,
  lng: 31.1685
};

interface ClinicGoogleMapProps {
  height?: string;
  showDetailsCard?: boolean;
  className?: string;
}

export const ClinicGoogleMap: React.FC<ClinicGoogleMapProps> = ({
  height = '320px',
  showDetailsCard = true,
  className = ''
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
  const [copied, setCopied] = useState(false);
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const destinationQuery = encodeURIComponent(
    `${CLINIC_INFO.name}, ميدان الشون, المحلة الكبرى, الغربية, مصر`
  );
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${CLINIC_COORDINATES.lat},${CLINIC_COORDINATES.lng}&destination_place_id=&travelmode=driving`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${CLINIC_COORDINATES.lat},${CLINIC_COORDINATES.lng}`;

  const copyFullAddress = () => {
    const text = `${CLINIC_INFO.name}\nالعنوان: ${CLINIC_INFO.address}\nإحداثيات GPS: ${CLINIC_COORDINATES.lat}, ${CLINIC_COORDINATES.lng}\nالمحلة الكبرى - مصر`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="clinic-google-map-container"
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}
      dir="rtl"
    >
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50/70 via-sky-50/40 to-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                موقع المركز على خرائط Google 🗺️
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                GPS دقيق
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {CLINIC_INFO.address}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>الاتجاهات (GPS)</span>
          </a>

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
            <span>فتح في Google Maps</span>
          </a>

          <button
            type="button"
            onClick={copyFullAddress}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
            title="نسخ تفاصيل العنوان"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
            <span>{copied ? 'تم النسخ' : 'نسخ العنوان'}</span>
          </button>
        </div>
      </div>

      {/* Map Display Container */}
      <div className="relative w-full overflow-hidden bg-slate-100" style={{ height }}>
        {apiKey ? (
          // Modern @vis.gl/react-google-maps SDK implementation with AdvancedMarker
          <APIProvider apiKey={apiKey}>
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={CLINIC_COORDINATES}
              defaultZoom={17}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeId={mapType}
            >
              <AdvancedMarker
                position={CLINIC_COORDINATES}
                title={CLINIC_INFO.name}
                onClick={() => setInfoWindowOpen(!infoWindowOpen)}
              >
                <Pin
                  background="#F59E0B"
                  borderColor="#78350F"
                  glyphColor="#0F172A"
                  scale={1.2}
                />
              </AdvancedMarker>

              {infoWindowOpen && (
                <InfoWindow
                  position={CLINIC_COORDINATES}
                  onCloseClick={() => setInfoWindowOpen(false)}
                >
                  <div className="p-1 text-right max-w-xs font-sans" dir="rtl">
                    <h4 className="font-extrabold text-xs text-slate-900">
                      {CLINIC_INFO.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {CLINIC_INFO.address}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={googleMapsDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        بدء الملاحة والمسار
                      </a>
                      <span className="text-[10px] text-slate-500">01101722551</span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          // High-fidelity interactive Google Maps Embed with pinpoint coordinates
          <iframe
            title="خريطة مركز دكتور محمد فوزي الماسة لطب وزراعة الأسنان"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${CLINIC_COORDINATES.lat},${CLINIC_COORDINATES.lng}&hl=ar&z=17&output=embed`}
            className="w-full h-full"
          />
        )}

        {/* Floating Quick Action Overlay on Map Corner */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/40 shadow-md flex items-center gap-2 text-[11px] font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ميدان الشون - المحلة الكبرى</span>
          </div>
        </div>
      </div>

      {/* Details Card below Map */}
      {showDetailsCard && (
        <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">العلامات المميزة للمركز</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                مقابل حلواني هبة • أعلى معمل الدرة • ميدان الشون
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">للمساعدة في الوصول هاتفياً</span>
              <div className="flex items-center gap-2 mt-0.5">
                <a href="tel:01101722551" className="text-xs font-bold text-sky-700 hover:underline">
                  01101722551
                </a>
                <span className="text-slate-300">•</span>
                <a href="tel:0402218878" className="text-xs font-bold text-slate-600 hover:underline">
                  0402218878
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">مواعيد استقبال الزيارات</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {CLINIC_INFO.workingHours}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
