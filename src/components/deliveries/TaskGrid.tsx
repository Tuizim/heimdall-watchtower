import { AnimatePresence } from 'motion/react';
import { Compass } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useProfiles } from '../../hooks/useProfiles';
import { EmptyState } from '../EmptyState';
import { TaskCard } from './TaskCard';

export function TaskGrid() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: colaboradores = [] } = useProfiles();

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              responsavel={colaboradores.find(c => c.id === task.responsavel_id)}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && !isLoading && (
          <EmptyState
            icon={Compass}
            title="Nenhuma missão no horizonte"
            description='Clique em "Convocar Missão" para navegar por novos mares.'
            iconClassName="text-slate-600 mb-4 animate-spin-slow"
            className="col-span-full py-20 viking-card border-dashed"
          />
        )}
      </div>
    </section>
  );
}
