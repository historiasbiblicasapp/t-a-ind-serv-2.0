import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'flat' | 'emblem';
}

/**
 * Clean Gear + Lightning Bolt Miniature Icon Component
 * Crisp vector render based on the official T&A Industrial emblem
 */
export const GearBoltIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gBolt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff04b" />
          <stop offset="45%" stop-color="#facc15" />
          <stop offset="100%" stop-color="#eab308" />
        </linearGradient>
        <linearGradient id="gMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="50%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
        <filter id="gShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.35" />
        </filter>
      </defs>
      <g transform="translate(100, 100)" filter="url(#gShadow)">
        {/* Industrial Gear */}
        <path
          d="M -16,-82 L 16,-82 L 14,-65 A 66 66 0 0 1 45,-47 L 60,-57 L 80,-34 L 66,-21 A 66 66 0 0 1 73,15 L 89,26 L 79,53 L 57,47 A 66 66 0 0 1 31,70 L 31,90 L -2,92 L -10,71 A 66 66 0 0 1 -45,53 L -63,68 L -82,46 L -68,30 A 66 66 0 0 1 -72,-9 L -92,-17 L -86,-47 L -63,-42 A 66 66 0 0 1 -39,-62 L -34,-80 Z"
          fill="url(#gMetal)"
          stroke="#94a3b8"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Inner Ring */}
        <circle cx="-1" cy="4" r="42" fill="none" stroke="#94a3b8" strokeWidth="3.5" />
        {/* Yellow Electric Lightning Bolt */}
        <polygon
          points="12,-90 -28,-8 3,-8 -48,92 52,-18 18,-18"
          fill="url(#gBolt)"
          stroke="#ca8a04"
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />
      </g>
    </svg>
  );
};

export const BrandIcon: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: { wrap: 'w-6 h-6 rounded-md p-0.5', iconSize: 18 },
    sm: { wrap: 'w-8 h-8 rounded-lg p-1', iconSize: 24 },
    md: { wrap: 'w-10 h-10 rounded-xl p-1.5', iconSize: 30 },
    lg: { wrap: 'w-12 h-12 rounded-xl p-1.5', iconSize: 38 },
    xl: { wrap: 'w-16 h-16 rounded-2xl p-2', iconSize: 52 },
  };

  const { wrap, iconSize } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative ${wrap} bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 flex items-center justify-center shadow-md flex-shrink-0 group overflow-hidden ${className}`}
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
    xs: { img: 'w-7 h-7 rounded-md p-1', iconSize: 20, textTitle: 'text-xs', textSub: 'text-[8px]' },
    sm: { img: 'w-8 h-8 rounded-lg p-1', iconSize: 24, textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { img: 'w-10 h-10 rounded-xl p-1.5', iconSize: 30, textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { img: 'w-14 h-14 rounded-2xl p-2', iconSize: 42, textTitle: 'text-lg', textSub: 'text-xs' },
    xl: { img: 'w-20 h-20 rounded-2xl p-3', iconSize: 58, textTitle: 'text-2xl', textSub: 'text-sm' },
    '2xl': { img: 'w-28 h-28 rounded-3xl p-4', iconSize: 84, textTitle: 'text-3xl', textSub: 'text-base' },
  };

  const { img, iconSize, textTitle, textSub } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon: Clean Industrial Gear + Yellow Lightning Bolt */}
      <div className={`relative ${img} bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 flex items-center justify-center shadow-lg shadow-black/50 flex-shrink-0 group overflow-hidden`}>
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
