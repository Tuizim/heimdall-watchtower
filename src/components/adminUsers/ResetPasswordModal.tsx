import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shuffle, Copy, Check } from 'lucide-react';
import { useUpdateAdminUser } from '../../hooks/useAdminUsers';
import { Modal, ModalHeader, FormField } from '../index';
import type { Profile } from '../../lib/api';

const PASSWORD_CHARS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#&';

function generatePassword(): string {
  return Array.from(
    { length: 14 },
    () => PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)]
  ).join('');
}

const resetPasswordSchema = z.object({
  password: z.string().min(12, 'Mínimo 12 caracteres'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  user: Profile | null;
  onClose: () => void;
}

export function ResetPasswordModal({ user, onClose }: ResetPasswordModalProps) {
  const updateUser = useUpdateAdminUser();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: generatePassword() },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!user) return;
    await updateUser.mutateAsync({ id: user.id, data: { password: data.password } });
    onClose();
  };

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      zIndex="z-100"
      className="max-w-sm bg-viking-stone border border-viking-blue/30 rounded-2xl p-8"
    >
      <ModalHeader
        title="Regenerar Senha"
        subtitle={user?.nome}
        subtitleClassName="text-[10px] text-viking-blue uppercase tracking-widest mt-1"
        onClose={onClose}
        compact
        mb="mb-6"
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Nova Senha" error={form.formState.errors.password?.message} className="space-y-1.5">
          <div className="relative">
            <input
              {...form.register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-20 focus:border-viking-blue outline-none transition-all font-mono"
              autoComplete="new-password"
            />
            <div className="absolute right-2 top-2.5 flex gap-1">
              <button type="button" onClick={() => form.setValue('password', generatePassword())} className="p-1.5 rounded-lg text-slate-500 hover:text-viking-gold hover:bg-viking-gold/10 transition-all" title="Gerar nova senha"><Shuffle size={15} /></button>
              <button type="button" onClick={() => setShowPassword(v => !v)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </div>
        </FormField>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(form.getValues('password'));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado!' : 'Copiar senha'}
        </button>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 glass rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all text-slate-400">Cancelar</button>
          <button type="submit" disabled={updateUser.isPending} className="flex-1 py-3.5 bg-viking-blue text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-blue/20 disabled:opacity-50">
            {updateUser.isPending ? 'Aplicando...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
