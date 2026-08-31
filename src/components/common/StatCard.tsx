import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  color = 'amber',
  onClick,
}) => {
  const colorMap = {
    amber: {
      bg: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400',
      glow: 'shadow-amber-950/20',
    },
    blue: {
      bg: 'from-blue-500/10 to-blue-500/5',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/15 text-blue-400',
      glow: 'shadow-blue-950/20',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      glow: 'shadow-emerald-950/20',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-500/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400',
      glow: 'shadow-rose-950/20',
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-500/5',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/15 text-purple-400',
      glow: 'shadow-purple-950/20',
    },
    slate: {
      bg: 'from-slate-800/40 to-slate-900/40',
      border: 'border-slate-800 hover:border-slate-700',
      iconBg: 'bg-slate-800 text-slate-400',
      glow: 'shadow-slate-950/20',
    },
  };

  const selected = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border bg-gradient-to-br ${selected.bg} ${selected.border} ${
        onClick ? 'cursor-pointer transform hover:-translate-y-0.5 transition-all' : ''
      } shadow-lg ${selected.glow} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1 font-mono tracking-tight">
            {value}
          </h4>
        </div>
        <div className={`p-3 rounded-lg ${selected.iconBg} border border-white/5`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
          {subtext && <span className="text-slate-400 truncate">{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
