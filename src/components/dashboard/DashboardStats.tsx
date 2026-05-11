import { useContext, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Sword, TrendingUp, Star } from 'lucide-react';
import { AuthContext } from '../../App';
import { useTasks } from '../../hooks/useTasks';

export function DashboardStats() {
  const { profile } = useContext(AuthContext);
  const { data: tasks = [] } = useTasks();

  const completedPoints = useMemo(
    () => tasks.filter(t => t.status === 'concluída').reduce((acc, t) => acc + (t.pontos ?? 0), 0),
    [tasks]
  );

  return (
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
        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-viking-blue mb-6 block">Seu Papel</span>
        <div className="mb-6 pr-16">
          <span className="text-2xl font-black text-white leading-tight uppercase tracking-tight italic">{profile?.papel || 'Desenvolvedor'}</span>
        </div>
        <div className="flex items-center gap-2 text-viking-blue">
          <Star size={16} fill="currentColor" />
          <span className="text-xs font-black uppercase tracking-widest truncate">{profile?.classe_viking || 'Guerreiro do Reino'}</span>
        </div>
      </motion.div>
    </section>
  );
}
