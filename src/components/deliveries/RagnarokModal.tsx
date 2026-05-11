import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame } from 'lucide-react';
import { useDeleteAllTasks } from '../../hooks/useTasks';

interface RagnarokModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RagnarokModal({ isOpen, onClose }: RagnarokModalProps) {
  const deleteAllTasks = useDeleteAllTasks();
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const execute = async () => {
    onClose();
    try {
      await deleteAllTasks.mutateAsync();
      setFeedback('Valhalla foi limpo. O reino renasceu das cinzas.');
    } catch {
      setFeedback('Os deuses impediram o reset.');
    } finally {
      timerRef.current = setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-rose-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-viking-stone border-2 border-rose-500/30 rounded-3xl p-10 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-rose-500 to-transparent" />
              <div className="bg-rose-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-500/20">
                <Flame size={40} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-rose-500 uppercase tracking-tighter mb-4 italic">O Fim dos Tempos?</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                O Ragnarök apagará <span className="text-white font-black">TODAS</span> as missões. Esta ação é irreversível.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={execute} className="w-full py-4 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 transition-all uppercase tracking-widest shadow-lg shadow-rose-500/20">
                  Sim, Iniciar o Ragnarök
                </button>
                <button onClick={onClose} className="w-full py-4 bg-transparent text-slate-500 font-bold rounded-xl hover:text-white transition-all uppercase tracking-widest text-xs">
                  Recuar para o Valhalla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-100 px-6 py-3 bg-rose-600 text-white font-black rounded-full shadow-2xl uppercase tracking-widest text-xs border border-white/20"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
