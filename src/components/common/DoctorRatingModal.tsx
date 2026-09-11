import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Star, X, CheckCircle2, MessageSquare, Award, Sparkles, Send, Trash2, AlertTriangle } from 'lucide-react';
import { Appointment } from '../../types';

interface DoctorRatingModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const DoctorRatingModal: React.FC<DoctorRatingModalProps> = ({
  appointment,
  onClose
}) => {
  const { rateAppointment, deleteDoctorReview, doctors } = useClinic();

  const isEditMode = !!appointment?.rating;
  const [rating, setRating] = useState<number>(appointment?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(appointment?.reviewComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!appointment) return null;

  const doctor = doctors.find(d => d.id === appointment.doctorId);

  const ratingDescriptions: Record<number, { text: string; color: string }> = {
    1: { text: 'يحتاج لتحسين', color: 'text-rose-600' },
    2: { text: 'مقبول', color: 'text-amber-600' },
    3: { text: 'جيد', color: 'text-amber-700' },
    4: { text: 'جيد جداً', color: 'text-emerald-600' },
    5: { text: 'ممتاز وفائق الاحترافية 🌟', color: 'text-emerald-700' }
  };

  const quickTags = [
    'دقة المواعيد والالتزام',
    'تعامل راقي ومحترم',
    'علاج بدون ألم',
    'تعقيم ونظافة متميزة',
    'شرح وافٍ لخطة العلاج',
    'راحة نفسية تامة'
  ];

  const handleTagClick = (tag: string) => {
    if (comment.includes(tag)) {
      setComment(prev => prev.replace(tag, '').replace(/،\s*$/, '').trim());
    } else {
      setComment(prev => (prev ? `${prev}، ${tag}` : tag));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    rateAppointment(appointment.id, appointment.doctorId, rating, comment.trim());
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = () => {
    deleteDoctorReview(appointment.id);
    onClose();
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in duration-200"
        dir="rtl"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {isEditMode ? 'تعديل تقييم تجربة الكشف' : 'تقييم تجربة الكشف الطبي'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isEditMode ? 'يمكنك تحديث النجوم، كتابة ملاحظات جديدة، أو حذف التقييم' : 'رأيك حقيقي ويوثق مباشرة في تقييمات المركز'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Doctor and Visit Details Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200/80 shadow-xs">
            <img
              src={doctor?.avatar || '/assets/images/doctors/dr_fawzy.jpg'}
              alt={appointment.doctorName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80';
              }}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm truncate">
                {appointment.doctorName}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                تم الكشف ✓
              </span>
            </div>
            <span className="text-xs text-sky-700 font-bold mt-0.5">
              {doctor?.specialty || 'طبيب بالمركز'}
            </span>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>{appointment.serviceName}</span>
              <span>•</span>
              <span>{appointment.date}</span>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Box (if triggered) */}
        {showDeleteConfirm ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-rose-900">تأكيد حذف التقييم:</span>
                <span className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                  هل أنت متأكد من رغبتك في حذف هذا التقييم تماماً؟ ستتم إزالته من سجل المركز.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، احذف التقييم</span>
              </button>
            </div>
          </div>
        ) : (
          /* Rating Stars Input */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center py-2 bg-amber-50/50 rounded-2xl border border-amber-100/70">
              <span className="text-xs font-bold text-slate-600 mb-2">
                {isEditMode ? 'تعديل التقييم لمستوى الخدمة والرعاية الطبية:' : 'ما هو تقييمك لمستوى الخدمة والرعاية الطبية؟'}
              </span>

              <div className="flex items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= currentDisplayRating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="h-5 flex items-center justify-center mt-1">
                <span className={`text-xs font-black ${ratingDescriptions[currentDisplayRating]?.color || 'text-slate-700'}`}>
                  {ratingDescriptions[currentDisplayRating]?.text}
                </span>
              </div>
            </div>

            {/* Quick Tag Pills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700">
                اختر ما ميّز زيارتك (اختياري):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => {
                  const isSelected = comment.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>اكتب رأيك وملاحظاتك:</span>
                <span className="text-[10px] text-slate-400 font-normal">يساعد المرضى الآخرين</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تعليقك حول تعامل الطبيب، دقة المواعيد، وراحة الجلسة..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEditMode ? 'حفظ تعديلات التقييم ⭐' : 'إرسال التقييم واعتماده'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              {/* If already rated, show Delete option */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-rose-200/60 mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف هذا التقييم تماماً</span>
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
