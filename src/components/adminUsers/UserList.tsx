import { useState } from 'react';
import { Users, Trash2, KeyRound } from 'lucide-react';
import { useAdminUsers, useDeleteAdminUser } from '../../hooks/useAdminUsers';
import { UserAvatar } from '../UserAvatar';
import type { Profile } from '../../lib/api';

interface UserListProps {
  onResetPassword: (user: Profile) => void;
}

export function UserList({ onResetPassword }: UserListProps) {
  const { data: users = [] } = useAdminUsers();
  const deleteUser = useDeleteAdminUser();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    await deleteUser.mutateAsync(userId);
    setConfirmDelete(null);
  };

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <Users size={18} className="text-slate-400" />
        <span className="text-sm font-black uppercase tracking-widest text-slate-400">{users.length} guerreiros no clã</span>
      </div>
      <div className="divide-y divide-white/5">
        {users.map(u => (
          <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {u.avatar_url
                ? <UserAvatar nome={u.nome} avatarUrl={u.avatar_url} />
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
            {u.role !== 'admin' && confirmDelete !== u.id && (
              <button
                onClick={() => onResetPassword(u)}
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
                    disabled={deleteUser.isPending}
                    className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/30 transition-all disabled:opacity-50"
                  >
                    {deleteUser.isPending ? '...' : 'Sim'}
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
  );
}
