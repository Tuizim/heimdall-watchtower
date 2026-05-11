import { useState } from 'react';
import { useBranches } from '../hooks/useBranches';
import { BranchesHeader } from '../components/branches/BranchesHeader';
import { BranchTable } from '../components/branches/BranchTable';
import { CreateBranchModal } from '../components/branches/CreateBranchModal';
import { BranchStats } from '../components/branches/BranchStats';

export default function Branches() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { refetch } = useBranches();

  return (
    <div className="space-y-10 pb-12">
      <BranchesHeader
        onCreateClick={() => setIsCreateOpen(true)}
        onRefresh={() => refetch()}
      />
      <BranchTable />
      <BranchStats />
      <CreateBranchModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
