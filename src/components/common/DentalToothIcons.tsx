import React from 'react';

interface DentalToothIconProps {
  className?: string;
  size?: number;
  serviceId?: string;
  category?: string;
}

export const DentalToothIcon: React.FC<DentalToothIconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  serviceId = '',
  category = ''
}) => {
  // 1. Cleaning & Polishing (تنظيف وتلميع)
  if (serviceId === 'serv-1' || category.includes('تنظيف') || category.includes('الوقاية')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        {/* Shiny clean tooth */}
        <path
          d="M14 12C14 7 18 4 24 4C30 4 34 7 34 12C34 18 36 26 33 36C31 43 27 44 25 36C24 32 24 32 23 36C21 44 17 43 15 36C12 26 14 18 14 12Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Sparkle sparkles */}
        <path d="M38 10L40 6L42 10L46 12L42 14L40 18L38 14L34 12L38 10Z" fill="#F59E0B" />
        <path d="M8 20L9.5 17L11 20L14 21.5L11 23L9.5 26L8 23L5 21.5L8 20Z" fill="#38BDF8" />
        {/* Water drops / airflow shine */}
        <circle cx="21" cy="14" r="1.8" fill="currentColor" />
        <path d="M21 20C21 20 22 22 24 22C26 22 27 20 27 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 2. Composite Fillings & Aesthetic (حشوات تجميلية)
  if (serviceId === 'serv-2' || category.includes('حشو') || category.includes('تجميلي')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 12C14 7 18 4 24 4C30 4 34 7 34 12C34 18 36 26 33 36C31 43 27 44 25 36C24 32 24 32 23 36C21 44 17 43 15 36C12 26 14 18 14 12Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Filling crystal inlay in crown */}
        <path
          d="M20 9C20 9 22 7 24 7C26 7 28 9 28 9C29 11 28 14 26 15C24 16 22 15 20 13C19 11 20 9 20 9Z"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        {/* Laser curing beam */}
        <path d="M24 2V6M24 16V22" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 2" />
      </svg>
    );
  }

  // 3. Crowns, Zirconia & Bridges (تركيبات وتيجان وزركون)
  if (serviceId === 'serv-3' || category.includes('التركيبات') || category.includes('تاج')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        {/* Tooth base */}
        <path
          d="M15 20C15 24 14 28 15 36C17 43 21 44 23 36C24 32 24 32 25 36C27 44 31 43 33 36C34 28 33 24 33 20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Royal Crown on Top of the Tooth */}
        <path
          d="M13 18L15 6L21 11L24 4L27 11L33 6L35 18C35 19.5 33.5 21 32 21H16C14.5 21 13 19.5 13 18Z"
          fill="#F59E0B"
          fillOpacity="0.3"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="14" r="1.5" fill="#D97706" />
        <circle cx="18" cy="14" r="1.2" fill="#D97706" />
        <circle cx="30" cy="14" r="1.2" fill="#D97706" />
      </svg>
    );
  }

  // 4. Orthodontics & Braces (تقويم الأسنان)
  if (serviceId === 'serv-4' || category.includes('التقويم')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 12C14 7 18 4 24 4C30 4 34 7 34 12C34 18 36 26 33 36C31 43 27 44 25 36C24 32 24 32 23 36C21 44 17 43 15 36C12 26 14 18 14 12Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Orthodontic wire across tooth */}
        <path d="M10 18H38" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Central Braces bracket */}
        <rect x="20" y="14" width="8" height="8" rx="2" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
        <circle cx="24" cy="18" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // 5. Laser Whitening Zoom 4 (تبييض الأسنان بالليزر)
  if (serviceId === 'serv-5' || category.includes('تبييض') || category.includes('زووم')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 12C14 7 18 4 24 4C30 4 34 7 34 12C34 18 36 26 33 36C31 43 27 44 25 36C24 32 24 32 23 36C21 44 17 43 15 36C12 26 14 18 14 12Z"
          fill="#FEF08A"
          fillOpacity="0.4"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Laser Radiance Star */}
        <path d="M24 6L26 13L33 15L26 17L24 24L22 17L15 15L22 13L24 6Z" fill="#F59E0B" />
        <path d="M37 22L38 25L41 26L38 27L37 30L36 27L33 26L36 25L37 22Z" fill="#F59E0B" />
      </svg>
    );
  }

  // 6. Root Canal & Endodontics (علاج الجذور والعصب)
  if (serviceId === 'serv-6' || category.includes('العصب') || category.includes('جذور')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 12C14 7 18 4 24 4C30 4 34 7 34 12C34 18 36 26 33 36C31 43 27 44 25 36C24 32 24 32 23 36C21 44 17 43 15 36C12 26 14 18 14 12Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Inner root canal & nerve pathways */}
        <path d="M24 10C24 10 22 14 20 20C18 26 17 32 17 35" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 10C24 10 26 14 28 20C30 26 31 32 31 35" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="11" r="2" fill="#EF4444" />
      </svg>
    );
  }

  // 7. Dental Implant (زراعة الأسنان الألمانية)
  if (serviceId === 'serv-7' || category.includes('الزراعة') || category.includes('زراعة')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        {/* Crown on top */}
        <path
          d="M16 16C16 10 19 6 24 6C29 6 32 10 32 16H16Z"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {/* Titanium implant fixture / screw */}
        <path d="M20 16H28V20H20V16Z" fill="#64748B" />
        <path d="M19 21H29L27 25H21L19 21Z" fill="#475569" />
        <path d="M20 26H28L26 30H22L20 26Z" fill="#475569" />
        <path d="M21 31H27L25 35H23L21 31Z" fill="#475569" />
        <path d="M23 36H25L24 41L23 36Z" fill="#334155" />
        {/* Threads outline */}
        <path d="M18 16L30 16M17 21L31 21M18 26L30 26M19 31L29 31M21 36L27 36" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. Hollywood Smile & Veneers (ابتسامة هوليوود)
  if (serviceId === 'serv-8' || category.includes('هوليوود') || category.includes('فينير')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        {/* Aesthetic Diamond Tooth */}
        <path
          d="M14 12C14 7 18 4 24 4C30 4 34 7 34 12C34 18 36 26 33 36C31 43 27 44 25 36C24 32 24 32 23 36C21 44 17 43 15 36C12 26 14 18 14 12Z"
          fill="#FEF3C7"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Diamond facets */}
        <path d="M19 12L24 7L29 12L24 17L19 12Z" fill="#FBBF24" />
        <path d="M24 17V30M19 12H29" stroke="#D97706" strokeWidth="1.5" />
        {/* Smile curve underneath */}
        <path d="M10 38C16 45 32 45 38 38" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default Standard Dental Tooth Logo
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M14 12C14 7 18 4 24 4C30 4 34 7 34 12C34 18 36 26 33 36C31 43 27 44 25 36C24 32 24 32 23 36C21 44 17 43 15 36C12 26 14 18 14 12Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="16" r="3" fill="#F59E0B" />
    </svg>
  );
};
