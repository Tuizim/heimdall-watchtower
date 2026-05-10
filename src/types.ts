export type VikingClass =
  | 'Berserker Backend'
  | 'Rune Keeper'
  | 'Guardian QA'
  | 'Seer Frontend'
  | 'Blacksmith DevOps'
  | 'Recruta'
  | string;

export type PapelDesenvolvimento =
  | 'Desenvolvedor'
  | 'Líder Técnico'
  | 'Agilista'
  | 'QA'
  | 'DevOps'
  | 'Designer'
  | 'Product Owner';

export const PAPEIS_DESENVOLVIMENTO: PapelDesenvolvimento[] = [
  'Desenvolvedor',
  'Líder Técnico',
  'Agilista',
  'QA',
  'DevOps',
  'Designer',
  'Product Owner',
];

export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  classe_viking: VikingClass;
  papel: PapelDesenvolvimento;
  role: UserRole;
  xp: number;
  created_at: string;
}

export type StatusTarefa = 'dentro do prazo' | 'próximo do prazo' | 'atrasado' | 'bloqueado' | 'concluída';

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  pontos: number;
  dias_estimados: number;
  data_prevista: string;
  responsavel_id: string;
  status: StatusTarefa;
  created_at: string;
}

export type StatusBranch = 'atualizada' | 'precisa rebase' | 'abandonada' | 'em progresso';

export interface Branch {
  id: string;
  nome: string;
  responsavel_id?: string;
  ultimo_update: string;
  status: StatusBranch;
}

export type RetroStatus = 'Pendentes' | 'Em andamento' | 'Concluídas' | 'Congeladas';

export interface RetroCard {
  id: string;
  titulo: string;
  descricao?: string;
  status: RetroStatus;
  responsavel_id?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
}
