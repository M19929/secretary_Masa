import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ClinicGoogleMap } from '../common/ClinicGoogleMap';
import {
  ChevronLeft,
  Cpu,
  Users,
  Sparkles,
  HeartHandshake,
  PhoneCall,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Award,
  Code2,
  Facebook,
  ExternalLink,
  Star,
  Trash2,
  Edit3,
  Image as ImageIcon,
  X
} from 'lucide-react';

export const ClientAbout: React.FC = () => {
  const {
    clinicInfo,
    showToast,
    setClientTab,
    doctorReviews,
    appointments,
    currentUser,
    openRatingModal,
    deleteDoctorReview,
    clinicGallery
  } = useClinic();

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [aboutGalleryTab, setAboutGalleryTab] = useState('الكل');

  // Check if current user has any completed appointment awaiting rating
  const userCompletedApts = appointments.filter(
    a => a.status === 'completed' && (!currentUser || a.patientPhone === currentUser.phone || a.patientName === currentUser.name)
  );
  const unratedApt = userCompletedApts.find(a => !a.rating);
  const ratedApt = userCompletedApts.find(a => a.rating);

  // Helper to determine if the URL is a direct video file (.mp4, .webm, blob, local asset)
  const isDirectVideoFile = (url: string) => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.mov') ||
      lower.startsWith('/assets/') ||
      lower.startsWith('blob:') ||
      lower.startsWith('data:video')
    );
  };

  const features = [
    {
      title: 'أحدث الأجهزة',
      description: 'تقنيات ليزر ومسح رقمي 3D متقدمة',
      icon: <Cpu className="w-6 h-6 text-amber-600" />
    },
    {
      title: 'أطباء متخصصون',
      description: 'نخبة من الاستشاريين والأخصائيين المعتمدين',
      icon: <Users className="w-6 h-6 text-amber-600" />
    },
    {
      title: 'تعقيم عالي الجودة',
      description: 'معايير تعقيم طبية صارمة ومطابقة لأعلى المواصفات',
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />
    },
    {
      title: 'رعاية شاملة',
      description: 'متابعة دورية واهتمام دقيق برضا المريض',
      icon: <HeartHandshake className="w-6 h-6 text-amber-600" />
    }
  ];

  return (
    <div className="flex flex-col gap-4 pb-6" dir="rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setClientTab('home')}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
          عن المركز
        </h2>

        <div className="w-8"></div>
      </div>

      {/* Hero Image with Center Logo & Identity */}
      <div className="relative rounded-3xl overflow-hidden shadow-md h-52 sm:h-60 bg-slate-900 flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80"
          alt="مركز دكتور محمد فوزى الماسة"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col items-center justify-end p-5 text-center">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-white font-black text-xs sm:text-sm">
              مركز د. محمد فوزي الماسة
            </span>
          </div>
        </div>
      </div>

      {/* Center Description */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#08284d] p-1 shadow-md shadow-sky-950/20 mb-1">
          <img 
            src="/assets/masa_logo.svg" 
            alt="Masa Clinic Logo" 
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
        <h3 className="font-black text-slate-900 text-base sm:text-lg">
          مركز دكتور محمد فوزى الماسة
        </h3>
        <p className="text-xs font-bold text-sky-600">masa • لتجميل وزراعة الأسنان - المحلة الكبرى</p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          نحن نؤمن أن الإبتسامة الجميلة تبدأ من هنا. نقدم أحدث التقنيات وأفضل الخدمات بإشراف د. محمد فوزي ونخبة من أطباء واستشاريي الأسنان المتخصصين لضمان راحتك وصحة أسنانك بأعلى درجات الأمان والجمال.
        </p>

        {/* Social Media and Official WhatsApp Links */}
        <div className="grid grid-cols-2 gap-2.5 w-full pt-3 mt-2 border-t border-slate-100">
          <a
            href={clinicInfo.facebookUrl || 'https://www.facebook.com/share/1KL7zrcN3G/'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-black text-xs transition border border-[#1877F2]/20 shadow-xs cursor-pointer group"
          >
            <Facebook className="w-4 h-4 fill-[#1877F2]" />
            <span>صفحة الفيسبوك</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition" />
          </a>

          <a
            href={`https://wa.me/201101722551?text=${encodeURIComponent('السلام عليكم، أود الاستفسار وحجز موعد في مركز دكتور محمد فوزي الماسة لطب وجراحة الأسنان')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-black text-xs transition border border-[#25D366]/30 shadow-xs cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
              <PhoneCall className="w-3 h-3 fill-white text-white" />
            </div>
            <span>محادثة واتساب</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition" />
          </a>
        </div>
      </div>

      {/* 4 Feature Grid */}
      <div className="grid grid-cols-2 gap-3">
        {features.map((feat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2 hover:border-amber-200 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              {feat.icon}
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {feat.title}
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              {feat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Clinic Photos Gallery Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                معرض صور وتجهيزات المركز والعيادات
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                تجهيزات طبية عالمية وعيادات كشف مجهزة بأحدث التقنيات
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
            {clinicGallery.length} صور
          </span>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['الكل', 'تجهيزات المركز', 'عيادات الكشف', 'حالات قبل وبعد', 'فريق العمل'].map((cat) => (
            <button
              key={cat}
              onClick={() => setAboutGalleryTab(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                aboutGalleryTab === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {clinicGallery
            .filter(p => aboutGalleryTab === 'الكل' || p.category === aboutGalleryTab)
            .map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-bold">
                    {photo.category}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-amber-600 transition">
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Lightbox Modal for Photo Zoom */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-800">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-white">{selectedPhoto.title}</span>
                <span className="text-xs text-amber-400">{selectedPhoto.category}</span>
              </div>
              <span className="text-[11px] text-slate-400">مركز د. محمد فوزي الماسة</span>
            </div>
          </div>
        </div>
      )}

      {/* Real Patient Reviews & Honest Feedback Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                آراء وتقييمات مرضانا الحقيقية
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                تقييمات فعلية بعد إتمام الكشف الطبي
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            تقييمات حقيقية 100%
          </span>
        </div>

        {doctorReviews.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {doctorReviews.slice(0, 6).map((rev) => {
              const matchedApt = appointments.find(
                a => a.id === rev.appointmentId || 
                     (rev.appointmentCode && a.appointmentCode === rev.appointmentCode) ||
                     (currentUser && a.patientPhone === currentUser.phone && a.doctorId === rev.doctorId)
              );
              const isUserReview = currentUser && (
                rev.patientName === currentUser.name ||
                Boolean(matchedApt && matchedApt.patientPhone === currentUser.phone)
              );

              return (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{rev.patientName}</span>
                      <span className="text-[10px] text-slate-400">عن زيارة: {rev.doctorName}</span>
                      {isUserReview && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                          تقييمك الشخصي
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      ))}
                      <span className="text-[11px] font-bold text-amber-900 mr-1">({rev.rating}/5)</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed italic bg-white p-2 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                    <span>كشف معتمد بالمركز ✓</span>
                    <div className="flex items-center gap-3">
                      {isUserReview && matchedApt && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openRatingModal(matchedApt)}
                            className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم؟')) {
                                deleteDoctorReview(matchedApt.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      )}
                      <span>{rev.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-5 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 space-y-1">
            <p className="font-bold text-slate-800 text-sm">التقييمات بالمركز حقيقية بنسبة 100% 🌟</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
              لا نستخدم تقييمات وهمية مسبقة. يتم إرسال إشعار التقييم للمريض تلقائياً بعد إتمام كشفه وجلسته الطبية لتوثيق رأيه الصادق.
            </p>
          </div>
        )}

        {/* Call to rate for completed patients */}
        {unratedApt ? (
          <button
            onClick={() => openRatingModal(unratedApt)}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>هل أتممت كشفاً بالمركز؟ شاركنا تقييمك الآن ⭐</span>
          </button>
        ) : ratedApt ? (
          <button
            onClick={() => openRatingModal(ratedApt)}
            className="w-full py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>لقد قيّمت زيارتك السابقة - اضغط هنا لتعديل تقييمك أو حذفه</span>
          </button>
        ) : null}
      </div>

      {/* Google Map & Interactive Clinic Navigation */}
      <ClinicGoogleMap height="360px" />

      {/* Developer Credit Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 rounded-3xl border border-amber-500/30 text-white shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-sm">
            <Code2 className="w-5 h-5 text-slate-900" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold">تطوير وبرمجة النظام والتطبيق:</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">معتمد ✓</span>
            </div>
            <span className="text-sm font-black text-white">بشمهندس مسعد العبيدو</span>
            <a href="tel:01026031803" className="text-xs font-bold text-amber-300 hover:text-amber-200 transition">
              موبايل / واتساب: 01026031803
            </a>
          </div>
        </div>
      </div>

      {/* Primary CTA button */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={() => {
            const whatsappUrl = `https://wa.me/201101722551?text=${encodeURIComponent('السلام عليكم، أود الاستفسار وحجز موعد في مركز دكتور محمد فوزي الماسة لطب وجراحة الأسنان')}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <PhoneCall className="w-3.5 h-3.5 fill-white text-white" />
          </div>
          <span>تواصل معنا مباشرة عبر واتساب (01101722551)</span>
        </button>
      </div>

    </div>
  );
};
