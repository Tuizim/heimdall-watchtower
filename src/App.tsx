import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { auth, profiles as profilesApi, setAccessToken, onApiError, type Profile as ApiProfile } from './lib/api';
import { Profile, PAPEIS_DESENVOLVIMENTO } from './types';
import {
  LayoutDashboard,
  GitBranch,
  Shield,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Sword,
  ScrollText,
  Settings,
  Camera,
  Upload,
  Users,
  UserPlus,
  Code2,
  Crown,
  Zap,
  FlaskConical,
  Server,
  Palette,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Branches from './pages/Branches';
import Retro from './pages/Retro';
import Battalion from './pages/Battalion';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';

export const PAPEL_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; selected: string; idle: string }> = {
  'Desenvolvedor':  { icon: Code2,        selected: 'border-cyan-400 bg-cyan-400/10 text-cyan-300',        idle: 'border-white/10 bg-black/30 text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300' },
  'Líder Técnico':  { icon: Crown,        selected: 'border-viking-gold bg-viking-gold/10 text-viking-gold', idle: 'border-white/10 bg-black/30 text-slate-400 hover:border-viking-gold/40 hover:text-viking-gold' },
  'Agilista':       { icon: Zap,          selected: 'border-purple-400 bg-purple-400/10 text-purple-300',   idle: 'border-white/10 bg-black/30 text-slate-400 hover:border-purple-400/40 hover:text-purple-300' },
  'QA':             { icon: FlaskConical, selected: 'border-emerald-400 bg-emerald-400/10 text-emerald-300', idle: 'border-white/10 bg-black/30 text-slate-400 hover:border-emerald-400/40 hover:text-emerald-300' },
  'DevOps':         { icon: Server,       selected: 'border-orange-400 bg-orange-400/10 text-orange-300',   idle: 'border-white/10 bg-black/30 text-slate-400 hover:border-orange-400/40 hover:text-orange-300' },
  'Designer':       { icon: Palette,      selected: 'border-pink-400 bg-pink-400/10 text-pink-300',         idle: 'border-white/10 bg-black/30 text-slate-400 hover:border-pink-400/40 hover:text-pink-300' },
  'Product Owner':  { icon: Briefcase,    selected: 'border-rose-400 bg-rose-400/10 text-rose-300',         idle: 'border-white/10 bg-black/30 text-slate-400 hover:border-rose-400/40 hover:text-rose-300' },
};

