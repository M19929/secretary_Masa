import React, { useState } from 'react';
import { Appointment, MedicalConsent, TreatmentPlanStage } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';
import { PatientSignatureRenderer } from '../common/PatientSignatureRenderer';
import { printElement } from '../../utils/printHelper';
import {
  FileText,
  Printer,
  CheckCircle2,
  X,
  AlertCircle,
  ShieldCheck,
  User,
  Calendar,
  Stethoscope,
  Trash2,
  PenTool,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  ListChecks,
  Coins,
  Send
} from 'lucide-react';

interface MedicalConsentModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const TREATMENT_PLAN_PRESETS = [
  {
    title: 'علاج عصب وبناء سن وطربوش زيركونيا',
    summary: 'خطة علاج تحفظي متكاملة تشمل إزالة التسوس، وسحب العصب وتطهير القنوات بأجهزة الروتاري، وبناء السن بدعامة فايبر، مع أخذ مقاس رقمي وتركيب تاج زيركونيا عالي الجودة والصلابة.',
    duration: '3 إلى 4 جلسات خلال أسبوعين',
    stages: [
      { stageName: 'جلسة فتح السن وإزالة العصب وتنظيف القنوات ووضع ضماد طبي', toothNumber: 'السن المتضرر', sessionsCount: 1, estimatedCost: 600, details: 'تخدير موضعي بدون ألم واستخدام تقنية الروتاري' },
      { stageName: 'جلسة حشو العصب النهائي بالثيرموبلاستيك وتصوير أشعة للتأكد', toothNumber: 'السن المتضرر', sessionsCount: 1, estimatedCost: 800, details: 'إغلاق القنوات الثلاثية بدقة تامة' },
      { stageName: 'بناء تاج السن وتركيب دعامة فايبر بوست وتجهيز وبرد السن', toothNumber: 'السن المتضرر', sessionsCount: 1, estimatedCost: 700, details: 'تهيئة السن للمقاس الرقمي' },
      { stageName: 'أخذ المقاس وتجربة وتثبيت طربوش الزيركونيا النهائي', toothNumber: 'السن المتضرر', sessionsCount: 1, estimatedCost: 2200, details: 'تطابق لوني وإطباق مثالي' }
    ]
  },
  {
    title: 'كورس تقويم الأسنان لتعديل الإطباق وتنسيق الابتسامة',
    summary: 'خطة تقويمية شاملة لتعديل تزاحم الأسنان وتصحيح العضة مع فحص دوري شهري وتركيب مثبت نهائي للحفاظ على النتائج.',
    duration: '12 إلى 18 شهراً',
    stages: [
      { stageName: 'فحص إكلينيكي وأشعة بانوراما وسيفالومتريك وأخذ مقاسات دراسية', toothNumber: 'الفكين', sessionsCount: 1, estimatedCost: 1000, details: 'دراسة خطة حركة الأسنان وتوقيت الشد' },
      { stageName: 'تنظيف وتلميع الأسنان وعلاج أي تسوسات قبل البدء', toothNumber: 'كامل الفم', sessionsCount: 1, estimatedCost: 500, details: 'تهيئة الفم واللثة للتقويم' },
      { stageName: 'تركيب حاصرات التقويم (Brackets) والأسلاك الأولية', toothNumber: 'الفكين العلوي والسفلي', sessionsCount: 1, estimatedCost: 5000, details: 'تركيب الحاصرات بدقة عالية' },
      { stageName: 'جلسات ضبط وشد دورية شهرية للمتابعة واستبدال الأسلاك', toothNumber: 'الفكين', sessionsCount: 12, estimatedCost: 6000, details: 'جلسة شهرية منتظمة' },
      { stageName: 'إزالة التقويم وتلميع الأسنان وتثبيت مثبت التقويم النهائي (Retainer)', toothNumber: 'الفكين', sessionsCount: 1, estimatedCost: 2000, details: 'مثبت شفاف ومعدني لمنع انتكاس الأسنان' }
    ]
  },
  {
    title: 'زراعة الأسنان الفورية وتثبيت التاج النهائي',
    summary: 'خطة زراعة سن جراحية متطورة باستخدام غرسات تيتانيوم ألمانية/سويسرية معتمدة مع التعويض بالتاج النهائي بعد الالتئام.',
    duration: '3 إلى 4 أشهر',
    stages: [
      { stageName: 'تصوير أشعة مقطعية ثلاثية الأبعاد (CBCT) وفحص كثافة العظم', toothNumber: 'موقع الغرس', sessionsCount: 1, estimatedCost: 800, details: 'تحديد مقاس وزاوية الزرعة المناسبة' },
      { stageName: 'غرس زرعة التيتانيوم جراحياً وتثبيت غطاء الشفاء (Healing Abutment)', toothNumber: 'موقع السن المفقود', sessionsCount: 1, estimatedCost: 9000, details: 'تخدير موضعي وبدون ألم' },
      { stageName: 'فحص ثبات الاندماج العظمي وتركيب الدعامة (Abutment)', toothNumber: 'موقع الزرعة', sessionsCount: 1, estimatedCost: 1500, details: 'التأكد من التئام العظم التام' },
      { stageName: 'أخذ المقاس الرقمي وتثبيت تاج الزيركونيا النهائي المصمم بالكمبيوتر', toothNumber: 'التاج النهائي', sessionsCount: 1, estimatedCost: 3500, details: 'مظهر طبيعي وقوة مضغ ممتازة' }
    ]
  },
  {
    title: 'تجميل الابتسامة وعدسات الفينير / إيماكس (Hollywood Smile)',
    summary: 'خطة تجميلية متكاملة لابتسامة هوليوود باستخدام عدسات إيماكس E-max فائقة الدقة لتعديل اللون والشكل وإغلاق الفراغات.',
    duration: '3 جلسات خلال 10 أيام',
    stages: [
      { stageName: 'تصميم الابتسامة الرقمي (Digital Smile Design) واختيار اللون', toothNumber: 'خط الابتسامة', sessionsCount: 1, estimatedCost: 800, details: 'محاكاة النتيجة قبل البدء' },
      { stageName: 'تحضير طفيف لطبقة المينا وأخذ المقاسات الرقمية وتركيب عدسات مؤقتة', toothNumber: 'الأسنان الأمامية', sessionsCount: 1, estimatedCost: 1200, details: 'حماية الأسنان ومطابقة الشكل' },
      { stageName: 'تجربة وتثبيت عدسات الفينير الإيماكس النهائية بمواد لاصقة متطورة', toothNumber: 'الأسنان الأمامية', sessionsCount: 1, estimatedCost: 15000, details: 'ابتسامة ناصعة ومثالية' }
    ]
  },
  {
    title: 'علاج اللثة وتنظيف الرواسب الجيرية وتلميع الأسنان',
    summary: 'جلسات علاجية متخصصة لإزالة الجير العميق وعلاج التهاب اللثة والجيوب اللثوية واستعادة صحة الفم واللثة.',
    duration: 'جلستان',
    stages: [
      { stageName: 'إزالة الجير السطحي والعميق تحت اللثة بالموجات فوق الصوتية', toothNumber: 'كامل الفم', sessionsCount: 1, estimatedCost: 600, details: 'تطهير الجيوب اللثوية وتطبيق مضاد موضعي' },
      { stageName: 'تلميع الأسنان وإزالة التصبغات الخارجية وتطبيق الفلورايد', toothNumber: 'كامل الفم', sessionsCount: 1, estimatedCost: 400, details: 'توجيهات العناية اليومية بالفرشاة والخيط' }
    ]
  }
];

