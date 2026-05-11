import { useState } from 'react';
import { DeliveriesHeader } from '../components/deliveries/DeliveriesHeader';
import { TaskGrid } from '../components/deliveries/TaskGrid';
import { CreateTaskModal } from '../components/deliveries/CreateTaskModal';
import { RagnarokModal } from '../components/deliveries/RagnarokModal';

export default function Deliveries() {
  const [isCreateOpen, setIsCreateOpen]     = useState(false);
  const [isRagnarokOpen, setIsRagnarokOpen] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <DeliveriesHeader
        onCreateClick={() => setIsCreateOpen(true)}
        onRagnarokClick={() => setIsRagnarokOpen(true)}
      />
      <TaskGrid />
      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <RagnarokModal isOpen={isRagnarokOpen} onClose={() => setIsRagnarokOpen(false)} />
    </div>
  );
}
