import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Eye, EyeOff } from 'lucide-react';

export interface CreatedCredentials {
  nome:  string;
  login: string;
  senha: string;
}

interface CredentialsBannerProps {
  credentials: CreatedCredentials | null;
  onDismiss: () => void;
}

export function CredentialsBanner({ credentials, onDismiss }: CredentialsBannerProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCredentials = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Login: ${credentials.login}\nSenha: ${credentials.senha}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {credentials && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-2">Guerreiro convocado com sucesso!</p>
            <p className="text-white font-bold">{credentials.nome}</p>
            <p className="text-slate-400 text-sm mt-1">
              Login: <span className="text-white font-mono">{credentials.login}</span>
              {' · '}
              Senha: <span className="text-white font-mono">{showPassword ? credentials.senha : '••••••••'}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPassword(v => !v)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={copyCredentials}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-500/30 transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button onClick={onDismiss} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
