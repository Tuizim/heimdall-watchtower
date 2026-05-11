import { Shield } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="px-1">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-viking-gold/20 rounded-2xl border border-viking-gold/30">
          <Shield className="text-viking-gold" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Salão de Odin</h1>
          <p className="text-viking-text-dim font-medium uppercase tracking-[0.2em] text-xs">Ritmo da Batalha e Memórias do Clã</p>
        </div>
      </div>
    </header>
  );
}
