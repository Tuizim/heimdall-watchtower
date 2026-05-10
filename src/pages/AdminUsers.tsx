import React, { useState, useEffect, useContext } from 'react';
import { UserPlus, X, Copy, Check, Eye, EyeOff, Shield, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../App';
import { Profile, PAPEIS_DESENVOLVIMENTO, PapelDesenvolvimento } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CreatedCredentials {
  nome: string;
  login: string;
  senha: string;
}

export default function AdminUsers() {
  const { profile } = useContext(AuthContext);
  const [users, setUsers] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', login: '', papel: 'Desenvolvedor' as PapelDesenvolvimento, senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-user', {
        body: form,
      });

      if (fnError) throw new Error(fnError.message || 'Erro ao criar guerreiro');
      if (data?.error) throw new Error(data.error);

      setCredentials({ nome: form.nome, login: form.login.trim().toLowerCase(), senha: form.senha });
      setForm({ nome: '', login: '', papel: 'Desenvolvedor', senha: '' });
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `Login: ${credentials.login}\nSenha: ${credentials.senha}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64 text-rose-400 font-bold text-lg">
        Acesso negado — apenas Jarls podem entrar aqui.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="text-viking-gold" size={28} />
            <h1 className="text-3xl font-black text-white uppercase tracking-wide">Forja de Guerreiros</h1>
          </div>
          <p className="text-slate-500 text-sm">Crie e gerencie os guerreiros do clã</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="flex items-center gap-2 px-5 py-3 bg-viking-gold text-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-gold/20"
        >
          <UserPlus size={18} />
          Convocar Guerreiro
        </button>
      </div>

      {/* Credentials Banner */}
      <AnimatePresence>
        {credentials && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-2">
                Guerreiro convocado com sucesso!
              </p>
              <p className="text-white font-bold">{credentials.nome}</p>
              <p className="text-slate-400 text-sm mt-1">
                Login: <span className="text-white font-mono">{credentials.login}</span>
                {' · '}
                Senha: <span className="text-white font-mono">
                  {showPassword ? credentials.senha : '••••••••'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPassword(v => !v)}
                className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={copyCredentials}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-500/30 transition-all"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={() => setCredentials(null)}
                className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users List */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <Users size={18} className="text-slate-400" />
          <span className="text-sm font-black uppercase tracking-widest text-slate-400">
            {users.length} guerreiros no clã
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {u.avatar_url
                  ? <img src={u.avatar_url} alt={u.nome} className="w-full h-full object-cover" />
                  : <span className="text-slate-500 font-bold text-sm">{u.nome.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{u.nome}</p>
                <p className="text-xs text-slate-500 truncate">
                  {u.login ? <span className="font-mono text-slate-400">@{u.login}</span> : <span>{u.email}</span>}
                  {' · '}{u.papel}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                u.role === 'admin'
                  ? 'bg-viking-gold/10 border-viking-gold/30 text-viking-gold'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}>
                {u.role === 'admin' ? 'Jarl' : 'Huskar'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-viking-stone border border-viking-gold/30 rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase">Convocar Guerreiro</h3>
                  <p className="text-[10px] text-viking-gold uppercase tracking-widest mt-1">Defina as credenciais de acesso</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Nome de Guerra</label>
                  <input
                    required
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-viking-gold outline-none transition-all font-bold"
                    placeholder="Ragnar Lothbrok"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Login</label>
                  <input
                    required
                    value={form.login}
                    onChange={e => setForm({ ...form, login: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-viking-gold outline-none transition-all font-mono"
                    placeholder="ragnar"
                    autoComplete="off"
                  />
                  {form.login && (
                    <p className="text-[10px] text-slate-500">
                      Acesso como: <span className="text-slate-300 font-mono">{form.login.trim().toLowerCase()}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Senha Temporária</label>
                  <div className="relative">
                    <input
                      required
                      minLength={6}
                      type={showPassword ? 'text' : 'password'}
                      value={form.senha}
                      onChange={e => setForm({ ...form, senha: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-12 focus:border-viking-gold outline-none transition-all font-mono"
                      placeholder="mínimo 6 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Papel no Fluxo</label>
                  <select
                    value={form.papel}
                    onChange={e => setForm({ ...form, papel: e.target.value as PapelDesenvolvimento })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-viking-gold outline-none transition-all text-white"
                  >
                    {PAPEIS_DESENVOLVIMENTO.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3.5 glass rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-viking-gold text-black font-black rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-gold/20 disabled:opacity-50"
                  >
                    {loading ? 'Forjando...' : 'Convocar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
