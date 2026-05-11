import { useContext } from 'react';
import { Sword, Plus, Flame } from 'lucide-react';
import { AuthContext } from '../../App';

interface DeliveriesHeaderProps {
  onCreateClick: () => void;
  onRagnarokClick: () => void;
}

export function DeliveriesHeader({ onCreateClick, onRagnarokClick }: DeliveriesHeaderProps) {
  const { profile } = useContext(AuthContext);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sword className="text-viking-gold" size={32} />
          <h1 className="text-4xl font-black tracking-tighter text-white">PAINEL DE ENTREGAS</h1>
        </div>
        <p className="text-viking-text-dim max-w-2xl font-medium">Gerencie as missões do reino e garanta que cada conquista seja registrada no Hall da Fama.</p>
      </div>

      <div className="flex items-center gap-4">
        {profile?.role === 'admin' && (
          <button
            onClick={onRagnarokClick}
            className="flex-1 md:flex-none px-6 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 group"
            title="Ragnarök: Limpar Missões"
          >
            <Flame size={20} className="group-hover:animate-bounce" />
            <span className="text-xs font-black uppercase tracking-widest">Ragnarök</span>
          </button>
        )}
        <button
          onClick={onCreateClick}
          className="flex-1 md:flex-none px-6 py-4 bg-viking-gold text-black font-black rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-viking-gold/30 text-xs uppercase tracking-wider"
        >
          <Plus size={20} strokeWidth={3} />
          CONVOCAR MISSÃO
        </button>
      </div>
    </header>
  );
}
