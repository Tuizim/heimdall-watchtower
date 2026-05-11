import { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { AdminUsersHeader } from '../components/adminUsers/AdminUsersHeader';
import { CredentialsBanner, type CreatedCredentials } from '../components/adminUsers/CredentialsBanner';
import { UserList } from '../components/adminUsers/UserList';
import { CreateUserModal } from '../components/adminUsers/CreateUserModal';
import { ResetPasswordModal } from '../components/adminUsers/ResetPasswordModal';
import type { Profile } from '../lib/api';

export default function AdminUsers() {
  const { profile } = useContext(AuthContext);
  const [isCreateOpen, setIsCreateOpen]   = useState(false);
  const [resetUser, setResetUser]         = useState<Profile | null>(null);
  const [credentials, setCredentials]     = useState<CreatedCredentials | null>(null);

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64 text-rose-400 font-bold text-lg">
        Acesso negado — apenas Jarls podem entrar aqui.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminUsersHeader onCreateClick={() => setIsCreateOpen(true)} />
      <CredentialsBanner credentials={credentials} onDismiss={() => setCredentials(null)} />
      <UserList onResetPassword={setResetUser} />
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={setCredentials}
      />
      <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />
    </div>
  );
}
