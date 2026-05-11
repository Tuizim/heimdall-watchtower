import { GitBranch, CheckCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useBranches } from '../../hooks/useBranches';
import type { Branch } from '../../lib/api';

export function BranchStats() {
  const { data: branches = [] } = useBranches();

  const stats = useMemo(() => ({
    total:   branches.length,
    updated: branches.filter((b: Branch) => b.status === 'atualizada').length,
  }), [branches]);

  return (
    <footer className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'Frotas Ativas', value: stats.total,   icon: GitBranch,  color: 'text-viking-blue' },
        { label: 'Atualizadas',   value: stats.updated, icon: CheckCheck, color: 'text-emerald-500' },
      ].map(stat => (
        <div key={stat.label} className="viking-card p-6 flex flex-col justify-between group hover:border-white/10 transition-all border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <span className="text-4xl font-black text-white group-hover:scale-110 transition-transform">{stat.value}</span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-[0.2em]">{stat.label}</p>
        </div>
      ))}
    </footer>
  );
}
