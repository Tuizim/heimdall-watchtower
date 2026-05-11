import { Shield } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { Profile } from '../lib/api';

type CollaboratorPickerVariant = 'card' | 'row';

interface CollaboratorPickerProps {
  profiles: Profile[];
  value: string;
  onChange: (id: string) => void;
  /**
   * `card` — grade vertical, avatar grande, cor dourada (Deliveries).
   * `row`  — grade horizontal, avatar pequeno, cor azul (Branches).
   */
  variant?: CollaboratorPickerVariant;
  columns?: string;
}

const VARIANT_CONFIG = {
  card: {
    grid: 'grid-cols-2 md:grid-cols-4 gap-4',
    button: 'flex flex-col items-center gap-3 p-4 rounded-2xl relative overflow-hidden',
    selected: 'bg-viking-gold text-black border-viking-gold ring-4 ring-viking-gold/20 scale-105',
    unselected: 'bg-white/5 border-white/10 text-slate-400 hover:border-viking-gold/50 hover:bg-white/10',
    avatar: 'w-14 h-14 rounded-full border-2 overflow-hidden transition-all',
    avatarSelected: 'border-black',
    avatarUnselected: 'border-viking-gold/30',
    nameClass: 'text-[10px] font-black uppercase tracking-tight text-center leading-tight h-8 flex items-center justify-center truncate w-full px-1',
    showShield: true,
  },
  row: {
    grid: 'grid-cols-2 md:grid-cols-3 gap-3',
    button: 'flex items-center gap-3 p-3 rounded-xl',
    selected: 'bg-viking-blue text-white border-viking-blue scale-105 shadow-lg shadow-viking-blue/20',
    unselected: 'bg-white/5 border-white/10 text-slate-300 hover:border-viking-blue/50',
    avatar: 'w-8 h-8 rounded-full border border-current overflow-hidden shrink-0',
    avatarSelected: '',
    avatarUnselected: '',
    nameClass: 'text-[10px] font-black uppercase tracking-tighter truncate',
    showShield: false,
  },
} as const;

export function CollaboratorPicker({
  profiles,
  value,
  onChange,
  variant = 'card',
  columns,
}: CollaboratorPickerProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <div className={`grid ${columns ?? cfg.grid}`}>
      {profiles.map(profile => {
        const isSelected = value === profile.id;
        return (
          <button
            key={profile.id}
            type="button"
            onClick={() => onChange(profile.id)}
            className={`${cfg.button} border transition-all ${isSelected ? cfg.selected : cfg.unselected}`}
          >
            <div className={`${cfg.avatar} ${isSelected ? cfg.avatarSelected : cfg.avatarUnselected}`}>
              <UserAvatar nome={profile.nome} avatarUrl={profile.avatar_url} />
            </div>
            <span className={cfg.nameClass}>{profile.nome}</span>
            {cfg.showShield && isSelected && (
              <div className="absolute top-1 right-1">
                <Shield size={12} className="text-black" fill="currentColor" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
