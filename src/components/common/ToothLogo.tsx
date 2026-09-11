import React from 'react';

interface ToothLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  variant?: 'blue' | 'white' | 'gold' | 'full';
}

export const ToothLogo: React.FC<ToothLogoProps> = ({
  className = '',
  size = 48,
  showText = true,
  textColor = 'text-slate-800',
  variant = 'blue'
}) => {
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <img 
          src="/assets/masa_logo.svg" 
          alt="مركز د. محمد فوزي - الماسة لطب وزراعة الأسنان"
          className="rounded-2xl shadow-xl object-contain"
          style={{ width: size, height: size }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Authentic Masa Stylized Tooth Icon */}
      <div 
        className="relative flex items-center justify-center shrink-0 transition-transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="masaBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e6da7" />
              <stop offset="100%" stopColor="#0b3864" />
            </linearGradient>
            <linearGradient id="masaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Left Solid Tooth Shape */}
          <path 
            d="M90 22 C70 19 44 28 32 52 C20 76 26 118 36 148 C44 172 58 194 86 198 C95 199 98 190 100 176 C102 150 104 116 105 88 C105 60 103 24 90 22 Z" 
            fill={variant === 'white' ? '#FFFFFF' : variant === 'gold' ? 'url(#masaGoldGrad)' : '#0284C7'} 
          />

          {/* Right Stylized Implant Slats / Horizontal Ribs */}
          <path d="M115 34 C132 41 148 56 154 70 C146 74 130 75 115 74 Z" fill={variant === 'white' ? '#FFFFFF' : variant === 'gold' ? 'url(#masaGoldGrad)' : '#0284C7'} />
          <path d="M115 84 C134 85 151 87 162 95 C157 102 140 104 115 103 Z" fill={variant === 'white' ? '#FFFFFF' : variant === 'gold' ? 'url(#masaGoldGrad)' : '#0284C7'} />
          <path d="M115 112 C134 112 149 116 158 124 C153 131 136 132 115 131 Z" fill={variant === 'white' ? '#FFFFFF' : variant === 'gold' ? 'url(#masaGoldGrad)' : '#0284C7'} />
          <path d="M115 139 C130 139 143 143 149 150 C144 156 130 157 115 156 Z" fill={variant === 'white' ? '#FFFFFF' : variant === 'gold' ? 'url(#masaGoldGrad)' : '#0284C7'} />
          <path d="M115 165 C127 165 137 169 141 175 C135 181 124 182 115 181 Z" fill={variant === 'white' ? '#FFFFFF' : variant === 'gold' ? 'url(#masaGoldGrad)' : '#0284C7'} />
          <path d="M115 190 C123 190 131 193 134 199 C129 203 121 204 115 203 Z" fill={variant === 'white' ? '#FFFFFF' : variant === 'gold' ? 'url(#masaGoldGrad)' : '#0284C7'} />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span className={`font-black tracking-tight text-sm sm:text-base leading-tight ${textColor}`}>
            مركز د. محمد فوزي
          </span>
          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 tracking-wide">
            masa • الماسة لتجميل وزراعة الأسنان
          </span>
        </div>
      )}
    </div>
  );
};
