import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'motion/react';
import { addBusinessDays, format, parseISO, differenceInBusinessDays, isValid, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DayPicker } from 'react-day-picker';
import { AuthContext } from '../../App';
import { useCreateTask } from '../../hooks/useTasks';
import { useAllColaboradores } from '../../hooks/useAllColaboradores';
import { Modal, ModalHeader, FormField, CollaboratorPicker } from '../index';

const taskSchema = z.object({
  titulo:         z.string().min(1, 'Título obrigatório').max(255),
  descricao:      z.string().max(1000).optional(),
  pontos:         z.number().int().min(1),
  dias_estimados: z.number().int().min(1),
  data_prevista:  z.string(),
  responsavel_id: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const defaultDate = format(addBusinessDays(new Date(), 1), 'yyyy-MM-dd');

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { profile } = useContext(AuthContext);
  const allColaboradores = useAllColaboradores();
  const createTask = useCreateTask();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<TaskFormData>({
      resolver: zodResolver(taskSchema),
      defaultValues: {
        titulo: '', descricao: '', pontos: 1,
        dias_estimados: 1, data_prevista: defaultDate, responsavel_id: '',
      },
    });

  const watchedDate        = watch('data_prevista');
  const watchedDays        = watch('dias_estimados');
  const watchedResponsavel = watch('responsavel_id');

  const handleDaysChange = (days: number) => {
    setValue('dias_estimados', days);
    setValue('data_prevista', format(addBusinessDays(new Date(), days), 'yyyy-MM-dd'));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !isValid(date)) return;
    const days = Math.max(1, differenceInBusinessDays(date, startOfDay(new Date())));
    setValue('data_prevista', format(date, 'yyyy-MM-dd'));
    setValue('dias_estimados', days);
    setIsCalendarOpen(false);
  };

  const onSubmit = async (data: TaskFormData) => {
    await createTask.mutateAsync({ ...data, responsavel_id: data.responsavel_id || profile?.id });
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdropClassName="bg-black/80 backdrop-blur-md"
      className="max-w-2xl viking-card p-10 border-viking-gold/30 max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <ModalHeader title="Convocar Guerreiros" subtitle="Nova Missão para o Clã" onClose={onClose} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormField label="Objetivo da Missão" error={errors.titulo?.message}>
          <input
            {...register('titulo')}
            type="text"
            maxLength={255}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-5 focus:border-viking-gold outline-none transition-all placeholder:text-slate-700 font-bold"
            placeholder="Ex: Saquear servidor legacy"
          />
        </FormField>

        <FormField label="Relato da Jornada">
          <textarea
            {...register('descricao')}
            rows={4}
            maxLength={1000}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-5 focus:border-viking-gold outline-none transition-all placeholder:text-slate-700 font-medium"
            placeholder="O que os deuses devem saber sobre esta missão?"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Pontos de Glória" error={errors.pontos?.message}>
            <input
              {...register('pontos', { valueAsNumber: true })}
              type="number"
              placeholder="0"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-viking-gold outline-none transition-all text-center font-mono text-2xl font-black text-viking-gold"
            />
          </FormField>
          <FormField label="Dias de Jornada">
            <input
              type="number"
              min="1"
              value={watchedDays}
              onChange={e => handleDaysChange(Number(e.target.value))}
              placeholder="1"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-viking-blue outline-none transition-all text-center font-mono text-2xl font-black text-viking-blue"
            />
          </FormField>
        </div>

        <FormField label="Calendário de Previsão (Horizonte)">
          <button
            type="button"
            onClick={() => setIsCalendarOpen(v => !v)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-5 text-white cursor-pointer font-bold text-center tracking-widest hover:border-viking-gold/50 transition-all"
          >
            {format(parseISO(watchedDate), 'dd/MM/yyyy')}
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
                  selected={parseISO(watchedDate)}
                  onSelect={handleDateSelect}
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
        </FormField>

        <FormField label="O Guerreiro Destinado">
          <CollaboratorPicker
            profiles={allColaboradores}
            value={watchedResponsavel ?? ''}
            onChange={id => setValue('responsavel_id', id)}
            variant="card"
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-viking-gold text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-viking-gold/20 uppercase tracking-[0.2em] mt-4 disabled:opacity-50"
        >
          {isSubmitting ? 'Convocando...' : 'Confirmar Missão'}
        </button>
      </form>
    </Modal>
  );
}
