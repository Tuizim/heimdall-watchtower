import { motion } from 'motion/react';
import { Shield, Trash2, Trophy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useDeleteTask, useUpdateTask } from '../../hooks/useTasks';
import { UserAvatar } from '../UserAvatar';
import type { Task, Profile } from '../../lib/api';
import type { StatusTarefa } from '../../types';

const STATUS_CONFIG: Record<StatusTarefa, { color: string; bg: string; border: string; label: string }> = {
  'dentro do prazo':  { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Dentro do Prazo' },
  'próximo do prazo': { color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Próximo do Prazo' },
  'atrasado':         { color: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    label: 'Atrasado' },
  'bloqueado':        { color: 'text-purple-500',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  label: 'Bloqueado' },
  'concluída':        { color: 'text-viking-gold', bg: 'bg-viking-gold/10', border: 'border-viking-gold/20', label: 'Entregue' },
};

interface TaskCardProps {
  task: Task;
  responsavel: Profile | undefined;
}

export function TaskCard({ task, responsavel }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const config = STATUS_CONFIG[task.status as StatusTarefa] ?? STATUS_CONFIG['dentro do prazo'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`viking-card p-8 group relative overflow-hidden ${task.status === 'concluída' ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-viking-gold/30 group-hover:bg-viking-gold transition-colors" />

      <div className="flex items-start justify-between mb-5">
        <div className="flex gap-3">
          <button
            onClick={() => deleteTask.mutate(task.id)}
            className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
            title="Apagar Missão"
          >
            <Trash2 size={24} />
          </button>
          {task.status !== 'concluída' && (
            <button
              onClick={() => updateTask.mutate({ id: task.id, data: { status: 'concluída' } })}
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

      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 ${config.bg} ${config.border} ${config.color} border`}>
        {config.label}
      </div>

      <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{task.titulo}</h3>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-3 font-medium">
        {task.descricao || 'Nenhum detalhe adicional fornecido para esta jornada.'}
      </p>

      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        <div className="flex items-center gap-4">
          <div className="relative group/avatar">
            <div className="w-16 h-16 rounded-2xl border-2 border-viking-gold overflow-hidden bg-viking-stone ring-4 ring-black/20 shadow-xl transition-transform group-hover/avatar:scale-110">
              <UserAvatar nome={responsavel?.nome ?? 'Errante'} avatarUrl={responsavel?.avatar_url} />
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
    </motion.div>
  );
}
