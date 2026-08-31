import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'flat' | 'emblem';
}

export const BrandIcon: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-5 h-5 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative ${dim} bg-gradient-to-br from-blue-600 via-blue-900 to-slate-950 p-1 flex items-center justify-center shadow-md shadow-blue-950/60 border border-blue-400/30 overflow-hidden flex-shrink-0 group ${className}`}
      title="T&S Industrial Service"
    >
      <img
        src="/logo.png"
        alt="T&S Icon"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain filter drop-shadow"
        onError={(e) => {
          const target = e.currentTarget;
          target.src = '/logo.svg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    xs: { img: 'w-6 h-6 rounded-md', textTitle: 'text-[11px]', textSub: 'text-[8px]' },
    sm: { img: 'w-8 h-8 rounded-lg', textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { img: 'w-10 h-10 rounded-xl', textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { img: 'w-14 h-14 rounded-2xl', textTitle: 'text-lg', textSub: 'text-xs' },
    xl: { img: 'w-20 h-20 rounded-2xl', textTitle: 'text-2xl', textSub: 'text-sm' },
    '2xl': { img: 'w-28 h-28 rounded-3xl', textTitle: 'text-3xl', textSub: 'text-base' },
  };

  const { img, textTitle, textSub } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon with Industrial Gear & Yellow Lightning Bolt */}
      <div className={`relative ${img} bg-gradient-to-br from-blue-600 via-blue-900 to-slate-950 p-1.5 flex items-center justify-center shadow-lg shadow-blue-950/60 border border-blue-400/30 overflow-hidden flex-shrink-0 group`}>
        <img
          src="/logo.png"
          alt="T&S Industrial Service Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain filter drop-shadow"
          onError={(e) => {
            const target = e.currentTarget;
            target.src = '/logo.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-slate-100 tracking-tight leading-none ${textTitle}`}>
              T&amp;S
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
