import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classes aplicadas ao container de conteúdo (max-w, bg, padding, border, scroll). */
  className?: string;
  zIndex?: 'z-50' | 'z-100';
  backdropClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className = 'max-w-2xl viking-card p-10 border-viking-gold/30 max-h-[90vh] overflow-y-auto no-scrollbar',
  zIndex = 'z-50',
  backdropClassName = 'bg-black/80 backdrop-blur-sm',
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 ${backdropClassName}`}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative z-10 w-full shadow-2xl ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
