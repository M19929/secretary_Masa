import { DentalService, DentalOffer, Doctor, Appointment, PatientRecord, NotificationItem, DoctorReview, ClinicPhoto } from '../types';

export const INITIAL_SERVICES: DentalService[] = [
  {
    id: 'serv-0',
    name: 'كشف واستشارة طبية شاملة',
    nameEn: 'Comprehensive Dental Examination',
    category: 'الكشف والاستشارة',
    description: 'كشف وفحص إكلينيكي شامل لصحة الفم والأسنان وخطة علاج متكاملة مع تصوير دقيق',
    basePrice: 115,
    durationMinutes: 20,
    iconName: 'Stethoscope',
    popular: true,
    features: ['فحص إكلينيكي دقيق لكافة الأسنان واللثة', 'خطة علاجية مطبوعة ومفصلة', 'استشارة مع الطبيب الأخصائي']
  },
  {
    id: 'serv-1',
    name: 'تنظيف وتلميع الأسنان',
    nameEn: 'Teeth Cleaning & Polishing',
    category: 'الوقاية والتنظيف',
    description: 'إزالة الجير والتصبغات وتلميع الأسنان بأحدث أجهزة Airflow وتطبيق الفلورايد',
    basePrice: 400,
    durationMinutes: 30,
    iconName: 'Sparkles',
    popular: true,
    features: ['إزالة الجير بالموجات فوق الصوتية', 'تلميع بتقنية AirFlow السويسرية', 'جلسة فلورايد لحماية المينا']
  },
  {
    id: 'serv-2',
    name: 'حشوات الأسنان التجميلية (كومبوزيت ليزري)',
    nameEn: 'Cosmetic Laser Fillings',
    category: 'العلاج التجميلي',
    description: 'حشوات ليزرية تجميلية بلون السن الطبيعي ومقاومة للتسوس مع نحت تشريحي دقيق',
    basePrice: 550,
    durationMinutes: 45,
    iconName: 'ShieldCheck',
    popular: true,
    features: ['مطابقة دقيقة لدرجة لون السن', 'تقنية التصلب الضوئي الألماني', 'ضمان معتمد على الحشوة']
  },
  {
    id: 'serv-3',
    name: 'تركيبات الأسنان (زركون وإيماكس)',
    nameEn: 'Zirconia & E-max Crowns',
    category: 'التركيبات',
    description: 'تيجان وجسور الزركونيا والإيماكس فائقة الصلابة والجمال بالمسح الرقمي CAD/CAM',
    basePrice: 2600,
    durationMinutes: 60,
    iconName: 'Crown',
    popular: true,
    features: ['زركون ألماني فائق الشفافية', 'أخذ المقاسات بماسح ضوئي 3D رقمي بدون معجون', 'ضمان 10 سنوات']
  },
  {
    id: 'serv-4',
    name: 'تقويم الأسنان (شفاف ومعدني)',
    nameEn: 'Orthodontics & Clear Aligners',
    category: 'التقويم',
    description: 'تصحيح اصطفاف الأسنان وعلاج الفكين بأحدث أنظمة التقويم الشفاف والمعدني',
    basePrice: 14000,
    durationMinutes: 45,
    iconName: 'Smile',
    popular: true,
    features: ['خطة علاج وتوقع النتيجة رقمياً 3D', 'تقويم شفاف غير مرئي مريح', 'أنظمة تقسيط ميسرة بدون فوائد']
  },
  {
    id: 'serv-5',
    name: 'تبييض الأسنان بالليزر زووم 4',
    nameEn: 'Philips Zoom 4 Whitening',
    category: 'التجميل',
    description: 'تفتيح لون الأسنان حتى 8 درجات في جلسة واحدة بأمان تام وبدون حساسية',
    basePrice: 1600,
    durationMinutes: 45,
    iconName: 'SunMedium',
    popular: true,
    features: ['جهاز Philips Zoom 4 الأمريكي الأصلي', 'نتائج فورية بنفس الجلسة', 'مصل حماية متقدم لمنع الحساسية']
  },
  {
    id: 'serv-6',
    name: 'علاج الجذور وعصب الأسنان',
    nameEn: 'Microscopic Endodontics',
    category: 'علاج العصب',
    description: 'تنظيف وحشو القنوات الجذرية بجلسة واحدة بالميكروسكوب والأجهزة الدوارة الحديثة',
    basePrice: 850,
    durationMinutes: 50,
    iconName: 'Activity',
    popular: false,
    features: ['استخدام ميكروسكوب جراحي دقيق', 'بدون أي ألم بالتخدير الموضعي', 'أشعة رقمية فورية لكل قناة']
  },
  {
    id: 'serv-7',
    name: 'زراعة الأسنان الفورية الألمانية',
    nameEn: 'German Dental Implants',
    category: 'الجراحة والزراعة',
    description: 'تعويض الأسنان المفقودة بزرعات ألمانية وسويسرية معتمدة مع إمكانية التحميل الفوري',
    basePrice: 8500,
    durationMinutes: 60,
    iconName: 'Layers',
    popular: true,
    features: ['زرعات تيتانيوم ألمانية معتمدة دولياً', 'إمكانية التركيب الفوري بعد الزراعة', 'ضمان مدى الحياة']
  },
  {
    id: 'serv-8',
    name: 'ابتسامة هوليوود (فينير ولومينير)',
    nameEn: 'Hollywood Smile Veneers',
    category: 'التجميل',
    description: 'عدسات تجميلية إيماكس بلجيكية لمنحك ابتسامة بيضاء متناسقة ومشرقة بدون حك للأسنان',
    basePrice: 3200,
    durationMinutes: 60,
    iconName: 'Star',
    popular: true,
    features: ['عدسات إيماكس أصلية فائقة الرقة', 'تصميم رقمي كامل للابتسامة DSD', 'مقاومة تامة للتصبغات والمشروبات']
  }
];

