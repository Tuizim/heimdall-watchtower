import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RetroCard } from '../types';
import { 
  Scroll,
  MessageSquare, 
  Trash2,
  Plus,
  X,
  History,
  PenTool,
  Bookmark,
  Anchor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Retro() {
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    titulo: '',
    descricao: '',
    status: 'Pendentes'
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('retro_cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      console.error("Erro ao buscar pergaminhos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('retro_cards').insert([newCard]);
      if (error) throw error;
      
      setIsModalOpen(false);
      setNewCard({ titulo: '', descricao: '', status: 'Pendentes' });
      fetchCards();
    } catch (err) {
      console.error("Erro ao criar pergaminho:", err);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const { error } = await supabase.from('retro_cards').delete().eq('id', id);
      if (error) throw error;
      fetchCards();
    } catch (err) {
      console.error("Erro ao apagar pergaminho:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-viking-blue/20 rounded-2xl border border-viking-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
             <Scroll className="text-viking-blue" size={32} />
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Pergaminhos de Memória</h1>
             <p className="text-viking-text-dim font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
               <Anchor size={12} className="text-viking-gold" />
               O que o Clã não deve esquecer
             </p>
           </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-5 bg-viking-gold text-black font-black rounded-xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-viking-gold/20 text-xs uppercase tracking-widest"
        >
          <PenTool size={20} strokeWidth={3} />
          REGISTRAR NOTA
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {cards.map((card, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              key={card.id}
              className="viking-card p-8 group relative flex flex-col justify-between hover:border-viking-blue/40 transition-all border-l-4 border-l-viking-blue/20"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                   <div className="w-10 h-10 bg-viking-blue/10 rounded-lg flex items-center justify-center text-viking-blue group-hover:scale-110 transition-transform">
                      <Bookmark size={20} />
                   </div>
                   <button 
                     onClick={() => handleDeleteCard(card.id)}
                     className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight group-hover:text-viking-blue transition-colors leading-tight">
                  {card.titulo}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-white/5 pl-4 py-1">
                  "{card.descricao || "Nenhum detalhe adicional registrado no pergaminho."}"
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
          ))}
        </AnimatePresence>

        {cards.length === 0 && !loading && (
          <div className="col-span-full py-24 viking-card border-dashed flex flex-col items-center justify-center">
             <Scroll size={64} className="text-slate-800 mb-6 animate-pulse" />
             <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.2em]">As Memórias Estão Vazias</h3>
             <p className="text-slate-700 mt-2 font-medium">Use o botão acima para registrar sabedoria épica.</p>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg viking-card p-10 border-viking-blue/30 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-viking-blue/20 rounded-xl text-viking-blue">
                     <Plus size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Novo Pergaminho</h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateCard} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">O que devemos lembrar?</label>
                  <input 
                    required
                    value={newCard.titulo}
                    onChange={e => setNewCard({...newCard, titulo: e.target.value})}
                    type="text" 
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-5 focus:border-viking-blue outline-none transition-all placeholder:text-slate-700 font-bold"
                    placeholder="Título da nota..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Conte na Saga (Detalhes)</label>
                  <textarea 
                    value={newCard.descricao}
                    onChange={e => setNewCard({...newCard, descricao: e.target.value})}
                    rows={4}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-5 focus:border-viking-blue outline-none transition-all placeholder:text-slate-700 font-medium resize-none"
                    placeholder="Descreva a memória épica aqui..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-viking-blue text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-viking-blue/20 uppercase tracking-[0.2em] mt-4"
                >
                  Confirmar Registro
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
