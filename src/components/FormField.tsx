import { type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className = 'space-y-2' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">{label}</label>
      {children}
      {error && <p className="text-rose-400 text-xs">{error}</p>}
    </div>
  );
}
