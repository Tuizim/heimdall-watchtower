import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const { data: tasksData } = await supabase.from('tasks').select('*');
      
      setWarriors(profilesData || []);
      setTasks(tasksData || []);
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
            const isTopThree = index < 3;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={warrior.id}
                className="viking-card group relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12 group-hover:rotate-0 transition-all duration-700">
                   <Shield size={180} />
                </div>
                
                {index === 0 && (
                  <div className="absolute top-4 right-4 bg-viking-gold text-black px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl z-10 animate-bounce">
                    Rei do Reino
                  </div>
                )}

                <div className="p-8 relative z-10">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-6">
                      <div className={`w-32 h-32 rounded-[2.5rem] border-4 overflow-hidden bg-viking-stone ring-8 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                        index === 0 ? 'border-viking-gold ring-viking-gold/10' : 
                        index === 1 ? 'border-slate-300 ring-slate-300/10' :
                        index === 2 ? 'border-amber-700 ring-amber-700/10' :
                        'border-viking-blue ring-viking-blue/5'
                      }`}>
                        <img 
                          src={warrior.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${warrior.nome}`} 
                          alt={warrior.nome} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Rank Badge */}
                      <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl border-2 transform -rotate-12 group-hover:rotate-0 transition-transform ${
                        index === 0 ? 'bg-viking-gold border-white/20 text-black' :
                        index === 1 ? 'bg-slate-300 border-white/20 text-black' :
                        index === 2 ? 'bg-amber-700 border-white/20 text-white' :
                        'bg-viking-stone border-white/10 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>

                      <div className={`absolute -bottom-2 -right-2 rounded-xl p-2.5 border-2 border-viking-stone shadow-lg group-hover:rotate-12 transition-transform ${
                        index === 0 ? 'bg-viking-gold text-black' : 'bg-viking-blue text-white'
                      }`}>
                        <Sword size={20} fill="currentColor" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] text-viking-blue font-black uppercase tracking-[0.3em]">{warrior.classe_viking}</span>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-viking-gold transition-colors">{warrior.nome}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-white/5 group-hover:border-viking-gold/20 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={14} className="text-viking-gold" />
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Glória</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{stats.totalPoints}</span>
                        <span className="text-[10px] font-bold text-viking-gold">pts</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-white/5 group-hover:border-viking-blue/20 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-viking-blue" />
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Missões</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{stats.completedMissions}</span>
                        <span className="text-[10px] font-bold text-viking-blue">mng</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nível {Math.floor(stats.totalPoints / 50) + 1}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                      {stats.activeTasks > 0 ? `${stats.activeTasks} em batalha` : 'Aguardando missões'}
                    </span>
                  </div>
                </div>
                
                {/* Level Progress Bar */}
                <div className="h-1.5 w-full bg-black/60 relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(100, (stats.totalPoints % 50) * 2)}%` }}
                     className="absolute h-full bg-gradient-to-r from-viking-blue to-cyan-400 shadow-[0_0_15px_rgba(0,209,255,0.3)]"
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
