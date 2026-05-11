import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GitBranch } from 'lucide-react';
import { useCreateBranch } from '../../hooks/useBranches';
import { useAllColaboradores } from '../../hooks/useAllColaboradores';
import { Modal, FormField, CollaboratorPicker } from '../index';

const branchSchema = z.object({
  nome_branch:    z.string().min(1, 'Nome da branch obrigatório'),
  responsavel_id: z.string().optional(),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBranchModal({ isOpen, onClose }: CreateBranchModalProps) {
  const createBranch = useCreateBranch();
  const allColaboradores = useAllColaboradores();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<BranchFormData>({ resolver: zodResolver(branchSchema) });

  const watchedResponsavel = watch('responsavel_id');

  const onSubmit = async (data: BranchFormData) => {
    await createBranch.mutateAsync({
      nome_branch:    data.nome_branch,
      responsavel_id: data.responsavel_id || undefined,
      status:         'em progresso',
    });
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-100"
      className="max-w-xl bg-viking-stone border border-viking-blue/30 rounded-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <h3 className="text-2xl font-black mb-6 text-viking-blue flex items-center gap-3">
        <GitBranch size={24} />
        NOVA ROTA (BRANCH)
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Nome da Rota (Branch)" error={errors.nome_branch?.message}>
          <input
            {...register('nome_branch')}
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-viking-blue outline-none transition-all"
            placeholder="Ex: feature/reforco-scudos"
          />
        </FormField>

        <FormField label="Explorador Responsável" className="space-y-4">
          <CollaboratorPicker
            profiles={allColaboradores}
            value={watchedResponsavel ?? ''}
            onChange={id => setValue('responsavel_id', id)}
            variant="row"
          />
        </FormField>

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="button" onClick={onClose} className="flex-1 py-4 glass rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-viking-blue text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-blue/20 disabled:opacity-50">
            {isSubmitting ? 'Abrindo...' : 'Abrir Rota'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
