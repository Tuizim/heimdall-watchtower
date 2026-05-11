import React, { useState, useEffect, useContext } from 'react';
import { UserPlus, X, Copy, Check, Eye, EyeOff, Shield, Users, Trash2, Shuffle, Camera, User as UserIcon, KeyRound } from 'lucide-react';
import { admin as adminApi } from '../lib/api';
import { AuthContext, PAPEL_CONFIG } from '../App';
import { Profile, PAPEIS_DESENVOLVIMENTO, PapelDesenvolvimento } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CreatedCredentials {
  nome: string;
  login: string;
  senha: string;
}

const FORM_INITIAL = { nome: '', login: '', papel: 'Desenvolvedor' as PapelDesenvolvimento, senha: '', avatar_url: '' };

function generatePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#&';
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function AdminUsers() {
  const { profile } = useContext(AuthContext);
  const [users, setUsers] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetUser, setResetUser] = useState<Profile | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetCopied, setResetCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.listUsers();
      setUsers(data as unknown as Profile[]);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, avatar_url: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminApi.createUser({
        nome: form.nome,
        login: form.login,
        password: form.senha,
        papel: form.papel,
      });
      setCredentials({ nome: form.nome, login: form.login.trim().toLowerCase(), senha: form.senha });
      setForm(FORM_INITIAL);
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (userId: string) => {
    setDeleting(true);
    try {
      await adminApi.deleteUser(userId);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
    setDeleting(false);
  };

  const openResetModal = (u: Profile) => {
    setResetUser(u);
    setResetPassword(generatePassword());
    setShowResetPassword(true);
    setResetCopied(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setResetting(true);
    try {
      await adminApi.updateUser(resetUser.id, { password: resetPassword });
      setResetUser(null);
    } catch (err: any) {
      alert(err.message);
    }
    setResetting(false);
  };

  const copyCredentials = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Login: ${credentials.login}\nSenha: ${credentials.senha}`);
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="text-viking-gold" size={28} />
            <h1 className="text-3xl font-black text-white uppercase tracking-wide">Forja de Guerreiros</h1>
          </div>
          <p className="text-slate-500 text-sm">Crie e gerencie os guerreiros do clã</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); setForm(FORM_INITIAL); }}
          className="flex items-center gap-2 px-5 py-3 bg-viking-gold text-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-gold/20"
        >
          <UserPlus size={18} />
          Convocar Guerreiro
        </button>
      </div>

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
                Senha: <span className="text-white font-mono">{showPassword ? credentials.senha : '••••••••'}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPassword(v => !v)}
                className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-colors"
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
              <button onClick={() => setCredentials(null)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <Users size={18} className="text-slate-400" />
          <span className="text-sm font-black uppercase tracking-widest text-slate-400">
            {users.length} guerreiros no clã
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors group">
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

              {u.role !== 'admin' && confirmDelete !== u.id && (
                <button
                  onClick={() => openResetModal(u)}
                  className="p-2 rounded-xl text-slate-600 hover:text-viking-blue hover:bg-viking-blue/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Regenerar senha"
                >
                  <KeyRound size={16} />
                </button>
              )}

              {u.role !== 'admin' && (
                confirmDelete === u.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Confirmar?</span>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deleting}
                      className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/30 transition-all disabled:opacity-50"
                    >
                      {deleting ? '...' : 'Sim'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 glass rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(u.id)}
                    className="p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-viking-stone border border-viking-blue/30 rounded-2xl p-8 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase">Regenerar Senha</h3>
                  <p className="text-[10px] text-viking-blue uppercase tracking-widest mt-1">{resetUser.nome}</p>
                </div>
                <button onClick={() => setResetUser(null)} className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Nova Senha</label>
                  <div className="relative">
                    <input
                      required
                      minLength={12}
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetPassword}
                      onChange={e => setResetPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-20 focus:border-viking-blue outline-none transition-all font-mono"
                      autoComplete="new-password"
                    />
                    <div className="absolute right-2 top-2.5 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setResetPassword(generatePassword())}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-viking-gold hover:bg-viking-gold/10 transition-all"
                        title="Gerar nova senha"
                      >
                        <Shuffle size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(v => !v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
                      >
                        {showResetPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(resetPassword);
                    setResetCopied(true);
                    setTimeout(() => setResetCopied(false), 2000);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                >
                  {resetCopied ? <Check size={13} /> : <Copy size={13} />}
                  {resetCopied ? 'Copiado!' : 'Copiar senha'}
                </button>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setResetUser(null)}
                    className="flex-1 py-3.5 glass rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetting || !resetPassword}
                    className="flex-1 py-3.5 bg-viking-blue text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-blue/20 disabled:opacity-50"
                  >
                    {resetting ? 'Aplicando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              className="bg-viking-stone border border-viking-gold/30 rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto themed-scroll"
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
                <div className="flex justify-center mb-2">
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-20 h-20 rounded-2xl bg-black border-2 border-viking-gold/30 overflow-hidden shadow-xl group-hover:border-viking-gold/60 transition-all">
                      {form.avatar_url ? (
                        <img src={form.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-viking-gold/20">
                          <UserIcon size={34} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-viking-gold text-black rounded-lg shadow-lg">
                      <Camera size={13} />
                    </div>
                  </div>
                </div>

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
                      minLength={12}
                      type={showPassword ? 'text' : 'password'}
                      value={form.senha}
                      onChange={e => setForm({ ...form, senha: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-20 focus:border-viking-gold outline-none transition-all font-mono"
                      placeholder="mínimo 12 caracteres"
                      autoComplete="new-password"
                    />
                    <div className="absolute right-2 top-2.5 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, senha: generatePassword() }))}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-viking-gold hover:bg-viking-gold/10 transition-all"
                        title="Gerar senha aleatória"
                      >
                        <Shuffle size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Papel no Fluxo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAPEIS_DESENVOLVIMENTO.map(p => {
                      const cfg = PAPEL_CONFIG[p];
                      const isSelected = form.papel === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, papel: p })}
                          className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border font-bold text-xs transition-all duration-150 text-left ${isSelected ? cfg.selected : cfg.idle}`}
                        >
                          <cfg.icon size={15} className="shrink-0" />
                          <span className="leading-none">{p}</span>
                          {isSelected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
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
