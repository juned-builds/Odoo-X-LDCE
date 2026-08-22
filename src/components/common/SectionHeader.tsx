import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1 transition-colors self-start sm:self-auto py-1"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
