import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  id,
  checked,
  onChange,
  disabled,
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
  const generatedId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      <label
        htmlFor={generatedId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={generatedId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-150
              peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500 peer-focus-visible:ring-offset-2
              ${checked
                ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                : error
                  ? 'border-rose-400 bg-white hover:border-rose-500'
                  : 'border-slate-300 bg-white hover:border-teal-500 group-hover:border-slate-400'
              }
              ${className}
            `}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        {label && (
          <span className="text-xs text-slate-600 leading-relaxed font-normal">
            {label}
          </span>
        )}
      </label>

      {error && (
        <p className="text-xs text-rose-600 font-medium pl-7">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
