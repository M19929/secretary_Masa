import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  HeartPulse,
  History,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface SendFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatient?: {
    name: string;
    phone: string;
    notes?: string;
  } | null;
}

interface FollowupTemplate {
  id: string;
  category: 'surgery' | 'whitening' | 'reminder' | 'billing' | 'general';
  icon: string;
  label: string;
  title: string;
  templateText: (patientName: string) => string;
}

const TEMPLATES: FollowupTemplate[] = [
  {
    id: 'surgery',
    category: 'surgery',
    icon: '🦷',
    label: 'متابعة بعد خلع أو جراحة',
    title: 'متابعة طبية هامة بعد إجراء اليوم',
    templateText: (name) =>
      `السلام عليكم أ/ ${name}، نتمنى لك دوام الصحة والعافية. نطمئن على حالتك بعد إجراء اليوم في مركز د. محمد فوزي الماسة لطب وجراحة الأسنان. نذكرك بضرورة الالتزام بالمسكنات والعلاجات الموصوفة، والكمادات الباردة، وتجنب المشروبات الساخنة والتدخين اليوم. في حال وجود أي ألم غير معتاد أو نزيف نحن بجانبك دائماً للاطمئنان عليك.`
  },
  {
    id: 'root_canal',
    category: 'general',
    icon: '⚡',
    label: 'متابعة بعد علاج عصب أو حشو',
    title: 'الاطمئنان على سلامتك بعد جلسة الحشو والعلاج',
    templateText: (name) =>
      `مرحباً أ/ ${name}، نود الاطمئنان على راحتك بعد جلسة علاج الأسنان اليوم. قد تشعر بحساسية بسيطة مؤقتة مع المضغ وهي استجابة طبيعية تزول سريعاً. يرجى تجنب تناول الأطعمة الصلبة على الجانب المعالج، والتواصل معنا فوراً إذا شعرت بأي استفسار.`
  },
  {
    id: 'whitening',
    category: 'whitening',
    icon: '💎',
    label: 'متابعة بعد تبييض أو تنظيف',
    title: 'تعليمات الحفاظ على ابتسامتك الماسية',
    templateText: (name) =>
      `أهلاً أ/ ${name}، نرجو أن تكون ابتسامتك الجديدة قد نالت إعجابك! نذكرك بأهمية تجنب المشروبات الصابغة (الشاي، القهوة، الكولا) والأطعمة الملونة والتدخين لمدة 48 ساعة للحفاظ على أفضل وأطول نتيجة تبييض ناصعة.`
  },
  {
    id: 'reminder',
    category: 'reminder',
    icon: '📅',
    label: 'تذكير بموعد جلسة المتابعة',
    title: 'تذكير بموعد جلسة المتابعة الدورية',
    templateText: (name) =>
      `عزيزنا أ/ ${name}، نود تذكيرك بموعد جلستك القادمة للمتابعة في مركز د. محمد فوزي الماسة. انتظامك في مواعيد الجلسات يضمن لك أسرع تعافي وأفضل نتائج علاجية. نتشرف دائماً بخدمتك.`
  },
  {
    id: 'billing',
    category: 'billing',
    icon: '💳',
    label: 'تذكير راقٍ بقسط علاجي مستحق',
    title: 'تذكير بموعد استحقاق القسط العلاجي',
    templateText: (name) =>
      `تحية طيبة أ/ ${name}، نود تذكيرك بلطف بموعد استحقاق القسط العلاجي في مركز الماسة. يمكنك السداد عبر مكتب الاستقبال في المركز أو بالتحويل الإلكتروني عبر فودافون كاش أو إنستاباي لراحتك. شكراً جزيلاً لثقتكم بنا.`
  },
  {
    id: 'general',
    category: 'general',
    icon: '🩺',
    label: 'استفسار عام عن صحة الفم',
    title: 'متابعة دورية من مركز د. محمد فوزي الماسة',
    templateText: (name) =>
      `مرحباً أ/ ${name}، يتمنى لكم فريق مركز د. محمد فوزي الماسة دوام الصحة والعافية. نتواصل معكم للاطمئنان على صحة أسنانكم وراحتكم، ويسعدنا دائماً استقبال أي استفسار أو حجز موعد فحص دوري.`
  }
];

