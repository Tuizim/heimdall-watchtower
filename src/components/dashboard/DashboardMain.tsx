import { motion } from 'motion/react';
import { Scroll, MessageSquare, Sword, History, CircleDashed } from 'lucide-react';
import { useRetroCards } from '../../hooks/useRetro';
import { useProfiles } from '../../hooks/useProfiles';
import { UserAvatar } from '../UserAvatar';

export function DashboardMain() {
  const { data: retroCards = [] } = useRetroCards();
  const { data: warriors = [] } = useProfiles();

  const recentReminders = retroCards.slice(0, 4);
  const featuredWarriors = warriors.slice(0, 6);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
            <Scroll className="text-viking-gold" size={20} />
            Pergaminhos de Memória
          </h3>
          <a href="/retro" className="text-[10px] font-black uppercase tracking-widest text-viking-gold border-b border-viking-gold/20 pb-1 hover:border-viking-gold transition-all">Ver Todos</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentReminders.length > 0 ? recentReminders.map((item, idx) => (
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
            <a href="/battalion" className="text-[10px] font-black uppercase tracking-widest text-viking-blue border-b border-viking-blue/20 pb-1 hover:border-viking-blue transition-all">Ver Alistamento</a>
          </div>

          <div className="viking-card p-6 bg-viking-blue/5 border-viking-blue/20">
            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-6">Em destaque no Salão:</p>
            <div className="flex -space-x-4 overflow-hidden p-2">
              {featuredWarriors.map(warrior => (
                <div key={warrior.id} className="inline-block h-16 w-16 rounded-2xl ring-4 ring-viking-stone overflow-hidden border-2 border-viking-blue bg-viking-stone shadow-xl" title={warrior.nome}>
                  <UserAvatar nome={warrior.nome} avatarUrl={warrior.avatar_url} />
                </div>
              ))}
              {featuredWarriors.length === 0 && (
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl ring-4 ring-viking-stone bg-black/40 border-2 border-dashed border-viking-blue/30 text-viking-blue font-black text-xl">+</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 px-1">
          <History className="text-viking-blue" size={20} />
          Conselhos de Guerra
        </h3>
        <div className="viking-card p-6 bg-linear-to-br from-viking-blue/10 to-transparent">
          <ul className="space-y-6">
            {[
              { num: '01', text: <span>Lembre-se: uma missão <span className="text-viking-gold">entregue</span> vale mais que dez no papel.</span> },
              { num: '02', text: <span>As <span className="text-viking-gold">Memory Scrolls</span> são cruciais para o aprendizado do clã.</span> },
              { num: '03', text: <span>O esforço em <span className="text-viking-gold">Pontos de Glória</span> dita sua posição no Salão.</span> },
            ].map(({ num, text }) => (
              <li key={num} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-viking-blue/20 flex items-center justify-center text-viking-blue font-black text-xs">{num}</div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
