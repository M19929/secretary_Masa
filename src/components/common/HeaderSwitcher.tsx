import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ToothLogo } from './ToothLogo';
import {
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Building2,
  Lock,
  KeyRound,
  ShieldCheck,
  LogIn
} from 'lucide-react';

interface HeaderSwitcherProps {
  onOpenNotifications: () => void;
}

export const HeaderSwitcher: React.FC<HeaderSwitcherProps> = ({
  onOpenNotifications
}) => {
  const {
    appointments,
    unreadNotifsCount,
    currentUser,
    isAuthenticated,
    openAuthModal,
    logout,
    lockSecretaryDashboard,
    setViewMode,
  } = useClinic();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(a => a.date === todayStr || a.status === 'confirmed').length;
  const isSecretary = currentUser?.role === 'secretary' || currentUser?.role === 'admin';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 flex-wrap">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <ToothLogo 
            size={38} 
            showText={true} 
            textColor="text-white" 
          />
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>منظومة إدارة السكرتارية والاستقبال (نسخة الويب)</span>
          </div>
        </div>

        {/* Secretary Portal Desk Badge */}
        <div className="flex items-center bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-700 shadow-inner gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-amber-400">لوحة السكرتارية والاستقبال والخزينة 💼</span>
              {todayAppointmentsCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full">
                  {todayAppointmentsCount} كشف اليوم
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">النسخة السحابية المخصصة لإدارة المركز</span>
          </div>
        </div>

        {/* Right side controls (User Account + Screen Frame + Notifications) */}
        <div className="flex items-center gap-2">
          {/* Permanent Session High-Security Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>جلسة دائمة مشفرة</span>
          </div>

          {/* Screen Lock Button (1-Click Reception Desk Security Lock) */}
          <button
            type="button"
            onClick={lockSecretaryDashboard}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition cursor-pointer"
            title="قفل لوحة وشاشة السكرتارية وطلب كلمة المرور"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">قفل اللوحة 🔒</span>
          </button>

          {/* User Account Controls */}
          {isAuthenticated && currentUser && (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                  isSecretary ? 'bg-sky-400 text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white max-w-[110px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-bold flex items-center gap-1">
                    {isSecretary ? (
                      <span className="text-sky-400">طاقم السكرتارية</span>
                    ) : (
                      <span className="text-amber-400">{currentUser.points || 0} نقطة (مريض)</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  id="user-account-dropdown"
                  className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95"
                >
                  <div className="p-2.5 border-b border-slate-800 bg-slate-800/40 rounded-xl mb-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-xs">{currentUser.name}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        isSecretary ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isSecretary ? 'سكرتارية واستقبال' : 'حساب مريض'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] dir-ltr mt-0.5">{currentUser.phone}</p>
                    {currentUser.insuranceProvider && (
                      <p className="text-slate-400 text-[10px] mt-1 truncate">
                        تأمين: {currentUser.insuranceProvider}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-right font-medium transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-amber-400" />
                    <span>تبديل الحساب / تسجيل دخول آخر</span>
                  </button>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      id="logout-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 text-right font-bold transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج والرجوع لشاشة الدخول</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Button */}

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer"
            title="التنبيهات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
