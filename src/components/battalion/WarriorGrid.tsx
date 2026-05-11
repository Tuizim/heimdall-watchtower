import { useMemo, useState } from 'react';
import { Search, Shield } from 'lucide-react';
import { Users } from 'lucide-react';
import { useProfiles } from '../../hooks/useProfiles';
import { useTasks } from '../../hooks/useTasks';
import { EmptyState } from '../EmptyState';
import { WarriorCard, type WarriorStats } from './WarriorCard';
import type { Profile } from '../../lib/api';

export function WarriorGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: warriors = [], isLoading } = useProfiles();
  const { data: tasks = [] } = useTasks();

  const warriorStatsMap = useMemo(() => {
    const map = new Map<string, WarriorStats>();
    warriors.forEach(warrior => {
      const completed = tasks.filter(t => t.responsavel_id === warrior.id && t.status === 'concluída');
      map.set(warrior.id, {
        totalPoints:       completed.reduce((acc, t) => acc + t.pontos, 0),
        completedMissions: completed.length,
        activeTasks:       tasks.filter(t => t.responsavel_id === warrior.id && t.status !== 'concluída').length,
      });
    });
    return map;
  }, [warriors, tasks]);

  const filteredWarriors = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return warriors
      .filter((w: Profile) =>
        w.nome.toLowerCase().includes(term) ||
        (w.papel ?? '').toLowerCase().includes(term) ||
        w.classe_viking.toLowerCase().includes(term)
      )
      .sort((a, b) =>
        (warriorStatsMap.get(b.id)?.totalPoints ?? 0) -
        (warriorStatsMap.get(a.id)?.totalPoints ?? 0)
      );
  }, [warriors, searchTerm, warriorStatsMap]);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-viking-blue" size={32} />
            <h1 className="text-4xl font-black tracking-tighter text-white">BATALHÃO DO CLÃ</h1>
          </div>
          <p className="text-viking-text-dim max-w-2xl font-medium">Conheça os bravos guerreiros que forjam o destino deste reino.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Buscar guerreiro ou classe..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 focus:border-viking-blue outline-none transition-all font-bold text-sm text-white"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="viking-card h-64 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWarriors.map((warrior, index) => (
            <WarriorCard
              key={warrior.id}
              warrior={warrior}
              stats={warriorStatsMap.get(warrior.id) ?? { totalPoints: 0, completedMissions: 0, activeTasks: 0 }}
              index={index}
            />
          ))}
        </div>
      )}

      {filteredWarriors.length === 0 && !isLoading && (
        <EmptyState
          icon={Shield}
          title="Nenhum guerreiro encontrado"
          description="As brumas de Helheim ocultaram este nome."
          iconClassName="text-slate-700 mb-6 animate-pulse"
          iconSize={48}
          className="py-40 viking-card border-dashed"
        />
      )}
    </>
  );
}
