"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, required, error, className, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-white/90"
          >
            {label} {required && <span className="text-red-400">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-white/5 border border-white/20",
            "text-white placeholder:text-white/40",
            "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50",
            "transition-all duration-200",
            error &&
              "border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);
AdminInput.displayName = "AdminInput";

interface AdminTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export const AdminTextarea = forwardRef<
  HTMLTextAreaElement,
  AdminTextareaProps
>(({ label, required, error, className, id, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white/90">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full px-4 py-3 rounded-xl resize-none",
          "bg-white/5 border border-white/20",
          "text-white placeholder:text-white/40",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50",
          "transition-all duration-200",
          error &&
            "border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
});
AdminTextarea.displayName = "AdminTextarea";

interface AdminSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export function AdminSelect({
  label,
  required,
  error,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
  id,
}: AdminSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white/90">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-4 py-3 rounded-xl",
          "bg-white/5 border border-white/20",
          "text-white",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50",
          "transition-all duration-200",
          "[&>option]:bg-slate-800 [&>option]:text-white",
          error &&
            "border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50",
          !value && "text-white/40",
          className
        )}
      >
        <option value="" disabled className="text-white/40">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
