import React, { useEffect, useState, useContext } from 'react';
import { branches as branchesApi, profiles as profilesApi } from '../lib/api';
import { Profile } from '../types';
import { AuthContext } from '../App';
import {
  GitBranch,
  Terminal,
  Clock,
  User,
  RefreshCw,
  GitPullRequest,
  Zap,
  Plus,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Branch {
  id: string;
  nome_branch: string;
  responsavel_id?: string;
  ultimo_update: string;
  status: string;
  observacao?: string;
}

export default function Branches() {
  const { profile } = useContext(AuthContext);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ nome_branch: '', responsavel_id: '' });

  const [colaboradores, setColaboradores] = useState<Profile[]>([]);
  const [checkingBranch, setCheckingBranch] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const data = await profilesApi.list();
      setColaboradores(data as unknown as Profile[]);
    } catch (err) {
      console.error(err);
    }
  };

  const allColaboradores = React.useMemo(() => {
    const list = [...colaboradores];
    if (profile && !list.find(c => c.id === profile.id)) {
      list.push(profile);
    }
    return list;
  }, [colaboradores, profile]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesApi.list();
      setBranches(data as unknown as Branch[]);
    } catch (err) {
      console.error('Erro ao buscar branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await branchesApi.create({
        nome_branch: newBranch.nome_branch,
        responsavel_id: newBranch.responsavel_id || undefined,
        status: 'em progresso',
      });
      setIsModalOpen(false);
      setNewBranch({ nome_branch: '', responsavel_id: '' });
      fetchBranches();
    } catch (err) {
      console.error('Erro ao criar branch:', err);
    }
  };

  const handleCheckUpdate = async (id: string) => {
    setCheckingBranch(id);
    try {
      await branchesApi.update(id, { status: 'atualizada' });
      fetchBranches();
    } catch (err) {
      console.error('Erro ao marcar atualização:', err);
    } finally {
      setCheckingBranch(null);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    try {
      await branchesApi.delete(id);
      fetchBranches();
    } catch (err) {
      console.error('Erro ao apagar branch:', err);
    }
  };

  return (
    <div className="space-y-10 pb-12">
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
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-4 bg-viking-blue text-white font-black rounded-xl hover:scale-105 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-viking-blue/20"
          >
            <Plus size={20} />
            NOVA ROTA
          </button>
          <button
            onClick={fetchBranches}
            className="p-4 glass border border-white/10 rounded-2xl hover:bg-viking-blue/20 transition-all text-viking-blue group"
            title="Refrescar Bifröst"
          >
            <RefreshCw size={24} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* Modal de Nova Branch */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-viking-stone border border-viking-blue/30 rounded-2xl p-8 w-full max-w-xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <h3 className="text-2xl font-black mb-6 text-viking-blue flex items-center gap-3">
                <GitBranch size={24} />
                NOVA ROTA (BRANCH)
              </h3>

              <form onSubmit={handleCreateBranch} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Nome da Rota (Branch)</label>
                  <input
                    required
                    value={newBranch.nome_branch}
                    onChange={e => setNewBranch({ ...newBranch, nome_branch: e.target.value })}
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-viking-blue outline-none transition-all"
                    placeholder="Ex: feature/reforco-scudos"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Explorador Responsável</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allColaboradores.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewBranch({ ...newBranch, responsavel_id: c.id })}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${newBranch.responsavel_id === c.id ? 'bg-viking-blue text-white border-viking-blue scale-105 shadow-lg shadow-viking-blue/20' : 'bg-white/5 border-white/10 text-slate-300 hover:border-viking-blue/50'}`}
                      >
                        <div className="w-8 h-8 rounded-full border border-current overflow-hidden shrink-0">
                          <img src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.nome}`} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter truncate">{c.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 glass rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-viking-blue text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-blue/20"
                  >
                    Abrir Rota
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim">Rota (Branch)</th>
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim">Explorador</th>
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim text-right">Último Check</th>
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {branches.map((branch) => {
                const resp = allColaboradores.find(c => c.id === branch.responsavel_id);
                const isChecked = branch.status === 'atualizada';

                return (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={branch.id}
                    className="hover:bg-viking-blue/[0.03] transition-colors group"
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
                          {resp?.avatar_url ? (
                            <img src={resp.avatar_url} alt={resp.nome} className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} className="text-slate-600" />
                          )}
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
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${isChecked ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'}`}
                        >
                          {checkingBranch === branch.id
                            ? <RefreshCw size={14} className="animate-spin" />
                            : <CheckCheck size={14} />
                          }
                          <span className="hidden md:inline">{isChecked ? 'OK' : 'Check'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
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

              {branches.length === 0 && !loading && (
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

      <footer className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Frotas Ativas', value: branches.length, icon: GitBranch, color: 'text-viking-blue' },
          { label: 'Atualizadas', value: branches.filter(b => b.status === 'atualizada').length, icon: CheckCheck, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="viking-card p-6 flex flex-col justify-between group hover:border-white/10 transition-all border border-white/5">
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
    </div>
  );
}