const STANDARD_PROCEDURES_RISKS: Record<string, string[]> = {
  'زراعة الأسنان': [
    'أقر بأن الطبيب المعالج قد شرح لي بالتفصيل خطوات زراعة الأسنان الجراحية والتعويضية ونسبة النجاح المتوقعة.',
    'أقر بإبلاغ الطبيب بجميع الأمراض العامة وتاريخي الطبي وتناول أدوية السيولة أو هشاشة العظام (إن وجد).',
    'أوافق على الخضوع للأشعة التشخيصية (CBCT / البانوراما) والتخدير الموضعي المناسب.',
    'أتعهد بالالتزام التام بتعليمات العناية بنظافة الفم بعد الجراحة وتجنب التدخين لتفادي فشل الاندماج العظمي.',
    'أعلم أن مدة التئام الغرسة العظمية تتطلب فترة تتراوح بين 2 إلى 4 أشهر قبل التركيب النهائي للتاج.'
  ],
  'جراحة وخلع الأسنان': [
    'أقر بشرح الطبيب لطبيعة الخلع الجراحي وإمكانية حدوث تورم خفيف أو نزف موضعي مؤقت بعد الإجراء.',
    'أقر بعدم وجود حساسية للتخدير الموضعي أو المضادات الحيوية، وأبلغت الطبيب بأي أدوية أتناولها بانتظام.',
    'أتعهد بعدم المضمضة العنيفة أو البصق أو الشرب بالشفاط لمدة 24 ساعة للحفاظ على التجلط الدموي.',
    'أوافق على استخدام التخدير الموضعي المناسب وتناول الأدوية والمسكنات الموصوفة حسب تعليمات الطبيب.'
  ],
  'علاج الجذور والعصب': [
    'أقر بعلمي بأن علاج العصب يهدف للحفاظ على السن الطبيعي وقد يتطلب من جلسة إلى ثلاث جلسات.',
    'أقر بأن السن المعالج عصباً يصبح أكثر هشاشة ويحتاج لعمل دعامة وتاج (طربوش) لحمايته من الكسر.',
    'أوافق على التخدير الموضعي وتصوير الأشعة السينية أثناء الجلسة للتحقق من أطوال القنوات الجذرية.',
    'أتعهد بالحضور في المواعيد المحددة وعدم تأجيل حشو القنوات الدائم لتجنب تجدد العدوى البكتيرية.'
  ],
  'تقويم الأسنان': [
    'أقر بشرح الطبيب لخطة تقويم الأسنان، المدة الزمنية التقريبية، والأجهزة المستخدمة (شفافة أو معدنية).',
    'أتعهد بالحفاظ على نظافة الأقواس والأسنان وتنظيفها بفرشاة التقويم الخاصة بعد كل وجبة لتفادي التصبغ.',
    'أعلم أن كسر أو انفصال الحاصرات بسبب الأطعمة الصلبة يؤدي إلى تأخير موعد انتهاء العلاج.',
    'أتعهد بارتداء جهاز التثبيت (Retainer) بانتظام بعد انتهاء التقويم للحفاظ على النتيجة ومنع انتكاس الأسنان.'
  ],
  'تبييض الأسنان بالليزر': [
    'أقر بعلمي بأن التبييض الطبي يعتمد على إزالة التصبغات وقد يصاحبه تحسس مؤقت بالأسنان لعدة أيام.',
    'أتعهد بالامتناع التام عن المشروبات الملونة والتدخين لمدة 48 ساعة على الأقل بعد جلسة التبييض (White Diet).',
    'أعلم أن حشوات الأسنان القديمة والتيجان لا يتغير لونها بمواد التبييض وقد تحتاج لاستبدال لاحقاً لتطابق اللون.'
  ],
  'افتراضي': [
    'أقر بأن الطبيب المعالج قد شرح لي بالتفصيل الإجراء الطبي الموصى به والبدائل المتاحة والمضاعفات المحتملة.',
    'أقر بصحة بياناتي وتاريخي المرضي وعدم إخفاء أي أمراض مزمنة أو حساسية تجاه الأدوية والتخدير.',
    'أوافق بكامل إرادتي على إجراء الفحص وتلقي العلاج الموصى به واستخدام التخدير الموضعي اللازم.',
    'أتعهد باتباع تعليمات الطبيب وتناول الأدوية الموصوفة ومراجعة المركز في الموعد المحدد.'
  ]
};

