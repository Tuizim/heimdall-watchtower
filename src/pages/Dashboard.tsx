import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Task } from '../types';
import { AuthContext } from '../App';
import { 
  Shield, 
  Trophy,
  Flame,
  Sword,
  Scroll,
  MessageSquare,
  History,
  TrendingUp,
  CircleDashed,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';

interface Reminder {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { profile } = useContext(AuthContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [warriors, setWarriors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointGoal] = useState(150);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: tasksData } = await supabase.from('tasks').select('*');
      const { data: retroData } = await supabase.from('retro_cards').select('*').order('created_at', { ascending: false }).limit(4);
      const { data: profilesData } = await supabase.from('profiles').select('*').limit(6);
      
      setTasks(tasksData || []);
      setReminders(retroData || []);
      setWarriors(profilesData || []);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const completedPoints = React.useMemo(() => {
    return tasks
      .filter(t => t.status === 'concluída')
      .reduce((acc, t) => acc + (t.pontos || 0), 0);
  }, [tasks]);

  const clanXp = React.useMemo(() => {
    return tasks.filter(t => t.status === 'concluída').length * 50;
  }, [tasks]);

  const progressPercentage = Math.min(100, Math.round((completedPoints / pointGoal) * 100));

  return (
    <div className="space-y-12 pb-20">
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

      {/* Grid de Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="viking-card p-8 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Trophy size={80} className="text-viking-gold" />
          </div>
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-viking-gold mb-6 block">Glória Alcançada</span>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-6xl font-black text-white leading-none">{completedPoints}</span>
          </div>
          <p className="mt-4 text-[10px] text-viking-text-dim font-bold uppercase tracking-widest">PONTOS DE GLÓRIA TOTAIS</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="viking-card p-8 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Flame size={80} className="text-rose-500" />
          </div>
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-rose-500 mb-6 block">Status do Clã</span>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-6xl font-black text-white leading-none">{tasks.length}</span>
            <span className="text-viking-text-dim font-bold mb-2 uppercase tracking-widest text-xs">Missões</span>
          </div>
          <div className="flex items-center gap-2 text-rose-500">
            <TrendingUp size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Nível de Atividade: Médio</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="viking-card p-8 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Sword size={80} className="text-viking-blue" />
          </div>
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-viking-blue mb-6 block">Sua Honra</span>
          <div className="flex items-end gap-3 mb-6">
             <span className="text-4xl font-black text-white leading-none uppercase tracking-tighter italic">{profile?.classe_viking || 'Recruta'}</span>
          </div>
          <div className="flex items-center gap-2 text-viking-blue">
            <Star size={16} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-widest">Guerreiro do Reino</span>
          </div>
        </motion.div>
      </section>

      {/* Main Content Area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Memory Scrolls / Reminders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
               <Scroll className="text-viking-gold" size={20} />
               Pergaminhos de Memória
             </h3>
             <a href="/retro" className="text-[10px] font-black uppercase tracking-widest text-viking-gold border-b border-viking-gold/20 pb-1 hover:border-viking-gold transition-all">Ver Todos</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.length > 0 ? reminders.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={item.id} 
                className="viking-card p-6 border-l-2 border-l-viking-blue/40 bg-viking-stone/40 backdrop-blur-sm group hover:border-l-viking-gold transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-slate-200 uppercase tracking-tight">{item.titulo}</h4>
                  <MessageSquare size={14} className="text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 italic leading-relaxed line-clamp-3">"{item.descricao}"</p>
                <div className="mt-4 flex items-center justify-between">
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-viking-blue/50 group-hover:bg-viking-gold transition-colors" />
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 text-center viking-card bg-transparent border-dashed">
                <CircleDashed className="mx-auto text-slate-700 mb-3 animate-spin-slow" />
                <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Nenhum pergaminho encontrado</p>
              </div>
            )}
          </div>

          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                 <Sword className="text-viking-blue" size={20} />
                 Bravo Batalhão
               </h3>
               <a href="/battalion" className="text-[10px] font-black uppercase tracking-widest text-viking-blue border-b border-viking-blue/20 pb-1 hover:border-viking-blue transition-all font-bold">Ver Alistamento</a>
            </div>
            
            <div className="viking-card p-6 bg-viking-blue/5 border-viking-blue/20">
               <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-6">Em destaque no Salão:</p>
               <div className="flex flex-wrap gap-4">
                 <div className="flex -space-x-4 overflow-hidden p-2">
                    {warriors.map((warrior) => (
                      <div key={warrior.id} className="inline-block h-16 w-16 rounded-2xl ring-4 ring-viking-stone overflow-hidden border-2 border-viking-blue bg-viking-stone shadow-xl">
                        <img 
                          className="h-full w-full object-cover" 
                          src={warrior.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${warrior.nome}`} 
                          alt={warrior.nome} 
                          title={warrior.nome}
                        />
                      </div>
                    ))}
                    {warriors.length === 0 && (
                      <div className="flex items-center justify-center h-16 w-16 rounded-2xl ring-4 ring-viking-stone bg-black/40 border-2 border-dashed border-viking-blue/30 text-viking-blue font-black text-xl">
                        +
                      </div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Quick Tips */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 px-1">
             <History className="text-viking-blue" size={20} />
             Conselhos de Guerra
          </h3>
          <div className="viking-card p-6 bg-gradient-to-br from-viking-blue/10 to-transparent">
             <ul className="space-y-6">
               <li className="flex gap-4">
                 <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-viking-blue/20 flex items-center justify-center text-viking-blue font-black text-xs">01</div>
                 <p className="text-sm text-slate-300 leading-relaxed font-medium">Lembre-se: uma missão <span className="text-viking-gold">entregue</span> vale mais que dez no papel.</p>
               </li>
               <li className="flex gap-4">
                 <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-viking-blue/20 flex items-center justify-center text-viking-blue font-black text-xs">02</div>
                 <p className="text-sm text-slate-300 leading-relaxed font-medium">As <span className="text-viking-gold">Memory Scrolls</span> são cruciais para o aprendizado do clã.</p>
               </li>
               <li className="flex gap-4">
                 <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-viking-blue/20 flex items-center justify-center text-viking-blue font-black text-xs">03</div>
                 <p className="text-sm text-slate-300 leading-relaxed font-medium">O esforço em <span className="text-viking-gold">Pontos de Glória</span> dita sua posição no Salão.</p>
               </li>
             </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
