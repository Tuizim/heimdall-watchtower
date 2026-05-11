import { useState } from 'react';
import { RetroHeader } from '../components/retro/RetroHeader';
import { RetroGrid } from '../components/retro/RetroGrid';
import { CreateRetroModal } from '../components/retro/CreateRetroModal';

export default function Retro() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <RetroHeader onCreateClick={() => setIsCreateOpen(true)} />
      <RetroGrid />
      <CreateRetroModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