export const MedicalConsentModal: React.FC<MedicalConsentModalProps> = ({
  appointment,
  onClose
}) => {
  const { saveMedicalConsent, deleteMedicalConsent, clinicInfo, showToast } = useClinic();

  // Find matching default procedure risks
  const getInitialRisks = () => {
    if (appointment.consent?.risksAcknowledged && appointment.consent.risksAcknowledged.length > 0) {
      return appointment.consent.risksAcknowledged;
    }
    const serviceName = appointment.serviceName || '';
    for (const [key, risks] of Object.entries(STANDARD_PROCEDURES_RISKS)) {
      if (key !== 'افتراضي' && serviceName.includes(key)) {
        return risks;
      }
    }
    return STANDARD_PROCEDURES_RISKS['افتراضي'];
  };

  const existingConsent = appointment.consent;

  const [procedureName, setProcedureName] = useState(
    existingConsent?.procedureName || appointment.serviceName || 'إجراء طبي علاجي'
  );
  const [patientNationalId, setPatientNationalId] = useState(
    existingConsent?.patientNationalId || appointment.patientNationalId || ''
  );
  const [doctorName, setDoctorName] = useState(
    existingConsent?.doctorName || appointment.doctorName || 'د. محمد فوزي'
  );
  const [procedureDetails, setProcedureDetails] = useState(
    existingConsent?.procedureDetails || `جلسة علاج وإجراء طبي لموعد كود (${appointment.appointmentCode})`
  );
  const [risks, setRisks] = useState<string[]>(getInitialRisks());
  const [newRiskText, setNewRiskText] = useState('');
  const [witnessName, setWitnessName] = useState(existingConsent?.witnessName || 'قسم الاستقبال والتمريض');
  const [notes, setNotes] = useState(existingConsent?.notes || '');

  // Treatment Plan States
  const [treatmentPlan, setTreatmentPlan] = useState(existingConsent?.treatmentPlan || '');
  const [treatmentPlanStages, setTreatmentPlanStages] = useState<TreatmentPlanStage[]>(
    existingConsent?.treatmentPlanStages || []
  );
  const [estimatedDuration, setEstimatedDuration] = useState(existingConsent?.estimatedDuration || '');
  const [totalEstimatedCost, setTotalEstimatedCost] = useState<number | string>(
    existingConsent?.totalEstimatedCost ?? ''
  );

  // New Stage Inputs
  const [stageName, setStageName] = useState('');
  const [stageToothNumber, setStageToothNumber] = useState('');
  const [stageSessionsCount, setStageSessionsCount] = useState<number>(1);
  const [stageCost, setStageCost] = useState<string>('');
  const [stageDetails, setStageDetails] = useState('');

  const [patientSignature, setPatientSignature] = useState<string | undefined>(
    existingConsent?.patientSignature
  );
  const [consentStatus, setConsentStatus] = useState<MedicalConsent['status']>(
    existingConsent?.status || 'draft'
  );
  const [isSigned, setIsSigned] = useState(
    existingConsent?.status === 'approved' || existingConsent?.status === 'signed' || existingConsent?.status === 'signed_by_patient' || Boolean(existingConsent?.patientSignature)
  );
  const [signatureType, setSignatureType] = useState<'paper_physical' | 'digital'>(
    existingConsent?.signatureType || (existingConsent?.patientSignature ? 'digital' : 'digital')
  );
  const [signatureMode, setSignatureMode] = useState<'digital' | 'paper'>(
    existingConsent?.signatureType === 'paper_physical' ? 'paper' : 'digital'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync internal form if appointment.consent gets updated
  React.useEffect(() => {
    if (appointment.consent) {
      if (appointment.consent.status) {
        setConsentStatus(appointment.consent.status);
      }
      setIsSigned(appointment.consent.status === 'approved' || appointment.consent.status === 'signed' || appointment.consent.status === 'signed_by_patient' || Boolean(appointment.consent.patientSignature));
      if (appointment.consent.patientSignature) {
        setPatientSignature(appointment.consent.patientSignature);
      }
      if (appointment.consent.signatureType) {
        setSignatureType(appointment.consent.signatureType);
        setSignatureMode(appointment.consent.signatureType === 'paper_physical' ? 'paper' : 'digital');
      }
      if (appointment.consent.procedureName) setProcedureName(appointment.consent.procedureName);
      if (appointment.consent.doctorName) setDoctorName(appointment.consent.doctorName);
      if (appointment.consent.patientNationalId) setPatientNationalId(appointment.consent.patientNationalId);
      if (appointment.consent.procedureDetails) setProcedureDetails(appointment.consent.procedureDetails);
      if (appointment.consent.witnessName) setWitnessName(appointment.consent.witnessName);
      if (appointment.consent.notes) setNotes(appointment.consent.notes);
      if (appointment.consent.risksAcknowledged?.length) setRisks(appointment.consent.risksAcknowledged);
      if (appointment.consent.treatmentPlan !== undefined) setTreatmentPlan(appointment.consent.treatmentPlan);
      if (appointment.consent.treatmentPlanStages) setTreatmentPlanStages(appointment.consent.treatmentPlanStages);
      if (appointment.consent.estimatedDuration !== undefined) setEstimatedDuration(appointment.consent.estimatedDuration);
      if (appointment.consent.totalEstimatedCost !== undefined) setTotalEstimatedCost(appointment.consent.totalEstimatedCost);
    }
  }, [appointment.consent]);

  const handleAddRisk = () => {
    if (!newRiskText.trim()) return;
    setRisks([...risks, newRiskText.trim()]);
    setNewRiskText('');
  };

  const handleRemoveRisk = (index: number) => {
    setRisks(risks.filter((_, i) => i !== index));
  };

  const handleAddStage = () => {
    if (!stageName.trim()) {
      showToast('يرجى كتابة اسم المرحلة أو الإجراء العلاجي أولاً');
      return;
    }

    const newStage: TreatmentPlanStage = {
      id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stageName: stageName.trim(),
      toothNumber: stageToothNumber.trim() || undefined,
      sessionsCount: Number(stageSessionsCount) > 0 ? Number(stageSessionsCount) : 1,
      estimatedCost: stageCost ? Number(stageCost) : undefined,
      details: stageDetails.trim() || undefined,
      status: 'pending'
    };

    const updated = [...treatmentPlanStages, newStage];
    setTreatmentPlanStages(updated);

    // Auto-update total estimated cost if empty or previously matching
    const oldSum = treatmentPlanStages.reduce((acc, s) => acc + (Number(s.estimatedCost) || 0), 0);
    const currTotal = Number(totalEstimatedCost);
    if (!totalEstimatedCost || currTotal === oldSum) {
      const newSum = updated.reduce((acc, s) => acc + (Number(s.estimatedCost) || 0), 0);
      if (newSum > 0) setTotalEstimatedCost(newSum);
    }

    // Reset fields
    setStageName('');
    setStageToothNumber('');
    setStageSessionsCount(1);
    setStageCost('');
    setStageDetails('');
    showToast('تمت إضافة المرحلة بنجاح إلى الخطة العلاجية ✓');
  };

  const handleRemoveStage = (id: string) => {
    const updated = treatmentPlanStages.filter(s => s.id !== id);
    setTreatmentPlanStages(updated);
    // Recalculate if it matched
    const newSum = updated.reduce((acc, s) => acc + (Number(s.estimatedCost) || 0), 0);
    if (newSum > 0) setTotalEstimatedCost(newSum);
  };

  const handleApplyPresetPlan = (presetIndex: number) => {
    const preset = TREATMENT_PLAN_PRESETS[presetIndex];
    if (!preset) return;
    setTreatmentPlan(preset.summary);
    setEstimatedDuration(preset.duration);
    const newStages: TreatmentPlanStage[] = preset.stages.map((st, i) => ({
      id: `preset-st-${Date.now()}-${i}`,
      stageName: st.stageName,
      toothNumber: st.toothNumber,
      sessionsCount: st.sessionsCount,
      estimatedCost: st.estimatedCost,
      details: st.details,
      status: 'pending'
    }));
    setTreatmentPlanStages(newStages);
    const total = newStages.reduce((acc, s) => acc + (s.estimatedCost || 0), 0);
    setTotalEstimatedCost(total);
    showToast(`تم تطبيق نموذج "${preset.title}" بنجاح 📋`);
  };

  const handleSave = async (targetStatus?: MedicalConsent['status'] | boolean) => {
    setIsSaving(true);
    setSuccessNotice(null);
    try {
      let finalStatus: MedicalConsent['status'] = consentStatus;
      if (typeof targetStatus === 'string') {
        finalStatus = targetStatus;
      } else if (targetStatus === true) {
        finalStatus = 'approved';
      } else if (targetStatus === false) {
        finalStatus = 'draft';
      } else {
        finalStatus = consentStatus || 'draft';
      }

      const activeSignatureType = patientSignature ? 'digital' : signatureType;
      const consentObj: MedicalConsent = {
        id: existingConsent?.id || `consent-${appointment.id}-${Date.now()}`,
        appointmentId: appointment.id,
        appointmentCode: appointment.appointmentCode,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        procedureName: procedureName.trim() || 'إجراء طبي علاجي',
        doctorName: doctorName.trim() || 'د. محمد فوزي',
        date: appointment.date,
        procedureDetails: procedureDetails.trim(),
        risksAcknowledged: risks,
        status: finalStatus,
        signatureType: activeSignatureType,
        witnessName: witnessName.trim() || 'قسم الاستقبال والتمريض',
        createdAt: existingConsent?.createdAt || new Date().toISOString()
      };

      if (treatmentPlan.trim()) {
        consentObj.treatmentPlan = treatmentPlan.trim();
      }
      if (treatmentPlanStages.length > 0) {
        consentObj.treatmentPlanStages = treatmentPlanStages;
      }
      if (estimatedDuration.trim()) {
        consentObj.estimatedDuration = estimatedDuration.trim();
      }
      if (totalEstimatedCost !== '' && Number(totalEstimatedCost) > 0) {
        consentObj.totalEstimatedCost = Number(totalEstimatedCost);
      }

      if (patientSignature) {
        consentObj.patientSignature = patientSignature;
      } else if (existingConsent?.patientSignature) {
        consentObj.patientSignature = existingConsent.patientSignature;
      }

      if (existingConsent?.touchStrokes) {
        consentObj.touchStrokes = existingConsent.touchStrokes;
      }

      if (existingConsent?.signerName) {
        consentObj.signerName = existingConsent.signerName;
      }

      if (existingConsent?.signedAt) {
        consentObj.signedAt = existingConsent.signedAt;
      }

      if (patientNationalId.trim()) {
        consentObj.patientNationalId = patientNationalId.trim();
      }
      if (notes.trim()) {
        consentObj.notes = notes.trim();
      }

      if (finalStatus === 'sent_to_patient') {
        consentObj.sentToPatientAt = new Date().toISOString();
        consentObj.sentBy = 'السكرتارية';
      } else if (finalStatus === 'approved') {
        consentObj.approvedAt = new Date().toISOString();
        consentObj.approvedBy = 'السكرتارية';
        if (!consentObj.signedAt) {
          consentObj.signedAt = new Date().toISOString();
        }
      } else if (patientSignature && !consentObj.signedAt) {
        consentObj.signedAt = new Date().toISOString();
      }

      await saveMedicalConsent(appointment.id, consentObj);
      setConsentStatus(finalStatus);
      setIsSigned(finalStatus === 'approved' || finalStatus === 'signed' || Boolean(patientSignature));

      if (finalStatus === 'sent_to_patient') {
        setSuccessNotice('تم إرسال الإقرار والخطة العلاجية للمريض بنجاح! سيظهر له إشعار فوري بالتطبيق للتوقيع الإلكتروني 📲');
        showToast('تم إرسال الإقرار والخطة للمريض للتوقيع 📲');
      } else if (finalStatus === 'approved') {
        setSuccessNotice('تم اعتماد وتوثيق الإقرار رسمياً بختم المركز ✓ تم تفعيل الاعتماد وإرسال إشعار للمريض');
        showToast('تم اعتماد وتوثيق الإقرار رسمياً ✓');
      } else if (finalStatus === 'draft') {
        setSuccessNotice('تم حفظ مسودة الإقرار والخطة العلاجية بنجاح 💾');
        showToast('تم حفظ المسودة بنجاح');
      } else {
        setSuccessNotice('تم حفظ الإقرار الطبي بنجاح ✓');
      }
    } catch (err) {
      console.error('Save consent error:', err);
      showToast('حدث خطأ أثناء حفظ الإقرار');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPaper = (preferPopup: boolean = false) => {
    // Save draft in background without blocking print gesture
    handleSave(isSigned).catch(console.error);
    showToast(preferPopup ? 'جارٍ فتح الإقرار في نافذة طباعة مخصصة 🖨️...' : 'جارٍ فتح نافذة الطباعة 🖨️...');
    printElement('printable-medical-consent-sheet', {
      title: `إقرار موافقة طبية مستنيرة - ${appointment.patientName}`,
      preferPopup
    });
  };

  const handleConfirmPhysicalSignature = async () => {
    await handleSave(true);
    showToast('تم توثيق توقيع المريض واستلام الورقة بنجاح ✓ تظهر الآن في الحجز');
  };

  const handleDeleteConsent = async () => {
    if (window.confirm('هل تريد بالتأكيد حذف الإقرار الطبي لهذا الموعد؟')) {
      setIsSaving(true);
      await deleteMedicalConsent(appointment.id);
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:m-0">
        
        {/* Header - Screen only */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-50 to-teal-500/10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  إقرار وموافقة طبية مستنيرة (Medical Consent)
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  consentStatus === 'approved' || consentStatus === 'signed' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : consentStatus === 'signed_by_patient'
                    ? 'bg-blue-100 text-blue-900 border-blue-400 animate-pulse'
                    : consentStatus === 'sent_to_patient'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {consentStatus === 'approved' || consentStatus === 'signed' 
                    ? 'معتمد وموثق رسمياً ✓' 
                    : consentStatus === 'signed_by_patient'
                    ? '✍️ وقعه المريض (مطلوب اعتمادك!)'
                    : consentStatus === 'sent_to_patient'
                    ? '📲 أُرسل للمريض للتوقيع'
                    : '📝 مسودة قيد الإعداد'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                المريض: {appointment.patientName} | كود الحجز: {appointment.appointmentCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow State Guidance Banners (Screen only) */}
        {consentStatus === 'signed_by_patient' && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <div className="font-black text-blue-950 text-sm">قام المريض بتوقيع هذا الإقرار والخطة العلاجية إلكترونياً! ✍️</div>
                <div className="text-blue-800 text-xs">يرجى مراجعة تفاصيل التوقيع أدناه، ثم الضغط على زر "اعتماد وتوثيق الإقرار رسمياً ✓".</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSave('approved')}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>اعتماد وتوثيق الإقرار الآن ✓</span>
            </button>
          </div>
        )}

        {consentStatus === 'sent_to_patient' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-950 flex items-center gap-2 print:hidden">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              📲 تم إرسال هذا الإقرار للمريض للتوقيع وهو بانتظار توقيعه الإلكتروني عبر التطبيق أو الموقع حالياً.
            </span>
          </div>
        )}

        {(consentStatus === 'approved' || consentStatus === 'signed') && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-950 flex items-center gap-2 print:hidden">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              ✓ هذا الإقرار معتمد وموثق رسمياً بختم المركز وإمضاء الإدارة والمريض.
            </span>
          </div>
        )}

        {consentStatus === 'draft' && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 text-xs text-slate-700 flex items-center gap-2 print:hidden">
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              📝 مسودة إقرار: أضف تفاصيل الخطة العلاجية ثم اضغط على زر [إرسال الإقرار للمريض للتوقيع 📲].
            </span>
          </div>
        )}

        {/* Success Alert Banner (Screen only) */}
        {successNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-bold text-emerald-800 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 print:overflow-visible print:p-0">
          
          {/* ============================================================== */}
          {/* PRINTABLE CONSENT SHEET (Rendered identically for Screen & Print) */}
          {/* ============================================================== */}
          <div id="printable-medical-consent-sheet" className="border border-slate-300 rounded-2xl p-6 sm:p-8 bg-white shadow-xs print:border-2 print:border-slate-800 print:rounded-none print:p-8">
            
            {/* Clinic Official Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl border-2 border-amber-400 shadow-sm print:border-black">
                  💎
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-950 font-['Cairo']">
                    {clinicInfo.name}
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    {clinicInfo.subtitle || 'لطب وجراحة وزراعة الأسنان وتجميل الابتسامة'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {clinicInfo.address} | هاتف: {clinicInfo.phones?.[0] || clinicInfo.phoneDisplay || clinicInfo.phone || '01101722551'}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">كود الموعد: {appointment.appointmentCode}</div>
                <div className="text-xs text-slate-600">التاريخ: {appointment.date}</div>
                <div className="text-[10px] text-slate-400">وثيقة إقرار قانونية وطبية</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-4 py-2 bg-slate-100 rounded-xl print:bg-slate-200 border border-slate-200">
              <h2 className="text-base sm:text-lg font-black text-slate-950">
                إقرار وموافقة طبية مستنيرة على إجراء علاجي أو جراحي
              </h2>
              <p className="text-xs text-slate-600 font-bold font-sans">
                Informed Medical Consent & Patient Acknowledgment Form
              </p>
            </div>

            {/* Patient & Procedure Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm my-4 print:bg-transparent">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">اسم المريض:</span>
                <span className="font-black text-slate-900">{appointment.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">رقم الهاتف:</span>
                <span className="font-bold text-slate-900" dir="ltr">{appointment.patientPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">الرقم القومي / إثبات الشخصية:</span>
                <span className="font-bold text-slate-900">
                  {patientNationalId || '...........................................'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">الطبيب المعالج:</span>
                <span className="font-black text-slate-900">{doctorName}</span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-600">الإجراء الطبي المطلوب:</span>
                <span className="font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 print:bg-transparent print:border-none print:text-black">
                  {procedureName}
                </span>
              </div>
            </div>

            {/* Treatment Plan Section (الخطة العلاجية المعتمدة) */}
            {(treatmentPlan || treatmentPlanStages.length > 0) && (
              <div className="my-5 p-4 rounded-xl border border-slate-300 bg-slate-50/50 print:bg-transparent print:border-slate-800 print:p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 print:border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-amber-600 print:text-black" />
                    <h4 className="font-black text-sm text-slate-950">
                      الخطة العلاجية المعتمدة ومراحل العلاج المقررة (Dental Treatment Plan):
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {estimatedDuration && (
                      <span className="text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 print:border-none print:p-0">
                        ⏱️ المدة التقديرية: <strong className="text-slate-950">{estimatedDuration}</strong>
                      </span>
                    )}
                    {Boolean(totalEstimatedCost && Number(totalEstimatedCost) > 0) && (
                      <span className="text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 print:border-none print:p-0 print:text-black">
                        💰 إجمالي التكلفة المقدرة: <strong className="text-slate-950">{Number(totalEstimatedCost).toLocaleString('ar-EG')} ج.م</strong>
                      </span>
                    )}
                  </div>
                </div>

                {treatmentPlan && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3 bg-white p-2.5 rounded-lg border border-slate-200/80 print:border-none print:p-0 print:text-black">
                    {treatmentPlan}
                  </p>
                )}

                {treatmentPlanStages.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-200/80 text-slate-900 print:bg-slate-100 font-bold">
                          <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                          <th className="p-2 border border-slate-300">مرحلة / خطوة العلاج</th>
                          <th className="p-2 border border-slate-300 w-28 text-center">السن / الموضع</th>
                          <th className="p-2 border border-slate-300 w-24 text-center">الجلسات</th>
                          <th className="p-2 border border-slate-300 w-28 text-center">التكلفة التقديرية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentPlanStages.map((st, idx) => (
                          <tr key={st.id} className="odd:bg-white even:bg-slate-50/50 print:bg-transparent">
                            <td className="p-2 border border-slate-300 text-center font-bold text-slate-600">{idx + 1}</td>
                            <td className="p-2 border border-slate-300">
                              <div className="font-black text-slate-900">{st.stageName}</div>
                              {st.details && <div className="text-[11px] text-slate-500 font-normal mt-0.5">{st.details}</div>}
                            </td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-slate-700">
                              {st.toothNumber || '—'}
                            </td>
                            <td className="p-2 border border-slate-300 text-center text-slate-700 font-bold">
                              {st.sessionsCount ? `${st.sessionsCount} جلسة` : 'جلسة واحدة'}
                            </td>
                            <td className="p-2 border border-slate-300 text-center font-black text-slate-900">
                              {st.estimatedCost ? `${st.estimatedCost.toLocaleString('ar-EG')} ج.م` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Informed Consent Clauses */}
            <div className="my-5">
              <h4 className="font-bold text-sm text-slate-900 mb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>بنود الإقرار والتعهد الطبي المستنير:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed pr-1">
                {risks.map((item, idx) => (
                  <li key={idx} className="bg-slate-50/70 p-2 rounded-lg print:p-0 print:bg-transparent">
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Custom Notes if any */}
            {notes && (
              <div className="my-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950">
                <span className="font-bold">ملاحظات طبية خاصة: </span>
                <span>{notes}</span>
              </div>
            )}

            {/* Signatures Area */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300 grid grid-cols-2 gap-6 text-xs sm:text-sm">
              <div className="border border-slate-300 rounded-xl p-4 flex flex-col justify-between min-h-[150px] bg-slate-50/50 print:bg-transparent">
                <div>
                  <div className="font-bold text-slate-900 mb-1">توقيع المريض أو ولي الأمر / الكفيل:</div>
                  <div className="text-[11px] text-slate-500">أقر بصحة البيانات وموافقتي التامة على الإجراء أعلاه</div>
                </div>
                
                <PatientSignatureRenderer
                  consent={{
                    ...existingConsent,
                    status: consentStatus,
                    patientSignature: patientSignature || existingConsent?.patientSignature,
                    touchStrokes: existingConsent?.touchStrokes,
                    signatureType: signatureType || existingConsent?.signatureType,
                    signerName: existingConsent?.signerName || appointment.patientName,
                    patientName: appointment.patientName,
                    signedAt: existingConsent?.signedAt || (isSigned ? new Date().toISOString() : undefined),
                    date: appointment.date
                  }}
                  patientName={appointment.patientName}
                />

                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>الاسم: {appointment.patientName}</span>
                  <span>التاريخ: {appointment.date}</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 flex flex-col justify-between min-h-[150px] bg-slate-50/50 print:bg-transparent">
                <div>
                  <div className="font-bold text-slate-900 mb-1">اعتماد الطبيب المعالج والمركز:</div>
                  <div className="text-[11px] text-slate-500">تم شرح كافة جوانب الإجراء الطبي والرد على استفسارات المريض</div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-600 text-amber-700 font-black text-[10px] flex flex-col items-center justify-center rotate-[-6deg] bg-amber-50/50 print:bg-transparent">
                    <span>مركز الماسة</span>
                    <span>معتمد طبياً</span>
                    <span>✓ APPROVED</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>الطبيب: {doctorName}</span>
                  <span>الشاهد: {witnessName}</span>
                </div>
              </div>
            </div>

            {/* Print Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 flex justify-between">
              <span>طُبعت بتاريخ: {new Date().toLocaleString('ar-EG')}</span>
              <span>مركز د. محمد فوزي الماسة لطب وزراعة الأسنان - المحلة الكبرى</span>
            </div>

          </div>

          {/* ============================================================== */}
          {/* SECRETARY CONTROLS (Hidden during printing) */}
          {/* ============================================================== */}
          <div className="mt-6 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 print:hidden space-y-5">
            
            {/* Electronic Signature Box */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    ✍️
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-950">التوقيع الإلكتروني الحي للمريض (Electronic Signature):</h4>
                    <p className="text-[11px] text-slate-600">توقيع مباشر على الشاشة بواسطة الإصبع باللمس أو القلم أو الماوس</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 text-xs font-bold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureMode('digital');
                      setSignatureType('digital');
                    }}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      signatureMode === 'digital'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✍️ توقيع إلكتروني حي
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureMode('paper');
                      setSignatureType('paper_physical');
                    }}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      signatureMode === 'paper'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📄 طباعة ورقية
                  </button>
                </div>
              </div>

              {signatureMode === 'digital' ? (
                <div className="space-y-2 pt-1">
                  <DigitalSignaturePad
                    initialSignature={patientSignature}
                    onSaveSignature={(sigUrl) => {
                      setPatientSignature(sigUrl);
                      setIsSigned(true);
                      setSignatureType('digital');
                      showToast('تم التقاط التوقيع الإلكتروني بنجاح ✓ اضغط اعتماد وحفظ');
                    }}
                    onClearSignature={() => {
                      setPatientSignature(undefined);
                      setIsSigned(false);
                    }}
                  />
                  {patientSignature && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">تم التقاط التوقيع الإلكتروني بنجاح وجاهز للاعتماد في ملف المريض</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition"
                      >
                        حفظ واعتماد الآن ✓
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span>اطبع نموذج الإقرار وقدمه للمريض للتوقيع اليدوي، ثم اضغط تأكيد الاستلام:</span>
                  <button
                    type="button"
                    onClick={handleConfirmPhysicalSignature}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition cursor-pointer shrink-0"
                  >
                    تأكيد استلام الورقة الموقعة ✓
                  </button>
                </div>
              )}
            </div>

            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 pt-1">
              <PenTool className="w-4 h-4 text-amber-600" />
              <span>تعديل وتخصيص بيانات الإقرار الطبي:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">اسم الإجراء الطبي:</label>
                <input
                  type="text"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  placeholder="مثال: خلع ضرس عقل جراحي، زراعة فورية..."
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">الرقم القومي للمريض:</label>
                <input
                  type="text"
                  value={patientNationalId}
                  onChange={(e) => setPatientNationalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  placeholder="14 رقم للرقم القومي"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">اسم الطبيب المعالج:</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">اسم الموظف أو الشاهد (الاستقبال):</label>
                <input
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">ملاحظات إضافية على الإجراء:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  placeholder="أي ملاحظات خاصة بالتخدير أو التاريخ المرضي..."
                />
              </div>
            </div>

            {/* Manage Clauses */}
            <div>
              <label className="block text-slate-600 font-bold text-xs mb-1">إضافة بند إقرار جديد:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRiskText}
                  onChange={(e) => setNewRiskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRisk()}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  placeholder="أدخل بنداً أو شرطاً إضافياً للموافقة..."
                />
                <button
                  type="button"
                  onClick={handleAddRisk}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  إضافة بند
                </button>
              </div>
            </div>

            {/* Treatment Plan Section for Secretary (الخطة العلاجية) */}
            <div className="mt-4 pt-4 border-t border-slate-200 bg-linear-to-b from-amber-50/50 to-orange-50/30 -mx-4 px-4 py-4 sm:rounded-2xl border border-amber-200/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <ListChecks className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-950">
                      الخطة العلاجية المعتمدة للحالة (Dental Treatment Plan):
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      تتيح للسكرتيرة إضافة وتعديل مراحل وجلسات العلاج والتكلفة التقديرية لتظهر مطبوعة في الإقرار
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
                  {treatmentPlanStages.length} مراحل مضافة
                </span>
              </div>

              {/* Quick Presets */}
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 mb-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>نماذج خطط علاجية جاهزة سريعة (بنقرة واحدة للملء التلقائي):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TREATMENT_PLAN_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyPresetPlan(pIdx)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200 hover:border-amber-500 text-[11px] font-bold transition shadow-2xs"
                      title={preset.summary}
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Treatment Plan Summary */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    ملخص الخطة العلاجية والإجراءات المقررة:
                  </label>
                  <textarea
                    rows={2}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    placeholder="اكتبي ملخص الخطة العلاجية أو الإجراءات الشاملة للحالة..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>المدة التقديرية لإتمام الخطة:</span>
                    </label>
                    <input
                      type="text"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                      placeholder="مثال: شهرين، 4 جلسات، 3 أسابيع..."
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>إجمالي التكلفة التقديرية (ج.م):</span>
                    </label>
                    <input
                      type="number"
                      value={totalEstimatedCost}
                      onChange={(e) => setTotalEstimatedCost(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                      placeholder="مثال: 4500"
                    />
                  </div>
                </div>

                {/* Existing Stages List */}
                {treatmentPlanStages.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <label className="block text-slate-700 font-bold text-xs">
                      المراحل والجلسات الحالية المقررة في الخطة ({treatmentPlanStages.length}):
                    </label>
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {treatmentPlanStages.map((st, sIdx) => (
                        <div key={st.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 text-xs">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-[10px] shrink-0">
                              {sIdx + 1}
                            </span>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                                <span>{st.stageName}</span>
                                {st.toothNumber && (
                                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                                    السن: {st.toothNumber}
                                  </span>
                                )}
                                {Boolean(st.sessionsCount && st.sessionsCount > 1) && (
                                  <span className="text-[10px] bg-sky-50 px-1.5 py-0.5 rounded text-sky-700 font-bold">
                                    {st.sessionsCount} جلسات
                                  </span>
                                )}
                              </div>
                              {st.details && (
                                <p className="text-[11px] text-slate-500">{st.details}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {st.estimatedCost !== undefined && (
                              <span className="font-black text-amber-700 text-xs">
                                {st.estimatedCost.toLocaleString('ar-EG')} ج.م
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveStage(st.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                              title="حذف هذه المرحلة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Stage Card */}
                <div className="p-3 bg-white rounded-xl border border-amber-300/80 shadow-2xs space-y-2.5">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>إضافة مرحلة / جلسة جديدة للخطة:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-bold text-[11px] mb-1">
                        اسم المرحلة أو الخطوة العلاجية: *
                      </label>
                      <input
                        type="text"
                        value={stageName}
                        onChange={(e) => setStageName(e.target.value)}
                        placeholder="مثال: حشو عصب نهائي، برد السن وتركيب طربوش..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold text-[11px] mb-1">
                        رقم أو موضع السن (اختياري):
                      </label>
                      <input
                        type="text"
                        value={stageToothNumber}
                        onChange={(e) => setStageToothNumber(e.target.value)}
                        placeholder="مثال: #16، الفك العلوي..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold text-[11px] mb-1">
                        عدد الجلسات المقدرة:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={stageSessionsCount}
                        onChange={(e) => setStageSessionsCount(Number(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold text-[11px] mb-1">
                        التكلفة التقديرية لهذه المرحلة (ج.م):
                      </label>
                      <input
                        type="number"
                        value={stageCost}
                        onChange={(e) => setStageCost(e.target.value)}
                        placeholder="مثال: 800"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold text-[11px] mb-1">
                        تفاصيل أو تعليمات خاصة للمرحلة:
                      </label>
                      <input
                        type="text"
                        value={stageDetails}
                        onChange={(e) => setStageDetails(e.target.value)}
                        placeholder="مثال: تخدير موضعي، موعد بعد أسبوع..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddStage}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة هذه المرحلة إلى الخطة العلاجية</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions - Screen only */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            {existingConsent && (
              <button
                type="button"
                onClick={handleDeleteConsent}
                disabled={isSaving}
                className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
                title="حذف الإقرار الطبي"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 font-bold text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ المسودة 💾'}
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Step 1: Send to Patient Button */}
            <button
              type="button"
              onClick={() => handleSave('sent_to_patient')}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer ${
                consentStatus === 'sent_to_patient'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
              title="إرسال الخطة والإقرار للمريض للتوقيع الإلكتروني عبر التطبيق"
            >
              <Send className="w-4 h-4" />
              <span>{consentStatus === 'sent_to_patient' ? 'إعادة إرسال للمريض للتوقيع 📲' : 'إرسال للمريض للتوقيع 📲'}</span>
            </button>

            {/* Step 3: Secretary Approve Button */}
            {consentStatus === 'approved' || consentStatus === 'signed' ? (
              <div
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-sm cursor-default"
                title="هذا الإقرار معتمد وموثق رسمياً بالفعل"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>الإقرار معتمد وموثق رسمياً ✓ (تم الاعتماد)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleSave('approved')}
                disabled={isSaving}
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer ${
                  consentStatus === 'signed_by_patient'
                    ? 'bg-emerald-600 hover:bg-emerald-500 ring-4 ring-emerald-200 animate-bounce'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
                title="اعتماد وتوثيق الإقرار رسمياً بختم المركز"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {consentStatus === 'signed_by_patient'
                    ? 'اعتماد توقيع المريض وتوثيق الإقرار رسمياً ✓'
                    : 'اعتماد وتوثيق الإقرار رسمياً ✓'}
                </span>
              </button>
            )}

            {/* Print paper for physical signature */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePrintPaper(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                title="طباعة ورقة الإقرار مباشرة"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>طباعة ورقة الإقرار 🖨️</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintPaper(true)}
                disabled={isSaving}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="فتح الإقرار في نافذة جديدة للطباعة / الحفظ كـ PDF"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
