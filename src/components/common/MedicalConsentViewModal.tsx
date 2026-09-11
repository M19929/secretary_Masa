import React, { useState } from 'react';
import { Appointment, MedicalConsent } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { PatientSignatureRenderer } from './PatientSignatureRenderer';
import { printElement } from '../../utils/printHelper';
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Stethoscope,
  PenTool,
  ExternalLink
} from 'lucide-react';

interface MedicalConsentViewModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const MedicalConsentViewModal: React.FC<MedicalConsentViewModalProps> = ({
  appointment,
  onClose
}) => {
  const { clinicInfo, saveMedicalConsent, showToast } = useClinic();
  
  const defaultRisks = [
    'أقر أنا المريض (أو ولي أمري) بأنني فوضت الطبيب المعالج والفريق الطبي بمركز د. محمد فوزي الماسة لطب وزراعة الأسنان بإجراء الكشف والفحوصات اللازمة والخطة العلاجية المقترحة.',
    'تم إحاطتي بكافة تفاصيل الإجراء الطبي والمخاطر والمضاعفات المحتملة والبدائل المتاحة، وتمت الإجابة عن كافة استفساراتي بوضوح وشفافية تامة.',
    'أفصحت للطبيب المعالج عن كافة الأمراض المزمنة (كالضغط، السكري، أمراض القلب، والسيولة) وأي أدوية مستمرة أو حساسية من أدوية كالبنسلين أو التخدير الموضعي.',
    'أوافق على الالتزام الكامل بتعليمات الطبيب وتناول الأدوية المقررة والمواظبة على مواعيد المتابعة المحددة لضمان الشفاء التام.'
  ];

  const consent: MedicalConsent = appointment.consent || {
    id: `consent-${appointment.id}`,
    appointmentId: appointment.id,
    appointmentCode: appointment.appointmentCode || `MASA-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone,
    patientNationalId: appointment.nationalId,
    procedureName: appointment.serviceName || 'كشف واستشارة طبية متخصصة',
    doctorName: appointment.doctorName || 'د. محمد فوزي',
    date: appointment.date,
    risksAcknowledged: defaultRisks,
    status: 'pending_signature',
    signatureType: 'digital',
    createdAt: new Date().toISOString()
  };

  const [patientSignature, setPatientSignature] = useState<string | undefined>(consent?.patientSignature);
  const [currentStatus, setCurrentStatus] = useState<MedicalConsent['status']>(consent?.status || 'draft');
  const [isSigned, setIsSigned] = useState(
    consent?.status === 'approved' || consent?.status === 'signed' || consent?.status === 'signed_by_patient' || Boolean(consent?.patientSignature)
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSignDirectly = async (signatureDataUrl: string) => {
    setIsSaving(true);
    try {
      const updatedConsent: MedicalConsent = {
        ...consent,
        patientSignature: signatureDataUrl,
        status: 'signed_by_patient',
        signatureType: 'digital',
        signedAt: new Date().toISOString()
      };
      await saveMedicalConsent(appointment.id, updatedConsent);
      setPatientSignature(signatureDataUrl);
      setCurrentStatus('signed_by_patient');
      setIsSigned(true);
      showToast('تم إرسال توقيعك على الإقرار الطبي والخطة العلاجية بنجاح! الإقرار قيد مراجعة واعتماد السكرتارية وختم المركز ⏳');
    } catch (e) {
      showToast('حدث خطأ أثناء حفظ التوقيع، يرجى المحاولة ثانية');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = (preferPopup: boolean = false) => {
    showToast(preferPopup ? 'جارٍ فتح الإقرار في نافذة طباعة مخصصة 🖨️...' : 'جارٍ فتح نافذة الطباعة 🖨️...');
    printElement('medical-consent-view-paper', {
      title: `إقرار وموافقة طبية - ${appointment.patientName}`,
      preferPopup
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:m-0">
        
        {/* Header (Screen only) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-50 to-teal-500/10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  إقرار وموافقة طبية مستنيرة
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  currentStatus === 'approved' || currentStatus === 'signed'
                    ? 'bg-emerald-100 text-emerald-800' 
                    : currentStatus === 'signed_by_patient'
                    ? 'bg-blue-100 text-blue-800'
                    : currentStatus === 'sent_to_patient'
                    ? 'bg-amber-100 text-amber-900 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentStatus === 'approved' || currentStatus === 'signed' 
                    ? 'معتمد وموثق رسمياً ✓' 
                    : currentStatus === 'signed_by_patient'
                    ? '✍️ وقّعت عليه (بانتظار اعتماد السكرتارية)'
                    : currentStatus === 'sent_to_patient'
                    ? 'مطلوب توقيعك ✍️'
                    : 'مسودة قيد الإعداد'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                الإجراء: {consent.procedureName}
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

        {/* Informative Workflow Banners for Patient */}
        {currentStatus === 'sent_to_patient' && !patientSignature && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-950 flex items-center gap-2 print:hidden font-semibold">
            <span>📲 قامت السكرتارية بإرسال الخطة العلاجية والإقرار لك، يرجى التوقيع في الأسفل لإرسال توقيعك للاعتماد.</span>
          </div>
        )}

        {currentStatus === 'signed_by_patient' && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs text-blue-950 flex items-center gap-2 print:hidden font-semibold">
            <span>⏳ تم استلام توقيعك الإلكتروني بنجاح! الإقرار قيد مراجعة واعتماد السكرتارية وختم المركز الرسمي.</span>
          </div>
        )}

        {(currentStatus === 'approved' || currentStatus === 'signed') && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-950 flex items-center gap-2 print:hidden font-semibold">
            <span>✓ هذا الإقرار والخطة العلاجية معتمدة وموثقة رسمياً من إدارة المركز والمريض.</span>
          </div>
        )}

        {currentStatus === 'draft' && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 text-xs text-slate-700 flex items-center gap-2 print:hidden font-medium">
            <span>⚠️ مسودة إقرار: السكرتارية تقوم بإعداد وتجهيز الخطة العلاجية حالياً، وسيصلك إشعار فوري فور إرسالها لك للتوقيع.</span>
          </div>
        )}

        {/* Paper content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 print:overflow-visible print:p-0">
          <div id="medical-consent-view-paper" className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs print:border-none print:p-6 print:w-full">
            
            {/* Clinic letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl border-2 border-amber-400 shadow-sm print:border-black">
                  💎
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-950 font-['Cairo']">
                    {clinicInfo.name}
                  </h1>
                  <p className="text-xs text-slate-600 font-bold">
                    {clinicInfo.subtitle || 'لطب وجراحة وزراعة الأسنان وتجميل الابتسامة'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {clinicInfo.address} | هاتف: {clinicInfo.phones?.[0] || clinicInfo.phoneDisplay || clinicInfo.phone || '01101722551'}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">كود الحجز: {appointment.appointmentCode}</div>
                <div className="text-xs text-slate-600">التاريخ: {consent.date}</div>
                <div className="text-[10px] text-slate-400">وثيقة إقرار طبية معتمدة</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-4 py-2 bg-slate-100 rounded-xl print:bg-slate-200 border border-slate-200">
              <h2 className="text-base sm:text-lg font-black text-slate-950">
                إقرار وموافقة طبية مستنيرة على إجراء طبي
              </h2>
              <p className="text-xs text-slate-600 font-bold font-sans">
                Informed Medical Consent Form
              </p>
            </div>

            {/* Patient & Procedure Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm my-4 print:bg-transparent">
              <div>
                <span className="font-bold text-slate-500 block">اسم المريض:</span>
                <span className="font-black text-slate-900 text-sm">{consent.patientName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">الطبيب المعالج:</span>
                <span className="font-black text-slate-900 text-sm">{consent.doctorName}</span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-600">الإجراء الطبي المعتمد:</span>
                <span className="font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {consent.procedureName}
                </span>
              </div>
            </div>

            {/* Treatment Plan Section (الخطة العلاجية المقررة) */}
            {(consent.treatmentPlan || (consent.treatmentPlanStages && consent.treatmentPlanStages.length > 0)) && (
              <div className="my-5 p-4 rounded-xl border border-slate-300 bg-slate-50/60 print:bg-transparent print:border-slate-800 print:p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 print:border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-amber-600 print:text-black" />
                    <h4 className="font-black text-sm text-slate-950">
                      الخطة العلاجية المعتمدة ومراحل العلاج المقررة (Dental Treatment Plan):
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {consent.estimatedDuration && (
                      <span className="text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 print:border-none print:p-0">
                        ⏱️ المدة التقديرية: <strong className="text-slate-950">{consent.estimatedDuration}</strong>
                      </span>
                    )}
                    {Boolean(consent.totalEstimatedCost && consent.totalEstimatedCost > 0) && (
                      <span className="text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 print:border-none print:p-0 print:text-black">
                        💰 إجمالي التكلفة المقدرة: <strong className="text-slate-950">{consent.totalEstimatedCost.toLocaleString('ar-EG')} ج.م</strong>
                      </span>
                    )}
                  </div>
                </div>

                {consent.treatmentPlan && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3 bg-white p-2.5 rounded-lg border border-slate-200/80 print:border-none print:p-0 print:text-black">
                    {consent.treatmentPlan}
                  </p>
                )}

                {consent.treatmentPlanStages && consent.treatmentPlanStages.length > 0 && (
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
                        {consent.treatmentPlanStages.map((st, idx) => (
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

            {/* Clauses */}
            <div className="my-5">
              <h4 className="font-bold text-sm text-slate-900 mb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>بنود الإقرار والتعهد الطبي:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed pr-1">
                {consent.risksAcknowledged.map((item, idx) => (
                  <li key={idx} className="bg-slate-50/70 p-2 rounded-lg print:p-0 print:bg-transparent">
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Notes if any */}
            {consent.notes && (
              <div className="my-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950">
                <span className="font-bold">ملاحظات طبية: </span>
                <span>{consent.notes}</span>
              </div>
            )}

            {/* Signature Box */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300 grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 print:bg-transparent flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="font-bold text-slate-900 mb-1">توقيع المريض أو ولي الأمر:</div>
                  <div className="text-[10px] text-slate-500">أقر بموافقتي التامة على الإجراء الطبي المذكور</div>
                </div>

                <PatientSignatureRenderer
                  consent={{
                    ...consent,
                    status: currentStatus,
                    patientSignature: patientSignature || consent.patientSignature,
                    touchStrokes: consent.touchStrokes,
                    signatureType: consent.signatureType,
                    signerName: consent.signerName || appointment.patientName,
                    patientName: appointment.patientName,
                    signedAt: consent.signedAt || (isSigned ? new Date().toISOString() : undefined),
                    date: consent.date
                  }}
                  patientName={appointment.patientName}
                />

                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>الاسم: {consent.patientName}</span>
                  <span>التاريخ: {consent.date}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center justify-between text-center print:bg-transparent min-h-[140px]">
                <div>
                  <div className="font-bold text-slate-900 mb-1">اعتماد إدارة المركز والطبيب:</div>
                  <div className="text-[10px] text-slate-500">تم الشرح الطبي الوافي والرد على الاستفسارات</div>
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 text-amber-700 font-black text-[9px] flex flex-col items-center justify-center rotate-[-6deg] bg-amber-50/50 my-1">
                  <span>مركز الماسة</span>
                  <span>معتمد رسمياً</span>
                  <span>VERIFIED</span>
                </div>
                <div className="text-[10px] text-slate-500">الطبيب: {consent.doctorName}</div>
              </div>
            </div>

            {/* In-view signing section if patient hasn't signed electronically yet and it was sent to patient */}
            {!patientSignature && !isSigned && currentStatus !== 'draft' && (
              <div className="mt-6 p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-300 print:hidden space-y-3">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-700" />
                  <h4 className="font-bold text-sm text-slate-900">وقع إلكترونياً على هذا الإقرار الآن بإصبعك أو القلم:</h4>
                </div>
                <DigitalSignaturePad
                  onSaveSignature={handleSignDirectly}
                />
              </div>
            )}

            {currentStatus === 'draft' && !patientSignature && !isSigned && (
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 print:hidden text-center text-xs text-slate-600">
                <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <p className="font-bold text-slate-800 mb-0.5">مسودة إقرار قيد التجهيز</p>
                <p>ستقوم السكرتارية بإرسال الخطة العلاجية والإقرار لك فور اعتماد التفاصيل الطبية للتوقيع.</p>
              </div>
            )}

          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
          >
            إغلاق
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              title="طباعة الإقرار مباشرة"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة أو حفظ الإقرار (PDF) 🖨️</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrint(true)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="فتح الإقرار في نافذة جديدة للطباعة / الحفظ كـ PDF"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
