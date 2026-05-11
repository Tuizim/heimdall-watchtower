import { Scroll, PenTool, Anchor } from 'lucide-react';

interface RetroHeaderProps {
  onCreateClick: () => void;
}

export function RetroHeader({ onCreateClick }: RetroHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
      <div className="flex items-center gap-5">
        <div className="p-4 bg-viking-blue/20 rounded-2xl border border-viking-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Scroll className="text-viking-blue" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Pergaminhos de Memória</h1>
          <p className="text-viking-text-dim font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <Anchor size={12} className="text-viking-gold" />
            O que o Clã não deve esquecer
          </p>
        </div>
      </div>

      <button
        onClick={onCreateClick}
        className="px-8 py-5 bg-viking-gold text-black font-black rounded-xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-viking-gold/20 text-xs uppercase tracking-widest"
      >
        <PenTool size={20} strokeWidth={3} />
        REGISTRAR NOTA
      </button>
    </header>
  );
}
