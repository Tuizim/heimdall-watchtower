import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useCreateRetroCard } from '../../hooks/useRetro';
import { Modal, ModalHeader, FormField } from '../index';

const retroCardSchema = z.object({
  titulo:    z.string().min(1, 'Título obrigatório').max(255),
  descricao: z.string().max(1000).optional(),
});

type RetroCardFormData = z.infer<typeof retroCardSchema>;

interface CreateRetroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRetroModal({ isOpen, onClose }: CreateRetroModalProps) {
  const createCard = useCreateRetroCard();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<RetroCardFormData>({ resolver: zodResolver(retroCardSchema) });

  const onSubmit = async (data: RetroCardFormData) => {
    await createCard.mutateAsync({ ...data, status: 'Pendentes' });
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdropClassName="bg-black/90 backdrop-blur-md"
      className="max-w-lg viking-card p-10 border-viking-blue/30 max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <ModalHeader
        title="Novo Pergaminho"
        onClose={onClose}
        icon={<div className="p-3 bg-viking-blue/20 rounded-xl text-viking-blue"><Plus size={24} /></div>}
        mb="mb-10"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormField label="O que devemos lembrar?" error={errors.titulo?.message}>
          <input
            {...register('titulo')}
            type="text"
            maxLength={255}
            className="w-full bg-black/60 border border-white/10 rounded-xl p-5 focus:border-viking-blue outline-none transition-all placeholder:text-slate-700 font-bold"
            placeholder="Título da nota..."
          />
        </FormField>

        <FormField label="Conte na Saga (Detalhes)">
          <textarea
            {...register('descricao')}
            rows={4}
            maxLength={1000}
            className="w-full bg-black/60 border border-white/10 rounded-xl p-5 focus:border-viking-blue outline-none transition-all placeholder:text-slate-700 font-medium resize-none"
            placeholder="Descreva a memória épica aqui..."
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-viking-blue text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-viking-blue/20 uppercase tracking-[0.2em] mt-4 disabled:opacity-50"
        >
          {isSubmitting ? 'Registrando...' : 'Confirmar Registro'}
        </button>
      </form>
    </Modal>
  );
}
