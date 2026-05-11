import { useContext, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { GitBranch, Terminal, Clock, User, RefreshCw, Zap, Trash2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBranches, useUpdateBranch, useDeleteBranch } from '../../hooks/useBranches';
import { useProfiles } from '../../hooks/useProfiles';
import { AuthContext } from '../../App';
import { UserAvatar } from '../UserAvatar';
import type { Profile } from '../../lib/api';

export function BranchTable() {
  const { profile } = useContext(AuthContext);
  const { data: branches = [], isLoading } = useBranches();
  const { data: colaboradores = [] } = useProfiles();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();
  const [checkingBranch, setCheckingBranch] = useState<string | null>(null);

  const allColaboradores = useMemo<Profile[]>(() => {
    const map = new Map(colaboradores.map(c => [c.id, c]));
    if (profile) map.set(profile.id, profile as Profile);
    return Array.from(map.values());
  }, [colaboradores, profile]);

  const handleCheckUpdate = async (id: string) => {
    setCheckingBranch(id);
    try {
      await updateBranch.mutateAsync({ id, data: { status: 'atualizada' } });
    } finally {
      setCheckingBranch(null);
    }
  };

  return (
    <div className="viking-card p-0 overflow-hidden border-viking-blue/10">
      <div className="bg-slate-950/90 p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-viking-blue" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Heimdall Binary-Watch v2.0 - Bifröst Connection Active</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-viking-gold" />
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim">Rota (Branch)</th>
              <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim">Explorador</th>
              <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim text-right">Último Check</th>
              <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {branches.map(branch => {
              const resp      = allColaboradores.find(c => c.id === branch.responsavel_id);
              const isChecked = branch.status === 'atualizada';

              return (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={branch.id}
                  className="hover:bg-viking-blue/3 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded border border-white/5 text-viking-blue">
                        <GitBranch size={14} />
                      </div>
                      <span className="font-mono text-viking-blue font-bold group-hover:text-viking-gold transition-colors">{branch.nome_branch}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                        {resp?.avatar_url
                          ? <UserAvatar nome={resp.nome} avatarUrl={resp.avatar_url} />
                          : <User size={16} className="text-slate-600" />
                        }
                      </div>
                      <span className="text-slate-300 font-bold whitespace-nowrap">
                        {resp?.nome || 'Guerreiro Desconhecido'}
                        {resp?.id === profile?.id ? ' (Você)' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-white font-mono font-bold block">
                      {new Date(branch.ultimo_update).toLocaleDateString('pt-BR')}
                      <span className="text-xs text-viking-text-dim ml-2 font-normal">
                        {new Date(branch.ultimo_update).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                    <span className="text-[10px] text-viking-text-dim flex items-center justify-end gap-2 uppercase tracking-widest mt-1">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(branch.ultimo_update), { addSuffix: true, locale: ptBR })}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCheckUpdate(branch.id)}
                        disabled={checkingBranch === branch.id}
                        title="Marcar como Atualizada"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${
                          isChecked
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                        }`}
                      >
                        {checkingBranch === branch.id
                          ? <RefreshCw size={14} className="animate-spin" />
                          : <CheckCheck size={14} />
                        }
                        <span className="hidden md:inline">{isChecked ? 'OK' : 'Check'}</span>
                      </button>
                      <button
                        onClick={() => deleteBranch.mutate(branch.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                        title="Apagar Rota"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}

            {branches.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <Zap size={64} className="text-slate-800" />
                    <div className="max-w-xs">
                      <p className="text-xl font-black text-slate-500 uppercase tracking-widest mb-2">Sem Rotas</p>
                      <p className="text-sm text-slate-700 leading-relaxed italic">"Nenhum barco partiu para novos horizontes de código hoje, irmão."</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
