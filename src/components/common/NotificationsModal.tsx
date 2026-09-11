import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Bell, Check, Clock, Sparkles, X, Star, Trash2, Volume2, ShieldCheck, Tag, Calendar, Send } from 'lucide-react';
import { NotificationItem } from '../../types';
import { formatNotificationTime } from '../../utils/notificationTime';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    markNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    requestNotificationPermission,
    broadcastNotification,
    playNotificationChime,
    handleNotificationClick,
    setClientTab,
    viewMode,
    setViewMode,
    appointments,
    openRatingModal
  } = useClinic();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  if (!isOpen) return null;

  const handleEnablePermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setHasPermission(true);
    }
  };

  const handleSendTestNotification = () => {
    broadcastNotification(
      '🦷 تنبيه تجريبي من مركز د. محمد فوزي الماسة',
      'تم إرسال هذا الإشعار لاختبار وصول التنبيهات والصوت بنجاح لجميع الأجهزة والمتصفحات!',
      'system'
    );
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-sm sm:max-w-lg w-full shadow-2xl flex flex-col gap-3.5 max-h-[90vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  الإشعارات والتنبيهات
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {unreadCount} غير مقروء
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                مزامنة فورية حية مع السيرفر والأجهزة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Toolbar: Filter + Mark as read + Clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              غير المقروء ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markNotificationsAsRead}
                className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>قراءة الكل</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-200 transition cursor-pointer"
                title="مسح الكل"
              >
                <Trash2 className="w-3 h-3" />
                <span>مسح</span>
              </button>
            )}
          </div>
        </div>

        {/* Browser Push Permission Banner */}
        {!hasPermission && (
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs text-amber-900 font-medium">
                فعّل إشعارات المتصفح لسماع الصوت والتنبيه حتى عند إغلاق التبويب
              </span>
            </div>
            <button
              type="button"
              onClick={handleEnablePermission}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shrink-0 cursor-pointer shadow-xs"
            >
              تفعيل الآن 🔔
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 max-h-[50vh]">
          {filteredNotifs.map((notif) => {
            const targetApt = notif.appointmentId ? appointments.find(a => a.id === notif.appointmentId) : null;
            const isCompleted = targetApt?.status === 'completed';

            return (
              <div
                key={notif.id}
                onClick={() => {
                  handleNotificationClick(notif);
                  onClose();
                }}
                className={`p-3 sm:p-3.5 rounded-2xl border transition cursor-pointer relative group flex flex-col gap-1.5 ${
                  notif.read
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-slate-300' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {notif.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatNotificationTime(notif)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="حذف هذا الإشعار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pr-4">
                  {notif.message}
                </p>

                {targetApt && isCompleted && (
                  <div className="pt-1 flex items-center justify-between pr-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRatingModal(targetApt);
                        onClose();
                      }}
                      className="text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      <span>{targetApt.rating ? 'تعديل تقييم الكشف' : 'تقييم كشفك الآن'}</span>
                    </button>
                    {targetApt.rating && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        تم التقييم ({targetApt.rating} ⭐)
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredNotifs.length === 0 && (
            <div className="py-10 text-center flex flex-col items-center gap-2 text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-300" />
              <span>
                {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'صندوق الإشعارات فارغ حالياً'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions: Test Notification + Close */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSendTestNotification}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-600" />
            <span>تجربة إرسال إشعار فوري (صوت + تنبيه) 🧪</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
