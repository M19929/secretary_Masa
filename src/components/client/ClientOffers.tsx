import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { DentalOffer } from '../../types';
import {
  Percent,
  Sparkles,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Calendar,
  Gift,
  ArrowRight
} from 'lucide-react';

export const ClientOffers: React.FC = () => {
  const { offers, startBooking, setClientTab } = useClinic();
  const [selectedFilter, setSelectedFilter] = useState<string>('كل العروض');

  const filterTabs = ['كل العروض', 'عروض التقويم', 'تنظيف وتبييض', 'التركيبات والزراعة'];

  const filteredOffers = offers.filter(off => {
    if (selectedFilter === 'كل العروض') return true;
    return off.category === selectedFilter;
  });

  const getThemeStyles = (theme: DentalOffer['imageTheme']) => {
    switch (theme) {
      case 'blue':
        return {
          bg: 'bg-gradient-to-l from-[#0D254C] via-[#103060] to-[#1E3A8A]',
          badgeBg: 'bg-amber-400 text-slate-950',
          accent: 'text-amber-300'
        };
      case 'teal':
        return {
          bg: 'bg-gradient-to-l from-[#064E3B] via-[#047857] to-[#0D9488]',
          badgeBg: 'bg-emerald-300 text-emerald-950',
          accent: 'text-emerald-200'
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-l from-[#78350F] via-[#92400E] to-[#B45309]',
          badgeBg: 'bg-amber-300 text-amber-950',
          accent: 'text-amber-200'
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-l from-[#3B0764] via-[#581C87] to-[#6B21A8]',
          badgeBg: 'bg-fuchsia-300 text-fuchsia-950',
          accent: 'text-fuchsia-200'
        };
      default:
        return {
          bg: 'bg-slate-900',
          badgeBg: 'bg-amber-400 text-slate-950',
          accent: 'text-amber-300'
        };
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      
      {/* Top Header matching Screenshot 4 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setClientTab('home')}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
          العروض
        </h2>

        <div className="w-8"></div>
      </div>

      {/* Filter Tabs matching Screenshot 4 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition cursor-pointer ${
              selectedFilter === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Offers Cards List matching Screenshot 4 */}
      <div className="flex flex-col gap-3">
        {filteredOffers.map((offer) => {
          const themeStyle = getThemeStyles(offer.imageTheme);

          return (
            <div
              key={offer.id}
              className={`rounded-3xl ${themeStyle.bg} text-white p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col gap-3`}
            >
              {/* Background tooth graphic */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-28 h-28 opacity-90 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  <path
                    d="M30 25 C22 25 18 35 18 48 C18 64 26 77 34 85 C38 88 43 87 45 80 C47 74 48 63 50 63 C52 63 53 74 55 80 C57 87 62 88 66 85 C74 77 82 64 82 48 C82 35 78 25 70 25 C62 25 55 33 50 33 C45 33 38 25 30 25 Z"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                </svg>
                {/* Discount Badge */}
                <div className={`absolute top-2 right-1 ${themeStyle.badgeBg} font-black text-[11px] px-2 py-0.5 rounded-full shadow`}>
                  {offer.badge}
                </div>
              </div>

              {/* Offer Text */}
              <div className="max-w-[65%] flex flex-col gap-1">
                <h3 className="font-black text-sm sm:text-base text-white">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-200">
                  {offer.subtitle}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs line-through text-slate-300/80">
                    {offer.originalPrice} ج.م
                  </span>
                  <span className={`text-base sm:text-lg font-black ${themeStyle.accent}`}>
                    {offer.discountedPrice} ج.م فقط
                  </span>
                </div>
              </div>

              {/* Offer Features */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10 max-w-[85%]">
                {offer.features.slice(0, 2).map((feat, i) => (
                  <span key={i} className="text-[10px] bg-black/20 text-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" />
                    {feat}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-300">
                  ينتهي في {offer.expiresAt}
                </span>
                <button
                  onClick={() => startBooking(undefined, offer)}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>احجز العرض الآن</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
