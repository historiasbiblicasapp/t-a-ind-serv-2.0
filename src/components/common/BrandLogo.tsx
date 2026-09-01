import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'flat' | 'emblem';
}

/**
 * Exact Vector Reproduction of the Official T&A Industrial Service Emblem
 * 10-Tooth Precision White Industrial Gear + Center Electric Yellow Lightning Bolt
 */
export const GearBoltIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`flex-shrink-0 select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 10-Tooth White Industrial Gear with Inner Cutout */}
      <path
        d="
          M 90.93 42.71 L 91.85 22.43 L 108.15 22.43 L 109.07 42.71 
          L 126.33 48.32 L 139.00 32.45 L 152.19 42.03 L 141.01 58.99 
          L 151.68 73.67 L 171.26 68.27 L 176.30 83.78 L 157.29 90.93 
          L 157.29 109.07 L 176.30 116.22 L 171.26 131.73 L 151.68 126.33 
          L 141.01 141.01 L 152.19 157.97 L 139.00 167.55 L 126.33 151.68 
          L 109.07 157.29 L 108.15 177.57 L 91.85 177.57 L 90.93 157.29 
          L 73.67 151.68 L 61.00 167.55 L 47.81 157.97 L 58.99 141.01 
          L 48.32 126.33 L 28.74 131.73 L 23.70 116.22 L 42.71 109.07 
          L 42.71 90.93 L 23.70 83.78 L 28.74 68.27 L 48.32 73.67 
          L 58.99 58.99 L 47.81 42.03 L 61.00 32.45 L 73.67 48.32 Z
          M 100 60
          A 40 40 0 1 0 100 140
          A 40 40 0 1 0 100 60 Z
        "
        fill="#f8fafc"
        fillRule="evenodd"
      />

      {/* Bright Yellow Electric Lightning Bolt */}
      <polygon
        points="
          112,14 
          148,38 
          112,72 
          138,72 
          92,126 
          116,126 
          55,184 
          82,118 
          64,118 
          86,64 
          66,64
        "
        fill="#ffd500"
      />
    </svg>
  );
};

export const BrandIcon: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: { wrap: 'w-6 h-6 rounded-lg p-0.5', iconSize: 18 },
    sm: { wrap: 'w-8 h-8 rounded-lg p-1', iconSize: 24 },
    md: { wrap: 'w-10 h-10 rounded-xl p-1.5', iconSize: 30 },
    lg: { wrap: 'w-12 h-12 rounded-xl p-1.5', iconSize: 38 },
    xl: { wrap: 'w-16 h-16 rounded-2xl p-2', iconSize: 52 },
  };

  const { wrap, iconSize } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative ${wrap} bg-[#19202a] border border-slate-700/80 flex items-center justify-center shadow-lg shadow-black/40 flex-shrink-0 group overflow-hidden ${className}`}
      title="T&A Industrial Service"
    >
      <GearBoltIcon size={iconSize} />
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    xs: { img: 'w-7 h-7 rounded-lg p-1', iconSize: 22, textTitle: 'text-xs', textSub: 'text-[8px]' },
    sm: { img: 'w-8 h-8 rounded-lg p-1', iconSize: 24, textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { img: 'w-10 h-10 rounded-xl p-1', iconSize: 32, textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { img: 'w-14 h-14 rounded-2xl p-1.5', iconSize: 44, textTitle: 'text-lg', textSub: 'text-xs' },
    xl: { img: 'w-24 h-24 rounded-3xl p-2.5', iconSize: 76, textTitle: 'text-2xl', textSub: 'text-sm' },
    '2xl': { img: 'w-32 h-32 rounded-3xl p-3', iconSize: 104, textTitle: 'text-3xl', textSub: 'text-base' },
  };

  const { img, iconSize, textTitle, textSub } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon: Official Emblem on Dark Box */}
      <div className={`relative ${img} bg-[#19202a] border border-slate-700/80 flex items-center justify-center shadow-xl shadow-black/60 flex-shrink-0 group overflow-hidden transition-transform duration-200 hover:scale-[1.03]`}>
        <GearBoltIcon size={iconSize} />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-slate-100 tracking-tight leading-none ${textTitle}`}>
              T&amp;A
            </span>
            <span className={`font-bold text-amber-400 tracking-tight leading-none ${textTitle}`}>
              Industrial
            </span>
          </div>
          <span className={`uppercase font-bold tracking-widest text-slate-400 mt-1 leading-none ${textSub}`}>
            Industrial Service
          </span>
        </div>
      )}
    </div>
  );
};