export const INITIAL_OFFERS: DentalOffer[] = [
  {
    id: 'off-1',
    title: 'عرض تنظيف وتلميع الأسنان الشامل',
    subtitle: 'تنظيف جير + تلميع Airflow + جلسة فلورايد',
    category: 'تنظيف وتبييض',
    originalPrice: 500,
    discountedPrice: 300,
    discountPercent: 40,
    badge: 'خصم 40%',
    features: ['إزالة الجير بالكامل بالموجات فوق الصوتية', 'تلميع الأسنان بجهاز airflow السويسري', 'تطبيق جل الفلورايد لحماية المينا', 'كشف شامل وخطة علاجية مجانية'],
    expiresAt: '2026-09-30',
    serviceId: 'serv-1',
    imageTheme: 'blue'
  },
  {
    id: 'off-2',
    title: 'عرض تقويم الأسنان الشامل',
    subtitle: 'خصم خاص على التقويم المعدني والشفاف + أشعة وكشف مجاني',
    category: 'عروض التقويم',
    originalPrice: 15000,
    discountedPrice: 11500,
    discountPercent: 23,
    badge: 'خصم 23%',
    features: ['كشف واستشارة مجانية مع أخصائي التقويم', 'أشعة بانوراما رقمية مجاناً', 'خطة دفع شهرية بدون فوائد', 'متابعة دورية مجانية طوال فترة العلاج'],
    expiresAt: '2026-10-15',
    serviceId: 'serv-4',
    imageTheme: 'teal'
  },
  {
    id: 'off-3',
    title: 'عرض تبييض الأسنان زووم 4 الأمريكي',
    subtitle: 'تبييض بالليزر + جلسة تنظيف وتلميع مجانية',
    category: 'تنظيف وتبييض',
    originalPrice: 1800,
    discountedPrice: 1200,
    discountPercent: 33,
    badge: 'خصم 33%',
    features: ['تفتيح حتى 8 درجات في جلسة واحدة', 'جلسة تنظيف وتلميع كاملة قبل التبييض', 'مجموعة عناية منزلية مجانية', 'جلسة آمنة تماماً وبدون حساسية'],
    expiresAt: '2026-09-25',
    serviceId: 'serv-5',
    imageTheme: 'gold'
  },
  {
    id: 'off-4',
    title: 'عرض تركيبات الزركون الألمانية',
    subtitle: 'خصم خاص على تركيبات وتيجان الزركون للسن الواحد',
    category: 'التركيبات والزراعة',
    originalPrice: 2700,
    discountedPrice: 2100,
    discountPercent: 22,
    badge: 'خصم 22%',
    features: ['زركون ألماني أصلي عالي النقاوة والصلابة', 'مسح رقمي ثلاثي الأبعاد 3D Scanner', 'ضمان معتمد 10 سنوات على التركيبة'],
    expiresAt: '2026-10-30',
    serviceId: 'serv-3',
    imageTheme: 'purple'
  }
];

