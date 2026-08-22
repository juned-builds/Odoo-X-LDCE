import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-700/25 border border-teal-400/30 shrink-0 group`}
      >
        <Compass className="w-3/5 h-3/5 transition-transform duration-500 group-hover:rotate-45" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
          <Sparkles className="w-2 h-2 text-amber-950" />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold tracking-tight text-slate-900 ${titleSizes[size]}`}>
            Globe<span className="text-teal-600">Trotter</span>
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 uppercase tracking-wider">
            Plan & Explore
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] font-medium text-slate-500 tracking-normal">
            Empowering Personalized Travel Planning
          </p>
        )}
      </div>
    </div>
  );
};
