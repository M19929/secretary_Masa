import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { DentalService } from '../../types';
import { DentalToothIcon } from '../common/DentalToothIcons';
import {
  Crown,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
  ShieldCheck,
  Smile,
  SunMedium,
  Activity,
  Layers,
  Star,
  Stethoscope
} from 'lucide-react';

export const ClientServices: React.FC = () => {
  const { services, startBooking } = useClinic();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['الكل', 'الكشف والاستشارة', 'الوقاية والتنظيف', 'التجميل', 'التركيبات', 'التقويم', 'علاج العصب', 'الجراحة والزراعة'];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      case 'Smile': return <Smile className="w-5 h-5" />;
      case 'SunMedium': return <SunMedium className="w-5 h-5" />;
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Star': return <Star className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCat = selectedCategory === 'الكل' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4 pb-6">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-4 rounded-2xl text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold">خدمات مركز الماسة</h2>
          <p className="text-xs text-slate-300">رعاية متخصصة بأحدث التقنيات وأفضل الأطباء</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
          <Crown className="w-6 h-6" />
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن خدمة (تنظيف، حشوة، تقويم، زراعة...)"
            className="w-full bg-white border border-slate-200 text-xs sm:text-sm rounded-xl py-2.5 px-9 text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 absolute left-3 top-1/2 -translate-y-1/2"
            >
              مسح
            </button>
          )}
        </div>

        {/* Categories scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services List matching Screenshot 2 style */}
      <div className="flex flex-col gap-2.5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            onClick={() => startBooking(service)}
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              
              {/* Left arrow / Action */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                  {service.basePrice} ج.م
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>

              {/* Right: Service Name and Icon */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-700 transition">
                    {service.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {service.category} • {service.durationMinutes} دقيقة
                  </span>
                </div>
                
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 group-hover:border-amber-300 transition-all shadow-xs">
                  <DentalToothIcon serviceId={service.id} category={service.category} size={28} className="w-7 h-7" />
                </div>
              </div>

            </div>

            {/* Service details description */}
            <p className="text-xs text-slate-500 leading-relaxed text-right border-t border-slate-50 pt-2">
              {service.description}
            </p>

            {/* Features pills */}
            <div className="flex flex-wrap gap-1.5 justify-end">
              {service.features.map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs sm:text-sm">لا توجد خدمات مطابقة لبحثك</p>
          </div>
        )}
      </div>

    </div>
  );
};
