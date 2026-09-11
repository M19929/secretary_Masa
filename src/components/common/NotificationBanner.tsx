import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Sparkles, Calendar, Tag, ChevronLeft } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationBannerProps {
  notification: NotificationItem | null;
  onClose: () => void;
  onClick: (notif: NotificationItem) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onClose,
  onClick
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'offer':
        return <Tag className="w-5 h-5 text-amber-400" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3"
        dir="rtl"
      >
        <div
          onClick={() => onClick(notification)}
          className="relative bg-slate-900/95 backdrop-blur-md border border-amber-500/40 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-900 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-between gap-1">
              <span className="font-extrabold text-xs text-white truncate">
                {notification.title}
              </span>
              <span className="text-[10px] text-amber-400 font-bold shrink-0">
                إشعار فوري 🔔
              </span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:-translate-x-0.5 transition" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
