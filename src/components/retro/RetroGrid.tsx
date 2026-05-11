import { AnimatePresence } from 'motion/react';
import { Scroll } from 'lucide-react';
import { useRetroCards } from '../../hooks/useRetro';
import { EmptyState } from '../EmptyState';
import { RetroCard } from './RetroCard';

export function RetroGrid() {
  const { data: cards = [], isLoading } = useRetroCards();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {cards.map((card, idx) => (
          <RetroCard key={card.id} card={card} index={idx} />
        ))}
      </AnimatePresence>

      {cards.length === 0 && !isLoading && (
        <EmptyState
          icon={Scroll}
          title="As Memórias Estão Vazias"
          description="Use o botão acima para registrar sabedoria épica."
          iconClassName="text-slate-800 mb-6 animate-pulse"
          className="col-span-full py-24 viking-card border-dashed"
        />
      )}
    </div>
  );
}
