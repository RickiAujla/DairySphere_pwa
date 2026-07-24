import React from 'react';

interface FormWrapperProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  label,
  required = false,
  error,
  helperText,
  className = '',
  labelClassName = '',
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className={`block text-xs font-semibold text-slate-300 dark:text-slate-300 ${labelClassName}`}>
          {label}
          {required && <span className="text-rose-400 ml-1 font-bold">*</span>}
        </label>
      )}

      <div>{children}</div>

      {error ? (
        <p className="text-[11px] font-medium text-rose-400 dark:text-rose-400 animate-fade-in">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
