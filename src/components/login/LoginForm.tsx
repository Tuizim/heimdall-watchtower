import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { Lock, User } from 'lucide-react';
import { auth } from '../../lib/api';
import { AuthContext } from '../../App';
import { FormField } from '../FormField';
import type { Profile } from '../../types';

const loginSchema = z.object({
  login:    z.string().min(1, 'Login obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { setProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async ({ login, password }: LoginFormData) => {
    try {
      const { user } = await auth.login(login.trim(), password);
      // Tipo consolidado em types.ts; api.ts usa `papel: string` — cast seguro em runtime.
      setProfile(user as unknown as Profile);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login ou senha incorretos.';
      setError('root', { message });
    }
  };

  return (
    <div className="flex items-center justify-center p-8 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-viking-blue/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center lg:text-left">
          <h3 className="text-3xl font-bold mb-2">Bem-vindo, Comandante</h3>
          <p className="text-slate-400">Entre com seu login e senha de guerreiro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Login do Clã" error={errors.login?.message}>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                {...register('login')}
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:border-viking-blue outline-none transition-all"
                placeholder="ragnar"
                autoComplete="username"
              />
            </div>
          </FormField>

          <FormField label="Senha Sagrada" error={errors.password?.message}>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                {...register('password')}
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:border-viking-blue outline-none transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </FormField>

          {errors.root && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-viking-blue hover:bg-viking-blue/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? 'Consultando as Runas...' : 'Entrar no Reino'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Precisa de acesso? <span className="text-viking-gold">Fale com um Comandante</span>
        </p>
      </motion.div>
    </div>
  );
}
