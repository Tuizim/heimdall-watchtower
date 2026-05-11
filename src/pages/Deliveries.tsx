import React, { useEffect, useState, useContext } from 'react';
import { tasks as tasksApi, profiles as profilesApi } from '../lib/api';
import { Task, StatusTarefa, Profile } from '../types';
import { AuthContext } from '../App';
import {
  Shield,
  Sword,
  Compass,
  Plus,
  Trash2,
  Trophy,
  X,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addBusinessDays, format, parseISO, differenceInBusinessDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DayPicker } from 'react-day-picker';

const getStatusConfig = (status: StatusTarefa) => {
  switch (status) {
    case 'dentro do prazo':
      return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Dentro do Prazo' };
    case 'próximo do prazo':
      return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Próximo do Prazo' };
    case 'atrasado':
      return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Atrasado' };
    case 'bloqueado':
      return { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Bloqueado' };
    case 'concluída':
      return { color: 'text-viking-gold', bg: 'bg-viking-gold/10', border: 'border-viking-gold/20', label: 'Entregue' };
    default:
      return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Pendente' };
  }
};

export default function Deliveries() {
  const { profile } = useContext(AuthContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [colaboradores, setColaboradores] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRagnarokModalOpen, setIsRagnarokModalOpen] = useState(false);
  const [ragnarokFeedback, setRagnarokFeedback] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    titulo: '',
    descricao: '',
    pontos: 1,
    dias_estimados: 1,
    data_prevista: format(addBusinessDays(new Date(), 1), 'yyyy-MM-dd'),
    responsavel_id: '',
    status: 'dentro do prazo' as StatusTarefa
  });

  const updateCalculatedDate = (days: number) => {
    const calculatedDate = format(addBusinessDays(new Date(), days), 'yyyy-MM-dd');
    setNewTask(prev => ({ ...prev, dias_estimados: days, data_prevista: calculatedDate }));
  };

  const updateDaysFromDate = (date: Date | null) => {
    if (!date || !isValid(date)) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = Math.max(1, differenceInBusinessDays(date, today));
      setNewTask(prev => ({
        ...prev,
        data_prevista: format(date, 'yyyy-MM-dd'),
        dias_estimados: days
      }));
    } catch {
      console.error("Data inválida");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksData, usersData] = await Promise.all([
        tasksApi.list(),
        profilesApi.list(),
      ]);
      setTasks(tasksData as unknown as Task[]);
      setColaboradores(usersData as unknown as Profile[]);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksApi.delete(id);
      fetchData();
    } catch (err) {
      console.error("Erro ao apagar missão:", err);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await tasksApi.update(id, { status: 'concluída' });
      fetchData();
    } catch (err) {
      console.error("Erro ao completar missão:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.create({
        ...newTask,
        responsavel_id: newTask.responsavel_id || profile?.id,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Erro ao criar missão:", err);
    }
  };

  const executeRagnarok = async () => {
    setIsRagnarokModalOpen(false);
    try {
      await tasksApi.deleteAll();
      setTasks([]);
      setRagnarokFeedback("Valhalla foi limpo. O reino renasceu das cinzas.");
    } catch (err) {
      console.error("Erro catastrófico no Ragnarök:", err);
      setRagnarokFeedback("Os deuses impediram o reset.");
    } finally {
      setTimeout(() => setRagnarokFeedback(null), 4000);
    }
  };

  const allColaboradores = React.useMemo(() => {
    const uniqueProfiles = new Map<string, Profile>();
    colaboradores.forEach(c => uniqueProfiles.set(c.id, c));
    if (profile) uniqueProfiles.set(profile.id, profile);
    return Array.from(uniqueProfiles.values());
  }, [colaboradores, profile]);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sword className="text-viking-gold" size={32} />
            <h1 className="text-4xl font-black tracking-tighter text-white">PAINEL DE ENTREGAS</h1>
          </div>
          <p className="text-viking-text-dim max-w-2xl font-medium">Gerencie as missões do reino e garanta que cada conquista seja registrada no Hall da Fama.</p>
        </div>

        <div className="flex items-center gap-4">
          {profile?.role === 'admin' && (
            <button
              onClick={() => setIsRagnarokModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 group"
              title="Ragnarök: Limpar Missões"
            >
              <Flame size={20} className="group-hover:animate-bounce" />
              <span className="text-xs font-black uppercase tracking-widest">Ragnarök</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-4 bg-viking-gold text-black font-black rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-viking-gold/30 text-xs uppercase tracking-wider"
          >
            <Plus size={20} strokeWidth={3} />
            CONVOCAR MISSÃO
          </button>
        </div>
      </header>

      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => {
              const config = getStatusConfig(task.status as StatusTarefa);
              const responsavel = allColaboradores.find(g => g.id === task.responsavel_id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={task.id}
                  className={`viking-card p-8 group relative overflow-hidden ${task.status === 'concluída' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-viking-gold/30 group-hover:bg-viking-gold transition-colors" />

                  <div>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                          title="Apagar Missão"
                        >
                          <Trash2 size={24} />
                        </button>
                        {task.status !== 'concluída' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="p-3 rounded-xl bg-viking-gold/10 text-viking-gold border border-viking-gold/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-viking-gold hover:text-black"
                            title="Marcar como Entregue"
                          >
                            <Trophy size={24} />
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="block font-mono text-viking-gold text-2xl font-black">{task.pontos}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">PONTOS DE GLÓRIA</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{task.titulo}</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-3 font-medium">
                      {task.descricao || 'Nenhum detalhe adicional fornecido para esta jornada.'}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                      <div className="flex items-center gap-4">
                        <div className="relative group/avatar">
                          <div className="w-16 h-16 rounded-2xl border-2 border-viking-gold overflow-hidden bg-viking-stone ring-4 ring-black/20 shadow-xl transition-transform group-hover/avatar:scale-110">
                            <img
                              src={responsavel?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${responsavel?.nome}`}
                              alt={responsavel?.nome}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-viking-gold text-black rounded-md p-1 border border-black/20 shadow-lg">
                            <Shield size={12} fill="currentColor" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-viking-gold uppercase font-black tracking-widest mb-0.5">Comandante</span>
                          <span className="text-base font-black text-white italic tracking-tight">{responsavel?.nome || 'Guerreiro Errante'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Até o Pôr do Sol</span>
                        <span className="text-sm font-bold text-viking-gold bg-viking-gold/10 px-3 py-1 rounded-lg border border-viking-gold/20">
                          {task.data_prevista ? format(parseISO(task.data_prevista), 'dd/MM/yyyy') : 'Lua Cheia'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {tasks.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center viking-card flex flex-col items-center justify-center border-dashed">
              <Compass className="text-slate-600 mb-4 animate-spin-slow" size={64} />
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Nenhuma missão no horizonte</h3>
              <p className="text-slate-500 mt-2">Clique em "Convocar Missão" para navegar por novos mares.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl viking-card p-10 shadow-2xl border-viking-gold/30 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Convocar Guerreiros</h2>
                  <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Nova Missão para o Clã</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Objetivo da Missão</label>
                  <input
                    required
                    value={newTask.titulo}
                    onChange={e => setNewTask({...newTask, titulo: e.target.value})}
                    type="text"
                    maxLength={255}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-5 focus:border-viking-gold outline-none transition-all placeholder:text-slate-700 font-bold"
                    placeholder="Ex: Saquear servidor legacy"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Relato da Jornada</label>
                  <textarea
                    value={newTask.descricao}
                    onChange={e => setNewTask({...newTask, descricao: e.target.value})}
                    rows={4}
                    maxLength={1000}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-5 focus:border-viking-gold outline-none transition-all placeholder:text-slate-700 font-medium"
                    placeholder="O que os deuses devem saber sobre esta missão?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Pontos de Glória</label>
                    <input
                      required
                      value={newTask.pontos}
                      onChange={e => setNewTask({...newTask, pontos: Number(e.target.value)})}
                      type="number"
                      placeholder="0"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-viking-gold outline-none transition-all text-center font-mono text-2xl font-black text-viking-gold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Dias de Jornada</label>
                    <input
                      required
                      value={newTask.dias_estimados}
                      onChange={e => updateCalculatedDate(Number(e.target.value))}
                      type="number"
                      min="1"
                      placeholder="1"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-viking-blue outline-none transition-all text-center font-mono text-2xl font-black text-viking-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Calendário de Previsão (Horizonte)</label>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(v => !v)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-5 text-white cursor-pointer font-bold text-center tracking-widest hover:border-viking-gold/50 transition-all"
                  >
                    {format(parseISO(newTask.data_prevista), 'dd/MM/yyyy')}
                  </button>
                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="bg-viking-deep border border-viking-gold/30 rounded-2xl p-4 shadow-2xl shadow-black/60"
                      >
                        <DayPicker
                          mode="single"
                          selected={parseISO(newTask.data_prevista)}
                          onSelect={(date) => {
                            if (date) {
                              updateDaysFromDate(date);
                              setIsCalendarOpen(false);
                            }
                          }}
                          locale={ptBR}
                          disabled={{ before: new Date() }}
                          classNames={{
                            month_caption: 'flex justify-center items-center py-2 mb-1',
                            caption_label: 'text-[11px] font-black uppercase tracking-[0.2em] text-viking-gold',
                            nav: 'flex items-center justify-between mb-2',
                            button_previous: 'p-1.5 rounded-lg text-viking-gold hover:bg-viking-gold/20 transition-colors',
                            button_next: 'p-1.5 rounded-lg text-viking-gold hover:bg-viking-gold/20 transition-colors',
                            month_grid: 'w-full',
                            weekdays: 'grid grid-cols-7 mb-1',
                            weekday: 'flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-viking-gold/50 py-2',
                            week: 'grid grid-cols-7 gap-0',
                            day: 'flex items-center justify-center p-0.5',
                            day_button: 'w-9 h-9 flex items-center justify-center rounded-lg text-sm text-slate-300 hover:bg-viking-gold hover:text-black transition-all cursor-pointer font-medium',
                            selected: 'bg-viking-gold! text-black! font-black!',
                            today: 'border border-viking-gold/50 text-viking-gold font-bold',
                            outside: 'opacity-25',
                            disabled: 'opacity-20 cursor-not-allowed hover:bg-transparent hover:text-slate-300',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">O Guerreiro Destinado</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allColaboradores.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewTask({...newTask, responsavel_id: c.id})}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all relative group overflow-hidden ${newTask.responsavel_id === c.id ? 'bg-viking-gold text-black border-viking-gold ring-4 ring-viking-gold/20 scale-105' : 'bg-white/5 border-white/10 text-slate-400 hover:border-viking-gold/50 hover:bg-white/10'}`}
                      >
                        <div className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all ${newTask.responsavel_id === c.id ? 'border-black' : 'border-viking-gold/30'}`}>
                          <img src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.nome}`} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight h-8 flex items-center justify-center truncate w-full px-1">{c.nome}</span>
                        {newTask.responsavel_id === c.id && (
                          <div className="absolute top-1 right-1">
                            <Shield size={12} className="text-black" fill="currentColor" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-viking-gold text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-viking-gold/20 uppercase tracking-[0.2em] mt-4"
                >
                  Confirmar Missão
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ragnarokFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-rose-600 text-white font-black rounded-full shadow-2xl uppercase tracking-widest text-xs border border-white/20"
          >
            {ragnarokFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRagnarokModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRagnarokModalOpen(false)}
              className="absolute inset-0 bg-rose-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-viking-stone border-2 border-rose-500/30 rounded-3xl p-10 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-rose-500 to-transparent" />
              <div className="bg-rose-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-500/20">
                <Flame size={40} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-rose-500 uppercase tracking-tighter mb-4 italic">O Fim dos Tempos?</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                O Ragnarök apagará <span className="text-white font-black">TODAS</span> as missões do painel de entregas. Esta ação é irreversível.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={executeRagnarok}
                  className="w-full py-4 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 transition-all uppercase tracking-widest shadow-lg shadow-rose-500/20"
                >
                  Sim, Iniciar o Ragnarök
                </button>
                <button
                  onClick={() => setIsRagnarokModalOpen(false)}
                  className="w-full py-4 bg-transparent text-slate-500 font-bold rounded-xl hover:text-white transition-all uppercase tracking-widest text-xs"
                >
                  Recuar para o Valhalla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
