import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shuffle, Camera, User as UserIcon } from 'lucide-react';
import { PAPEIS_DESENVOLVIMENTO, type PapelDesenvolvimento } from '../../types';
import { PAPEL_CONFIG } from '../../App';
import { useCreateAdminUser } from '../../hooks/useAdminUsers';
import { Modal, ModalHeader, FormField } from '../index';
import type { CreatedCredentials } from './CredentialsBanner';

const PASSWORD_CHARS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#&';

function generatePassword(): string {
  return Array.from(
    { length: 14 },
    () => PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)]
  ).join('');
}

const createUserSchema = z.object({
  nome:  z.string().min(1, 'Nome obrigatório'),
  login: z.string().min(1, 'Login obrigatório'),
  senha: z.string().min(12, 'Mínimo 12 caracteres'),
  papel: z.enum(['Desenvolvedor', 'Líder Técnico', 'Agilista', 'QA', 'DevOps', 'Designer', 'Product Owner'] as const),
  avatar_url: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credentials: CreatedCredentials) => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const createUser = useCreateAdminUser();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { nome: '', login: '', senha: generatePassword(), papel: 'Desenvolvedor', avatar_url: '' },
  });

  const selectedPapel = form.watch('papel');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      form.setValue('avatar_url', result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: CreateUserFormData) => {
    const result = await createUser.mutateAsync({
      nome: data.nome, login: data.login, password: data.senha, papel: data.papel,
    });
    onSuccess({ nome: result.nome, login: data.login.trim().toLowerCase(), senha: data.senha });
    form.reset({ nome: '', login: '', senha: generatePassword(), papel: 'Desenvolvedor', avatar_url: '' });
    setAvatarPreview('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-100"
      className="max-w-md bg-viking-stone border border-viking-gold/30 rounded-2xl p-8 max-h-[90vh] overflow-y-auto themed-scroll"
    >
      <ModalHeader
        title="Convocar Guerreiro"
        subtitle="Defina as credenciais de acesso"
        subtitleClassName="text-[10px] text-viking-gold uppercase tracking-widest mt-1"
        onClose={onClose}
        compact
        mb="mb-6"
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center mb-2">
          <div className="relative group cursor-pointer">
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="w-20 h-20 rounded-2xl bg-black border-2 border-viking-gold/30 overflow-hidden shadow-xl group-hover:border-viking-gold/60 transition-all">
              {avatarPreview
                ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
                : <div className="w-full h-full flex items-center justify-center text-viking-gold/20"><UserIcon size={34} /></div>
              }
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-viking-gold text-black rounded-lg shadow-lg"><Camera size={13} /></div>
          </div>
        </div>

        <FormField label="Nome de Guerra" error={form.formState.errors.nome?.message} className="space-y-1.5">
          <input {...form.register('nome')} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-viking-gold outline-none transition-all font-bold" placeholder="Ragnar Lothbrok" />
        </FormField>

        <FormField label="Login" error={form.formState.errors.login?.message} className="space-y-1.5">
          <input {...form.register('login')} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-viking-gold outline-none transition-all font-mono" placeholder="ragnar" autoComplete="off" />
          {form.watch('login') && (
            <p className="text-[10px] text-slate-500">
              Acesso como: <span className="text-slate-300 font-mono">{form.watch('login').trim().toLowerCase()}</span>
            </p>
          )}
        </FormField>

        <FormField label="Senha Temporária" error={form.formState.errors.senha?.message} className="space-y-1.5">
          <div className="relative">
            <input {...form.register('senha')} type={showPassword ? 'text' : 'password'} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-20 focus:border-viking-gold outline-none transition-all font-mono" placeholder="mínimo 12 caracteres" autoComplete="new-password" />
            <div className="absolute right-2 top-2.5 flex gap-1">
              <button type="button" onClick={() => form.setValue('senha', generatePassword())} className="p-1.5 rounded-lg text-slate-500 hover:text-viking-gold hover:bg-viking-gold/10 transition-all" title="Gerar senha aleatória"><Shuffle size={15} /></button>
              <button type="button" onClick={() => setShowPassword(v => !v)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </div>
        </FormField>

        <FormField label="Papel no Fluxo" className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {PAPEIS_DESENVOLVIMENTO.map(p => {
              const cfg = PAPEL_CONFIG[p];
              const isSelected = selectedPapel === p;
              return (
                <button key={p} type="button" onClick={() => form.setValue('papel', p as PapelDesenvolvimento)} className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border font-bold text-xs transition-all duration-150 text-left ${isSelected ? cfg.selected : cfg.idle}`}>
                  <cfg.icon size={15} className="shrink-0" />
                  <span className="leading-none">{p}</span>
                  {isSelected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
                </button>
              );
            })}
          </div>
        </FormField>

        {createUser.isError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm">
            {createUser.error instanceof Error ? createUser.error.message : 'Erro ao criar usuário.'}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 glass rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all text-slate-400">Cancelar</button>
          <button type="submit" disabled={form.formState.isSubmitting} className="flex-1 py-3.5 bg-viking-gold text-black font-black rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-gold/20 disabled:opacity-50">
            {form.formState.isSubmitting ? 'Forjando...' : 'Convocar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
