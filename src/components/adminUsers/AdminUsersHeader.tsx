import { Shield, UserPlus } from 'lucide-react';

interface AdminUsersHeaderProps {
  onCreateClick: () => void;
}

export function AdminUsersHeader({ onCreateClick }: AdminUsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="text-viking-gold" size={28} />
          <h1 className="text-3xl font-black text-white uppercase tracking-wide">Forja de Guerreiros</h1>
        </div>
        <p className="text-slate-500 text-sm">Crie e gerencie os guerreiros do clã</p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-5 py-3 bg-viking-gold text-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-gold/20"
      >
        <UserPlus size={18} />
        Convocar Guerreiro
      </button>
    </div>
  );
}
