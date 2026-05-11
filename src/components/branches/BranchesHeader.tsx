import { GitPullRequest, Plus, RefreshCw } from 'lucide-react';

interface BranchesHeaderProps {
  onCreateClick: () => void;
  onRefresh: () => void;
}

export function BranchesHeader({ onCreateClick, onRefresh }: BranchesHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
          <div className="p-2 bg-viking-blue/20 rounded-xl">
            <GitPullRequest className="text-viking-blue" size={32} />
          </div>
          PAINEL DE BRANCHES
        </h2>
        <p className="text-viking-text-dim text-lg italic">Mapas das rotas comerciais de código através dos reinos.</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onCreateClick}
          className="px-6 py-4 bg-viking-blue text-white font-black rounded-xl hover:scale-105 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-viking-blue/20"
        >
          <Plus size={20} />
          NOVA ROTA
        </button>
        <button
          onClick={onRefresh}
          className="p-4 glass border border-white/10 rounded-2xl hover:bg-viking-blue/20 transition-all text-viking-blue group"
          title="Refrescar Bifröst"
        >
          <RefreshCw size={24} className="group-active:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </header>
  );
}
