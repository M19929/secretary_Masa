import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ToothLogo } from '../common/ToothLogo';
import { ClientHome } from './ClientHome';
import { ClientServices } from './ClientServices';
import { ClientOffers } from './ClientOffers';
import { ClientAppointments } from './ClientAppointments';
import { ClientAbout } from './ClientAbout';
import { ClientProfile } from './ClientProfile';
import { ClientBookingFlow } from './ClientBookingFlow';
import {
  Home,
  Tag,
  Calendar,
  Sparkles,
  MoreHorizontal,
  Bell,
  Wifi,
  BatteryMedium,
  Signal,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientAppProps {
  isFramed: boolean;
  onOpenNotifications: () => void;
}

export const ClientApp: React.FC<ClientAppProps> = ({
  isFramed,
  onOpenNotifications
}) => {
  const { clientTab, setClientTab, unreadNotifsCount, setViewMode } = useClinic();

  const renderContent = () => {
    switch (clientTab) {
      case 'home':
        return <ClientHome />;
      case 'services':
        return <ClientServices />;
      case 'offers':
        return <ClientOffers />;
      case 'appointments':
        return <ClientAppointments />;
      case 'about':
        return <ClientAbout />;
      case 'profile':
        return <ClientProfile />;
      case 'booking':
        return <ClientBookingFlow />;
      default:
        return <ClientHome />;
    }
  };

  return (
    <div className={`w-full flex justify-center ${isFramed ? 'py-4 sm:py-8' : ''}`}>
      
      {/* Mobile Device Container */}
      <div
        className={`w-full bg-[#F8FAFC] flex flex-col transition-all overflow-hidden ${
          isFramed
            ? 'max-w-[420px] rounded-[42px] shadow-2xl border-[8px] border-slate-900 min-h-[840px] relative'
            : 'max-w-xl mx-auto shadow-sm rounded-3xl min-h-[90vh]'
        }`}
      >
        {/* iOS Mobile Status Bar (9:41, Cellular, WiFi, Battery) matching Screenshot */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-bold text-slate-800 select-none bg-[#F8FAFC] z-20">
          <span className="font-semibold tracking-tight">9:41</span>
          
          {/* Dynamic Island / Speaker Pill if framed */}
          {isFramed && (
            <div className="w-24 h-4.5 bg-slate-950 rounded-full"></div>
          )}

          <div className="flex items-center gap-1.5 text-slate-800">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Top Header matching Screenshot 1 (Notification bell + Center Diamond Logo) */}
        {clientTab !== 'booking' && (
          <div className="px-5 py-3 flex items-center justify-between bg-[#F8FAFC]">
            
            {/* Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-2xl bg-white border border-slate-100 shadow-xs hover:bg-slate-50 text-slate-700 transition"
              aria-label="التنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Center Diamond Tooth Logo */}
            <div className="flex items-center justify-center">
              <ToothLogo size={42} showText={true} />
            </div>

            {/* Secretary / Staff Desk Access */}
            <button
              type="button"
              onClick={() => setViewMode('secretary')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs border border-slate-800"
              title="الانتقال إلى لوحة السكرتارية وإدارة العيادة"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">السكرتارية 💼</span>
            </button>
          </div>
        )}

        {/* Main Scrollable View */}
        <main className="flex-1 px-4 sm:px-5 pt-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={clientTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation Bar (Matching Screenshot exactly) */}
        <nav className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-2 px-3 flex items-center justify-around z-30 shadow-lg">
          
          {/* 1. المزيد (More) */}
          <button
            onClick={() => setClientTab('about')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              clientTab === 'about' || clientTab === 'profile'
                ? 'text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>المزيد</span>
          </button>

          {/* 2. المواعيد (Appointments) */}
          <button
            onClick={() => setClientTab('appointments')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              clientTab === 'appointments'
                ? 'text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>المواعيد</span>
          </button>

          {/* 3. الرئيسية (Home - Active Dark Navy Pill matching screenshot) */}
          <button
            onClick={() => setClientTab('home')}
            className={`flex flex-col items-center gap-1 py-1.5 px-5 rounded-2xl transition cursor-pointer ${
              clientTab === 'home'
                ? 'bg-[#0B1E36] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-extrabold">الرئيسية</span>
          </button>

          {/* 4. العروض (Offers) */}
          <button
            onClick={() => setClientTab('offers')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              clientTab === 'offers'
                ? 'text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span>العروض</span>
          </button>

          {/* 5. الخدمات (Services) */}
          <button
            onClick={() => setClientTab('services')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              clientTab === 'services'
                ? 'text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>الخدمات</span>
          </button>

        </nav>

        {/* iPhone bottom home bar indicator */}
        {isFramed && (
          <div className="w-full bg-white pb-2 flex justify-center items-center">
            <div className="w-32 h-1 bg-slate-900 rounded-full"></div>
          </div>
        )}
      </div>

    </div>
  );
};