// دكاترة المركز المحددين من المستخدم:
// 1. د. احمد هاني - اخصائي تقويم
// 2. د. محمد صلاح - اخصائي حشو عصب وحشو تجميلي
// 3. د. مها - اخصائي اطفال
// 4. د. ندا علاء - اخصائي اطفال
// 5. د. محمد فوزى - استشارى زراعه وجراحه
// 6. د. مهند - اخصائي جراحه
export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'د. احمد هاني',
    title: 'أخصائي تقويم الأسنان',
    specialty: 'اخصائي تقويم',
    experienceYears: 14,
    rating: 4.95,
    reviewCount: 380,
    avatar: '/assets/images/doctors/dr_ahmed.jpg',
    availableDays: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    shift: '02:00 م - 10:00 م'
  },
  {
    id: 'doc-2',
    name: 'د. محمد صلاح',
    title: 'أخصائي حشو عصب وحشو تجميلي',
    specialty: 'اخصائي حشو عصب وحشو تجميلي',
    experienceYears: 15,
    rating: 4.92,
    reviewCount: 340,
    avatar: '/assets/images/doctors/dr_salah.jpg',
    availableDays: ['السبت', 'الأحد', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    shift: '02:00 م - 10:00 م'
  },
  {
    id: 'doc-3',
    name: 'د. مها',
    title: 'أخصائية طب أسنان الأطفال',
    specialty: 'اخصائي اطفال',
    experienceYears: 11,
    rating: 4.9,
    reviewCount: 290,
    avatar: '/assets/images/doctors/dr_maha.jpg',
    availableDays: ['السبت', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    shift: '02:00 م - 10:00 م'
  },
  {
    id: 'doc-4',
    name: 'د. ندا علاء',
    title: 'أخصائية طب أسنان الأطفال ورعاية الفم',
    specialty: 'اخصائي اطفال',
    experienceYears: 10,
    rating: 4.93,
    reviewCount: 270,
    avatar: '/assets/images/doctors/dr_neda.jpg',
    availableDays: ['السبت', 'الأحد', 'الإثنين', 'الأربعاء', 'الخميس'],
    shift: '02:00 م - 10:00 م'
  },
  {
    id: 'doc-5',
    name: 'د. محمد فوزى',
    title: 'استشاري زراعة وجراحة الأسنان',
    specialty: 'استشارى زراعه وجراحه',
    experienceYears: 18,
    rating: 4.98,
    reviewCount: 460,
    avatar: '/assets/images/doctors/dr_fawzy.jpg',
    availableDays: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    shift: '02:00 م - 10:00 م'
  },
  {
    id: 'doc-6',
    name: 'د. مهند',
    title: 'أخصائي جراحة الفم والأسنان',
    specialty: 'اخصائي جراحه',
    experienceYears: 12,
    rating: 4.91,
    reviewCount: 310,
    avatar: '/assets/images/doctors/dr_mohanad.jpg',
    availableDays: ['السبت', 'الأحد', 'الثلاثاء', 'الخميس'],
    shift: '02:00 م - 10:00 م'
  },
  {
    id: 'doc-7',
    name: 'د. أسماء',
    title: 'أخصائية طب وتجميل الأسنان وعلاج الجذور',
    specialty: 'اخصائي تجميل وعلاج تحفظي',
    experienceYears: 10,
    rating: 4.95,
    reviewCount: 280,
    avatar: '/assets/images/doctors/dr_asmaa.jpg',
    availableDays: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    shift: '02:00 م - 10:00 م'
  }
];

export const INITIAL_DOCTOR_REVIEWS: DoctorReview[] = [];

// Clean empty appointments array as requested to remove fake/mock appointments
export const INITIAL_APPOINTMENTS: Appointment[] = [];

// Clean initial patient records
export const INITIAL_PATIENTS: PatientRecord[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'مرحباً بك في مركز د. محمد فوزي الماسة 💎',
    message: 'يسعدنا انضمامك إلينا! تصفح خدماتنا وعروضنا الحصرية واحجز موعدك بسهولة مع نخبة أطبائنا بالمحلة الكبرى.',
    time: 'الآن',
    read: false,
    type: 'system'
  }
];

