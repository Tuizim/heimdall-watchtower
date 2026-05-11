import { motion } from 'motion/react';
import { Bookmark, Trash2, History } from 'lucide-react';
import { useDeleteRetroCard } from '../../hooks/useRetro';
import type { RetroCard as RetroCardType } from '../../lib/api';

interface RetroCardProps {
  card: RetroCardType;
  index: number;
}

export function RetroCard({ card, index }: RetroCardProps) {
  const deleteCard = useDeleteRetroCard();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="viking-card p-8 group relative flex flex-col justify-between hover:border-viking-blue/40 transition-all border-l-4 border-l-viking-blue/20"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 bg-viking-blue/10 rounded-lg flex items-center justify-center text-viking-blue group-hover:scale-110 transition-transform">
            <Bookmark size={20} />
          </div>
          <button
            onClick={() => deleteCard.mutate(card.id)}
            className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight group-hover:text-viking-blue transition-colors leading-tight">
          {card.titulo}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-white/5 pl-4 py-1">
          "{card.descricao || 'Nenhum detalhe adicional registrado no pergaminho.'}"
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={12} className="text-slate-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
            {new Date(card.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-viking-gold opacity-30 group-hover:opacity-100 transition-opacity">
          ᚠ SAVED
        </div>
      </div>
    </motion.div>
  );
}
