import React, { useState, useContext } from 'react';
import { auth } from '../lib/api';
import { AuthContext } from '../App';
import { Lock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Profile } from '../types';

export default function Login() {
  const { setProfile } = useContext(AuthContext);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user } = await auth.login(login.trim(), password);
      setProfile(user as unknown as Profile);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message ?? 'Login ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-viking-deep overflow-hidden">
      {/* Left Decoration */}
      <div className="hidden lg:flex flex-col relative p-12 border-r border-white/5 bg-slate-950/50">
        <div className="absolute inset-0 opacity-10 rune-pattern pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-viking-gold rotate-45 flex items-center justify-center">
            <span className="-rotate-45 text-viking-gold font-bold text-xl">ᚻ</span>
          </div>
          <h1 className="runic-text text-viking-gold font-bold text-2xl tracking-[0.2em]">Heimdall</h1>
        </div>

        <div className="flex-1 flex items-center">
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-white leading-tight mb-6"
            >
              Vigie os Reinos.<br />
              Controle as <span className="text-viking-blue">Branches</span>.<br />
              Alcance o Valhalla.
            </motion.h2>
            <p className="text-slate-400 max-w-md text-lg">
              A plataforma definitiva para times de elite. Transforme sua sprint em uma jornada lendária.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form */}
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Login do Clã</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:border-viking-blue outline-none transition-all"
                  placeholder="ragnar"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Senha Sagrada</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:border-viking-blue outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-viking-blue hover:bg-viking-blue/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50"
            >
              {loading ? 'Consultando as Runas...' : 'Entrar no Reino'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Precisa de acesso? <span className="text-viking-gold">Fale com um Comandante</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
