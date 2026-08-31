import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8', textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { img: 'w-10 h-10', textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { img: 'w-14 h-14', textTitle: 'text-lg', textSub: 'text-xs' },
    xl: { img: 'w-20 h-20', textTitle: 'text-2xl', textSub: 'text-sm' },
  };

  const { img, textTitle, textSub } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon with Gear & Lightning Graphic */}
      <div className={`relative ${img} rounded-xl bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 p-1 flex items-center justify-center shadow-lg shadow-blue-950/50 border border-blue-500/30 overflow-hidden flex-shrink-0 group`}>
        <img
          src="/logo.png"
          alt="T&S Industrial Service Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain filter drop-shadow"
          onError={(e) => {
            // Fallback to SVG if png not loaded
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
          <span className={`uppercase font-bold tracking-widest text-slate-400 mt-0.5 leading-none ${textSub}`}>
            Industrial Service
          </span>
        </div>
      )}
    </div>
  );
};