export const SendFollowupModal: React.FC<SendFollowupModalProps> = ({
  isOpen,
  onClose,
  initialPatient
}) => {
  const {
    patients,
    appointments,
    registeredUsers,
    notifications,
    sendPrivateFollowupMessage,
    showToast
  } = useClinic();

  // Combine unique patient directory from patients, appointments, registered users
  const patientDirectory = useMemo(() => {
    const map = new Map<string, { name: string; phone: string }>();

    patients.forEach(p => {
      if (p.phone) {
        map.set(p.phone.trim(), { name: p.name, phone: p.phone.trim() });
      }
    });

    appointments.forEach(a => {
      if (a.patientPhone && !map.has(a.patientPhone.trim())) {
        map.set(a.patientPhone.trim(), { name: a.patientName, phone: a.patientPhone.trim() });
      }
    });

    registeredUsers.forEach(u => {
      if (u.phone && !map.has(u.phone.trim()) && u.role === 'patient') {
        map.set(u.phone.trim(), { name: u.name, phone: u.phone.trim() });
      }
    });

    return Array.from(map.values());
  }, [patients, appointments, registeredUsers]);

  // Selected patient state
  const [selectedPatient, setSelectedPatient] = useState<{ name: string; phone: string } | null>(() => {
    if (initialPatient) {
      return { name: initialPatient.name, phone: initialPatient.phone };
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState(initialPatient?.name || '');
  const [customPhone, setCustomPhone] = useState(initialPatient?.phone || '');
  const [selectedCategory, setSelectedCategory] = useState<FollowupTemplate['category']>('general');
  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [message, setMessage] = useState(() => TEMPLATES[0].templateText(initialPatient?.name || 'العميل'));
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Sync initial patient if modal opens with new props
  React.useEffect(() => {
    if (initialPatient) {
      setSelectedPatient({ name: initialPatient.name, phone: initialPatient.phone });
      setCustomName(initialPatient.name);
      setCustomPhone(initialPatient.phone);
      setMessage(TEMPLATES[0].templateText(initialPatient.name));
    }
  }, [initialPatient]);

  if (!isOpen) return null;

  const activePhone = selectedPatient ? selectedPatient.phone : customPhone.trim();
  const activeName = selectedPatient ? selectedPatient.name : (customName.trim() || 'المريض');

  // Filter existing follow-up history for this patient
  const patientFollowupHistory = notifications.filter(
    n => n.patientPhone === activePhone && (n.type === 'private_message' || n.type === 'followup')
  );

  const handleSelectTemplate = (tpl: FollowupTemplate) => {
    setSelectedCategory(tpl.category);
    setTitle(tpl.title);
    const firstName = activeName.split(' ')[0] || activeName;
    setMessage(tpl.templateText(firstName));
  };

  const handleSelectPatientFromDirectory = (p: { name: string; phone: string }) => {
    setSelectedPatient(p);
    setCustomName(p.name);
    setCustomPhone(p.phone);
    const firstName = p.name.split(' ')[0] || p.name;
    const currentTpl = TEMPLATES.find(t => t.category === selectedCategory) || TEMPLATES[0];
    setMessage(currentTpl.templateText(firstName));
  };

  const cleanEgyptianPhoneForWhatsApp = (rawPhone: string) => {
    let clean = rawPhone.replace(/\D/g, '');
    if (clean.startsWith('01')) {
      clean = '2' + clean;
    } else if (clean.startsWith('1') && clean.length === 10) {
      clean = '20' + clean;
    }
    return clean;
  };

  const handleSendInApp = async () => {
    if (!activePhone) {
      showToast('يرجى تحديد أو إدخال رقم هاتف المريض');
      return;
    }
    if (!title.trim() || !message.trim()) {
      showToast('يرجى كتابة عنوان ونص الرسالة');
      return;
    }

    setIsSending(true);
    try {
      await sendPrivateFollowupMessage({
        patientPhone: activePhone,
        patientName: activeName,
        title: title.trim(),
        message: message.trim(),
        category: selectedCategory
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!activePhone) {
      showToast('يرجى تحديد أو إدخال رقم هاتف المريض');
      return;
    }
    const cleanPhone = cleanEgyptianPhoneForWhatsApp(activePhone);
    const fullText = `*${title.trim()}*\n\n${message.trim()}\n\n_مركز د. محمد فوزي الماسة لطب وجراحة الأسنان_`;
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(fullText)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendBoth = async () => {
    if (!activePhone) {
      showToast('يرجى تحديد أو إدخال رقم هاتف المريض');
      return;
    }
    setIsSending(true);
    try {
      await sendPrivateFollowupMessage({
        patientPhone: activePhone,
        patientName: activeName,
        title: title.trim(),
        message: message.trim(),
        category: selectedCategory
      });
      handleOpenWhatsApp();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const filteredDirectory = patientDirectory.filter(
    p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4 border border-slate-100 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/20 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  إرسال رسالة متابعة خاصة لمريض
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  خاص ومباشر
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تصل الرسالة كإشعار فوري داخل حساب المريض، مع خيار الإرسال المباشر على واتساب بنقرة واحدة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patient Selection Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" />
              <span>المريض المستلم للمتابعة:</span>
            </span>
            {selectedPatient && (
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
              >
                تغيير المريض
              </button>
            )}
          </div>

          {selectedPatient ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shrink-0">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{selectedPatient.name}</h4>
                  <span className="text-xs text-slate-500 font-mono" dir="ltr">{selectedPatient.phone}</span>
                </div>
              </div>

              {patientFollowupHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 flex items-center gap-1 transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>سجل المتابعات السابقة ({patientFollowupHistory.length})</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="ابحث في المرضى المسجلين (بالاسم أو رقم الموبايل)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />

              {searchQuery && (
                <div className="max-h-36 overflow-y-auto flex flex-col gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                  {filteredDirectory.length === 0 ? (
                    <p className="text-xs text-slate-400 p-2 text-center">لا يوجد مريض مطابق للبحث</p>
                  ) : (
                    filteredDirectory.slice(0, 5).map(p => (
                      <button
                        key={p.phone}
                        type="button"
                        onClick={() => handleSelectPatientFromDirectory(p)}
                        className="w-full text-right p-2 rounded-lg hover:bg-amber-50 flex items-center justify-between text-xs transition cursor-pointer"
                      >
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]" dir="ltr">{p.phone}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Or manual inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">اسم المريض</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="مثال: أحمد مصطفى"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم الهاتف (للواتساب والإشعار)</label>
                  <input
                    type="tel"
                    value={customPhone}
                    onChange={e => setCustomPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-amber-500 text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Previous follow-up history collapsible */}
        {showHistory && patientFollowupHistory.length > 0 && (
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 flex flex-col gap-2 max-h-40 overflow-y-auto">
            <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>رسائل المتابعة السابقة لهذا المريض:</span>
            </span>
            {patientFollowupHistory.map(hist => (
              <div key={hist.id} className="bg-white p-2.5 rounded-xl border border-sky-100 text-xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">{hist.title}</span>
                  <span className="text-slate-400 font-mono">{hist.createdAt ? new Date(hist.createdAt).toLocaleDateString('ar-EG') : hist.time}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{hist.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Dental Templates (أزرار القوالب الجاهزة) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>قوالب متابعة جاهزة لعيادة الأسنان (اختر بضغطة واحدة):</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2 ${
                  selectedCategory === tpl.category && title === tpl.title
                    ? 'bg-amber-500/15 border-amber-400 text-amber-950 font-black shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-lg shrink-0">{tpl.icon}</span>
                <span className="text-xs font-bold leading-snug">{tpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form: Title & Message */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان رسالة المتابعة:</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="عنوان الإشعار والمتابعة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">نص الرسالة الخاصة:</label>
              <span className="text-[10px] text-slate-400 font-mono">{message.length} حرف</span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="اكتب نص المتابعة الخاصة هنا..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
          {/* Send In-App */}
          <button
            type="button"
            disabled={isSending}
            onClick={handleSendInApp}
            className="w-full sm:flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>إرسال كإشعار خاص بالتطبيق</span>
          </button>

          {/* Open WhatsApp */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span>فتح بالواتساب 💬</span>
          </button>

          {/* Send Both */}
          <button
            type="button"
            disabled={isSending}
            onClick={handleSendBoth}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>إرسال بالتطبيق + واتساب</span>
          </button>
        </div>

      </div>
    </div>
  );
};
