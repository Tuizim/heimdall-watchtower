import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  /** Classe Tailwind para cor/tamanho do subtítulo. */
  subtitleClassName?: string;
  onClose: () => void;
  /** Nó renderizado antes do título (ex: ícone em caixa colorida). */
  icon?: ReactNode;
  mb?: string;
  /** `compact` usa texto menor e botão X com estilo glass — adequado para modais pequenos. */
  compact?: boolean;
}

export function ModalHeader({
  title,
  subtitle,
  subtitleClassName,
  onClose,
  icon,
  mb = 'mb-8',
  compact = false,
}: ModalHeaderProps) {
  const titleClass = compact
    ? 'text-xl font-black text-white uppercase'
    : 'text-3xl font-black text-white italic tracking-tighter uppercase';

  const defaultSubtitleClass = compact
    ? 'text-[10px] uppercase tracking-widest mt-1'
    : 'text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold';

  const closeClass = compact
    ? 'p-2 glass rounded-xl text-slate-400 hover:text-white transition-colors'
    : 'p-3 text-slate-400 hover:text-white transition-colors';

  return (
    <div className={`flex items-center justify-between ${mb}`}>
      <div className={icon ? 'flex items-center gap-4' : ''}>
        {icon}
        <div>
          <h2 className={titleClass}>{title}</h2>
          {subtitle && (
            <p className={subtitleClassName ?? defaultSubtitleClass}>{subtitle}</p>
          )}
        </div>
      </div>
      <button onClick={onClose} className={closeClass}>
        <X size={compact ? 18 : 24} />
      </button>
    </div>
  );
}
