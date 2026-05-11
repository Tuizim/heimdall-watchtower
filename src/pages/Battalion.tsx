import React, { useEffect, useState } from 'react';
import { tasks as tasksApi, profiles as profilesApi } from '../lib/api';
import { Profile, Task } from '../types';
import { motion } from 'motion/react';
import { Users, Shield, Target, Award, Sword, Search } from 'lucide-react';

export default function Battalion() {
  const [warriors, setWarriors] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesData, tasksData] = await Promise.all([
        profilesApi.list(),
        tasksApi.list(),
      ]);
      setWarriors(profilesData as unknown as Profile[]);
      setTasks(tasksData as unknown as Task[]);
    } catch (err) {
      console.error("Erro ao carregar o batalhão:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWarriorStats = (warriorId: string) => {
    const completedTasks = tasks.filter(t => t.responsavel_id === warriorId && t.status === 'concluída');
    const totalPoints = completedTasks.reduce((acc, t) => acc + t.pontos, 0);
    const activeTasks = tasks.filter(t => t.responsavel_id === warriorId && t.status !== 'concluída').length;

    return {
      totalPoints,
      completedMissions: completedTasks.length,
      activeTasks
    };
  };

  const filteredWarriors = warriors.filter(w =>
    w.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.papel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.classe_viking.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => getWarriorStats(b.id).totalPoints - getWarriorStats(a.id).totalPoints);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-viking-blue" size={32} />
            <h1 className="text-4xl font-black tracking-tighter text-white">BATALHÃO DO CLÃ</h1>
          </div>
          <p className="text-viking-text-dim max-w-2xl font-medium">Conheça os bravos guerreiros que forjam o destino deste reino.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Buscar guerreiro ou classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 focus:border-viking-blue outline-none transition-all font-bold text-sm text-white"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="viking-card h-64 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWarriors.map((warrior, index) => {
            const stats = getWarriorStats(warrior.id);

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={warrior.id}
                className="viking-card group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 rotate-12 group-hover:rotate-0">
                  <Shield size={180} />
                </div>

                <div className="p-6 relative z-10 flex-1">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-4xl border-4 border-viking-blue overflow-hidden bg-viking-stone ring-8 ring-viking-blue/5 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <img
                          src={warrior.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${warrior.nome}`}
                          alt={warrior.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="absolute -top-3 -left-3 w-9 h-9 rounded-xl bg-viking-stone border border-white/10 text-slate-400 flex items-center justify-center font-black text-lg shadow-2xl transform -rotate-12 group-hover:rotate-0 transition-transform">
                        {index + 1}
                      </div>

                      <div className="absolute -bottom-2 -right-2 rounded-xl p-2 bg-viking-blue border-2 border-viking-stone text-white shadow-lg group-hover:rotate-12 transition-transform">
                        <Sword size={16} fill="currentColor" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-viking-blue font-black uppercase tracking-[0.3em]">{warrior.papel || warrior.classe_viking}</span>
                      <h3 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-viking-gold transition-colors">{warrior.nome}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 group-hover:border-viking-gold/20 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={12} className="text-viking-gold" />
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Glória</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{stats.totalPoints}</span>
                        <span className="text-[10px] font-bold text-viking-gold">pts</span>
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 group-hover:border-viking-blue/20 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={12} className="text-viking-blue" />
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Missões</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{stats.completedMissions}</span>
                        <span className="text-[10px] font-bold text-viking-blue">mng</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nível {Math.floor(stats.totalPoints / 50) + 1}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                      {stats.activeTasks > 0 ? `${stats.activeTasks} em batalha` : 'Aguardando missões'}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-black/60 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats.totalPoints % 50) * 2)}%` }}
                    className="absolute h-full bg-linear-to-r from-viking-blue to-cyan-400 shadow-[0_0_15px_rgba(0,209,255,0.3)]"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredWarriors.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-40 viking-card border-dashed">
          <Shield className="text-slate-700 mb-6 animate-pulse" size={48} />
          <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest italic">Nenhum guerreiro encontrado</h3>
          <p className="text-slate-600 mt-2 font-medium">As brumas de Helheim ocultaram este nome.</p>
        </div>
      )}
    </div>
  );
}
