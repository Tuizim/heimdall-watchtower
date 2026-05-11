import { type ComponentType } from 'react';
import { type LucideProps } from 'lucide-react';

interface EmptyStateProps {
  icon: ComponentType<LucideProps>;
  title: string;
  description?: string;
  /** Classe aplicada ao wrapper externo (py-*, col-span-full, viking-card, etc.). */
  className?: string;
  iconClassName?: string;
  iconSize?: number;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className = '',
  iconClassName = 'text-slate-700 mb-6 animate-pulse',
  iconSize = 64,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <Icon size={iconSize} className={iconClassName} />
      <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">{title}</h3>
      {description && <p className="text-slate-600 mt-2 font-medium">{description}</p>}
    </div>
  );
}
