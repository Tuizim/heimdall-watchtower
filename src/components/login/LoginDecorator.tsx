import { motion } from 'motion/react';

export function LoginDecorator() {
  return (
    <div className="hidden lg:flex flex-col relative p-12 border-r border-white/5 bg-slate-950/50">
      <div className="absolute inset-0 opacity-10 rune-pattern pointer-events-none" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="w-10 h-10 border-2 border-viking-gold rotate-45 flex items-center justify-center">
          <span className="-rotate-45 text-viking-gold font-bold text-xl">ᚻ</span>
        </div>
        <h1 className="runic-text text-viking-gold font-bold text-2xl tracking-[0.2em]">Heimdall</h1>
      </div>

      <div className="flex-1 flex items-center">
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-white leading-tight mb-6"
          >
            Vigie os Reinos.<br />
            Controle as <span className="text-viking-blue">Branches</span>.<br />
            Alcance o Valhalla.
          </motion.h2>
          <p className="text-slate-400 max-w-md text-lg">
            A plataforma definitiva para times de elite. Transforme sua sprint em uma jornada lendária.
          </p>
        </div>
      </div>
    </div>
  );
}
