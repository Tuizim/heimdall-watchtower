import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Branch, StatusBranch, Profile } from '../types';
import { AuthContext } from '../App';
import { 
  GitBranch, 
  Terminal, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  GitPullRequest,
  Zap,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MOCK_BRANCHES: Branch[] = [
  { id: '1', nome: 'feature/viking-tokens', status: 'em progresso', ultimo_update: new Date().toISOString() },
  { id: '2', nome: 'fix/shield-overflow', status: 'precisa rebase', ultimo_update: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', nome: 'main', status: 'atualizada', ultimo_update: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', nome: 'experiment/helheim-cache', status: 'abandonada', ultimo_update: new Date(Date.now() - 604800000).toISOString() },
];

export default function Branches() {
  const { profile } = useContext(AuthContext);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMocks, setUsingMocks] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    nome: '',
    responsavel_id: '',
    status: 'em progresso' as StatusBranch,
    ultimo_update: new Date().toISOString()
  });

  const [colaboradores, setColaboradores] = useState<Profile[]>([]);

  useEffect(() => {
    fetchBranches();
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setColaboradores(data);
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

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usingMocks) {
      const branchWithId = { 
        ...newBranch, 
        id: Math.random().toString(36).substr(2, 9),
        ultimo_update: new Date().toISOString()
      };
      setBranches([branchWithId as Branch, ...branches]);
      setIsModalOpen(false);
      return;
    }
    
    try {
      const { error } = await supabase.from('branches').insert([{
        ...newBranch,
        ultimo_update: new Date().toISOString()
      }]);
      if (error) throw error;
      setIsModalOpen(false);
      setNewBranch({ nome: '', responsavel_id: '', status: 'em progresso', ultimo_update: '' });
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('branches').select('*').order('ultimo_update', { ascending: false });
      if (error) throw error;
      
      setBranches(data || []);
      setUsingMocks(false);
    } catch (err) {
      console.error("Erro ao buscar branches:", err);
      setBranches(MOCK_BRANCHES);
      setUsingMocks(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: StatusBranch) => {
    try {
      const { error } = await supabase
        .from('branches')
        .update({ status, ultimo_update: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (usingMocks) {
      setBranches(branches.filter(b => b.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw error;
      fetchBranches();
    } catch (err) {
      console.error("Erro ao apagar branch:", err);
    }
  };

  const getStatusConfig = (status: StatusBranch) => {
    switch (status) {
      case 'atualizada': 
        return { icon: <CheckCircle2 size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Protegida' };
      case 'precisa rebase': 
        return { icon: <AlertCircle size={16} />, color: 'text-viking-gold', bg: 'bg-viking-gold/10', label: 'Conflito' };
      case 'abandonada': 
        return { icon: <XCircle size={16} />, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'No Helheim' };
      case 'em progresso': 
        return { icon: <RefreshCw size={16} className="animate-spin" />, color: 'text-viking-blue', bg: 'bg-viking-blue/10', label: 'Forjando' };
      default: 
        return { icon: <GitBranch size={16} />, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Status Desconhecido' };
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
                    value={newBranch.nome}
                    onChange={e => setNewBranch({...newBranch, nome: e.target.value})}
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
                        onClick={() => setNewBranch({...newBranch, responsavel_id: c.id})}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${newBranch.responsavel_id === c.id ? 'bg-viking-blue text-white border-viking-blue scale-105 shadow-lg shadow-viking-blue/20' : 'bg-white/5 border-white/10 text-slate-300 hover:border-viking-blue/50'}`}
                      >
                        <div className="w-8 h-8 rounded-full border border-current overflow-hidden flex-shrink-0">
                          <img src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.nome}`} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter truncate">{c.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Status Inicial</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'em progresso', label: 'Forjando' },
                      { id: 'atualizada', label: 'Protegida' },
                      { id: 'precisa rebase', label: 'Conflito' },
                      { id: 'abandonada', label: 'No Helheim' }
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setNewBranch({...newBranch, status: s.id as StatusBranch})}
                        className={`py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${newBranch.status === s.id ? 'bg-white/10 border-viking-blue text-viking-blue' : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/10'}`}
                      >
                        {s.label}
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
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim">Estado</th>
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim">Rota (Branch)</th>
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim">Explorador</th>
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim text-right">Último Relato</th>
                <th className="px-8 py-5 text-[11px] uppercase font-black tracking-widest text-viking-text-dim text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {branches.map((branch) => {
                const config = getStatusConfig(branch.status);
                const resp = colaboradores.find(c => c.id === branch.responsavel_id);
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={branch.id} 
                    className="hover:bg-viking-blue/[0.03] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <select 
                        value={branch.status}
                        onChange={(e) => handleUpdateStatus(branch.id, e.target.value as StatusBranch)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 ${config.bg} ${config.color} bg-transparent outline-none cursor-pointer text-[10px] font-black uppercase tracking-tighter`}
                      >
                        <option value="em progresso" className="bg-viking-stone">Forjando</option>
                        <option value="atualizada" className="bg-viking-stone">Protegida</option>
                        <option value="precisa rebase" className="bg-viking-stone">Conflito</option>
                        <option value="abandonada" className="bg-viking-stone">No Helheim</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded border border-white/5 text-viking-blue">
                          <GitBranch size={14} />
                        </div>
                        <span className="font-mono text-viking-blue font-bold group-hover:text-viking-gold transition-colors">{branch.nome}</span>
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
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="p-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                        title="Apagar Rota"
                      >
                        <Trash2 size={16} />
                      </button>
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

      <footer className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Frotas Ativas', value: branches.length, icon: GitBranch, color: 'text-viking-blue' },
          { label: 'Rebase Necessário', value: branches.filter(b => b.status === 'precisa rebase').length, icon: AlertCircle, color: 'text-viking-gold' },
          { label: 'Camada Segura', value: branches.filter(b => b.status === 'atualizada').length, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Navios Fantasmas', value: branches.filter(b => b.status === 'abandonada').length, icon: XCircle, color: 'text-rose-500' },
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