// --- AUTH CONTEXT & PROVIDER ---
export const AuthContext = React.createContext<{
  user: ApiProfile | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}>({ user: null, profile: null, loading: true, signOut: async () => {}, setProfile: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session via refresh token (HttpOnly cookie)
    auth.refresh().then(async (token) => {
      if (token) {
        const me = await auth.me();
        if (me) {
          setUser(me);
          setProfile(me as unknown as Profile);
        }
      }
      setLoading(false);
    });
  }, []);

  const signOut = async () => {
    await auth.logout();
    setUser(null);
    setProfile(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- LAYOUT ---
function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { profile, user, signOut, setProfile } = React.useContext(AuthContext);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    return onApiError((message) => {
      setApiError(message);
      setTimeout(() => setApiError(null), 5000);
    });
  }, []);
  const [editingProfile, setEditingProfile] = useState<Partial<Profile>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditingProfile(profile);
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingProfile(prev => ({ ...prev, avatar_url: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updated = await profilesApi.update(user.id, {
        nome: editingProfile.nome,
        classe_viking: editingProfile.classe_viking,
        papel: editingProfile.papel,
        avatar_url: editingProfile.avatar_url,
      });

      setProfile({ ...profile, ...updated } as Profile);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem'); return; }
    if (newPassword.length < 12) { setPasswordError('Mínimo de 12 caracteres'); return; }

    try {
      await auth.changePassword('', newPassword); // currentPassword prompted separately if needed
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message ?? 'Erro ao trocar senha.');
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Salão de Odin', path: '/' },
    { icon: Users, label: 'Batalhão', path: '/battalion' },
    { icon: Sword, label: 'Painel de Entregas', path: '/deliveries' },
    { icon: GitBranch, label: 'Branches do Reino', path: '/branches' },
    { icon: ScrollText, label: 'Pergaminhos', path: '/retro' },
    ...(profile?.role === 'admin' ? [{ icon: UserPlus, label: 'Forja de Guerreiros', path: '/admin/users' }] : []),
  ];

  return (
    <div className="min-h-screen flex text-slate-200 relative">
      {/* Scanlines overlay para feeling digital nórdico */}
      <div className="scanlines" />
      
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 glass border-r border-white/5 flex flex-col z-50 fixed h-full lg:relative"
          >
            <div className="p-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-viking-blue/20 rounded-xl flex items-center justify-center border border-viking-blue/30 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                <Shield className="text-viking-blue" size={28} />
              </div>
              <div>
                <h1 className="runic-text text-viking-gold font-black text-xl leading-none">
                  Heimdall
                </h1>
                <span className="text-viking-blue text-[10px] uppercase font-bold tracking-[0.3em]">Watchtower</span>
              </div>
            </div>

            <nav className="flex-1 px-5 py-6 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all group ${
                    location.pathname === item.path 
                      ? 'bg-viking-blue/10 border border-viking-blue/20 text-viking-blue' 
                      : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <item.icon size={20} className={location.pathname === item.path ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-white/5 bg-black/20">
              <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 p-4 glass rounded-2xl mb-4 relative overflow-hidden group cursor-pointer hover:border-viking-gold/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-viking-gold/0 via-viking-gold/5 to-viking-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="w-11 h-11 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner relative z-10 group-hover:scale-105 transition-transform">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.nome} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={22} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-sm font-black truncate text-white">{profile?.nome || 'Guerreiro'}</p>
                  <p className="text-[10px] text-viking-gold uppercase tracking-[0.2em] font-black">{profile?.papel || 'Desenvolvedor'}</p>
                </div>
                <Settings size={14} className="text-viking-gold/40 group-hover:rotate-90 transition-transform" />
              </div>
              <button 
                onClick={signOut}
                className="w-full flex items-center justify-center gap-3 py-3 text-xs font-black uppercase tracking-[0.2em] text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all border border-rose-400/20 active:scale-95"
              >
                <LogOut size={16} />
                Velas ao Mar
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto rune-pattern">
        <header className="h-[80px] flex items-center justify-between px-10 glass sticky top-0 z-40 border-b border-viking-gold/10">
          {/* Gold Gradient Line Under Header */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-viking-gold/30 to-transparent" />

          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-viking-blue border border-white/5 active:scale-90"
            >
              {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            
            <div className="hidden lg:flex items-center gap-4">
              <div className="logo-icon w-9 h-9 border-2 border-viking-gold rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(184,145,73,0.3)]">
                <span className="rotate-[-45deg] text-viking-gold font-black text-xl">ᚻ</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.3em] text-viking-gold uppercase font-black leading-none">HEIMDALL</span>
                <span className="text-[9px] text-viking-blue font-bold tracking-[0.5em] uppercase">Watchtower v4.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-5 pl-8 border-l border-white/5">
              <div className="hidden md:flex flex-col items-end">
                <p className="text-sm font-black text-white">{profile?.nome || 'Guerreiro'}</p>
                <p className="text-[10px] text-viking-gold font-black uppercase tracking-[0.3em]">{profile?.role === 'admin' ? 'Jarl' : 'Huskar'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-viking-stone border border-viking-gold/20 relative flex items-center justify-center overflow-hidden group cursor-pointer shadow-lg">
                <div className="absolute inset-0 bg-viking-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute text-3xl opacity-10 text-viking-blue font-serif">ᛉ</span>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.nome} className="relative z-10 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <UserIcon size={24} className="relative z-10 text-slate-500" />
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="p-8 lg:p-12 flex-1 scroll-smooth">
          {children}
        </section>
      </main>

      {/* Modal de Configurações de Perfil */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-viking-stone border border-viking-gold/30 rounded-2xl p-8 w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto themed-scroll"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-viking-gold/20 text-viking-gold">
                  <UserIcon size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white leading-none uppercase">Identidade Viking</h3>
                  <p className="text-[10px] text-viking-gold uppercase tracking-[0.2em] font-bold mt-1">Como você será visto no Valhalla</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex justify-center mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-black border-2 border-viking-gold/30 overflow-hidden shadow-xl">
                      {editingProfile.avatar_url ? (
                        <img src={editingProfile.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-viking-gold/20">
                          <UserIcon size={40} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-viking-gold text-black rounded-lg shadow-lg">
                      <Camera size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Nome de Guerra</label>
                    <input 
                      required
                      value={editingProfile.nome || ''}
                      onChange={e => setEditingProfile({...editingProfile, nome: e.target.value})}
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-viking-gold outline-none transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Papel no Fluxo</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAPEIS_DESENVOLVIMENTO.map(p => {
                        const cfg = PAPEL_CONFIG[p];
                        const isSelected = (editingProfile.papel || 'Desenvolvedor') === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEditingProfile({ ...editingProfile, papel: p as any })}
                            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border font-bold text-xs transition-all duration-150 text-left ${isSelected ? cfg.selected : cfg.idle}`}
                          >
                            <cfg.icon size={15} className="shrink-0" />
                            <span className="leading-none">{p}</span>
                            {isSelected && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Enviar Estandarte (Foto de Perfil)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-black/40 border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3 group-hover:border-viking-gold/40 transition-all">
                        <div className={`p-4 rounded-full bg-viking-gold/10 text-viking-gold transition-all ${isUploading ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                          <Upload size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-white uppercase tracking-tight">Soltar arquivo ou clicar</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">PNG, JPG ou GIF até 2MB</p>
                        </div>
                      </div>
                    </div>
                    
                    {editingProfile.avatar_url && (
                      <div className="flex items-center gap-3 p-3 bg-viking-gold/5 border border-viking-gold/20 rounded-xl">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-viking-gold/30">
                          <img src={editingProfile.avatar_url} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-viking-gold font-bold uppercase tracking-widest italic">Imagem carregada com sucesso!</p>
                      </div>
                    )}
                  </div>

                </div>

                <div className="flex gap-4 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-4 glass rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all text-slate-400"
                  >
                    Recuar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-viking-gold text-black font-black rounded-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-viking-gold/20"
                  >
                    Consagrar Alterações
                  </button>
                </div>
              </form>

              {/* Password Change */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                  <Lock size={12} />
                  Trocar Senha
                </h4>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Nova senha (mín. 6 caracteres)"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-12 focus:border-viking-blue outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(v => !v)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar nova senha"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-viking-blue outline-none transition-all text-sm"
                  />
                  {passwordError && <p className="text-rose-400 text-xs">{passwordError}</p>}
                  {passwordSuccess && <p className="text-emerald-400 text-xs">Senha atualizada com sucesso!</p>}
                  <button
                    type="submit"
                    disabled={!newPassword || !confirmPassword}
                    className="w-full py-3 bg-viking-blue/10 border border-viking-blue/30 text-viking-blue font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-viking-blue/20 transition-all disabled:opacity-30"
                  >
                    Forjar Nova Senha
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast de erro global da API */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-200 flex items-center gap-3 px-5 py-3.5 bg-rose-950 border border-rose-500/40 text-rose-300 rounded-2xl shadow-2xl text-sm font-bold max-w-sm w-full mx-4"
          >
            <span className="text-rose-500 text-lg leading-none">!</span>
            <span className="flex-1">{apiError}</span>
            <button onClick={() => setApiError(null)} className="text-rose-500/60 hover:text-rose-300 transition-colors shrink-0">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const queryClient = new QueryClient();

// --- MAIN APP ---
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuthConsumer />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthConsumer() {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-viking-deep bg-rune-pattern">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-viking-blue/20 border-t-viking-blue rounded-full animate-spin"></div>
          <p className="runic-text text-viking-blue animate-pulse">Convocando o Conselho...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/*" element={
        user ? (
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/battalion" element={<Battalion />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/retro" element={<Retro />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppLayout>
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes>
  );
}