export const CLINIC_INFO = {
  name: 'مركز دكتور محمد فوزى الماسة لتجميل وزراعه الاسنان',
  shortName: 'مركز د. محمد فوزي الماسة',
  tagline: 'ابتسامتك المشرقة تبدأ معنا بأحدث تقنيات تجميل وزراعة الأسنان',
  subtext: 'نقدم أحدث تقنيات طب وزراعة وتجميل الأسنان بإشراف د. محمد فوزي ونخبة من الاستشاريين والأخصائيين.',
  phone: '+201101722551',
  phoneDisplay: '01101722551',
  phones: ['01101722551', '0402218878'],
  mobile: '01101722551',
  landline: '0402218878',
  landlineDisplay: '0402218878',
  whatsapp: '+201101722551',
  facebookUrl: 'https://www.facebook.com/share/1KL7zrcN3G/',
  websiteUrl: 'https://almasadental-eg.com',
  videoUrl: '/assets/videos/clinic_video.mp4',
  videoTitle: 'جولة تعريفية داخل مركز د. محمد فوزي الماسة بالمحلة الكبرى',
  email: 'info@almasadental-eg.com',
  address: 'المحله الكبرى ميدان الشون مقابل حلوني هبه اعلي معمل الدره',
  city: 'المحلة الكبرى',
  country: 'مصر',
  currency: 'ج.م',
  currencyName: 'جنيه مصري',
  workingHours: 'يومياً: 02:00 م - 10:00 م',
  stats: {
    patientsCount: '25,000+',
    satisfactionRate: '99.4%',
    doctorsCount: '6 أطباء واستشاريين',
    yearsExperience: '18+ عاماً'
  }
};

export const INITIAL_GALLERY: ClinicPhoto[] = [
  {
    id: 'gal-1',
    title: 'عيادة الكشف والعمليات المجهزة بأحدث شاشات المتابعة',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
    category: 'عيادات الكشف',
    createdAt: '2025-01-10'
  },
  {
    id: 'gal-2',
    title: 'جهاز المسح الرقمي ثلاثي الأبعاد 3D لتصوير الفك والأسنان',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
    category: 'تجهيزات المركز',
    createdAt: '2025-01-15'
  },
  {
    id: 'gal-3',
    title: 'غرفة التعقيم الطبي الآلي وفق المعايير الأوربية',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    category: 'تجهيزات المركز',
    createdAt: '2025-01-20'
  },
  {
    id: 'gal-4',
    title: 'عيادة خاصة ومريحة لطب وتجميل أسنان الأطفال',
    url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80',
    category: 'عيادات الكشف',
    createdAt: '2025-02-01'
  },
  {
    id: 'gal-5',
    title: 'نتائج زراعة الأسنان الفورية وتجميل الفينير لابتسامة طبيعية',
    url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80',
    category: 'حالات قبل وبعد',
    createdAt: '2025-02-10'
  },
  {
    id: 'gal-6',
    title: 'استراحة واستقبال المرضى الفندقي المريح بالمركز',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    category: 'تجهيزات المركز',
    createdAt: '2025-02-15'
  }
];
