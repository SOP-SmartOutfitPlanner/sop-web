import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helper?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  helper,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-white/80 tracking-wide"
      >
        {label}
      </label>
      {children}
      {helper && !error && (
        <p className="text-xs text-white/55 leading-tight">{helper}</p>
      )}
      {error && <p className="text-xs text-rose-300 leading-tight">{error}</p>}
    </div>
  );
}
