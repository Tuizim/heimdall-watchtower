-- HEIMDALL WATCHTOWER - DATABASE SCHEMA

-- 1. Create User Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  classe_viking TEXT DEFAULT 'Thrall', -- Classes: Berserker Backend, Rune Keeper, Guardian QA, Seer Frontend, Blacksmith DevOps
  papel TEXT DEFAULT 'Desenvolvedor', -- Papel no fluxo: Desenvolvedor, Líder Técnico, Agilista, QA, DevOps, Designer, Product Owner
  role TEXT DEFAULT 'user', -- 'admin' or 'user'
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration: adicionar coluna papel a tabelas existentes
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS papel TEXT DEFAULT 'Desenvolvedor';

-- Migration: adicionar coluna login (username único para autenticação admin)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login TEXT UNIQUE;

-- 2. Tasks (Missions) Table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  pontos INTEGER DEFAULT 1,
  dias_estimados INTEGER DEFAULT 1,
  data_prevista DATE,
  status TEXT DEFAULT 'Verde', -- 'Verde', 'Amarelo', 'Vermelho', 'Roxo' (Bloqueado)
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Branches Table
CREATE TABLE branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_branch TEXT NOT NULL,
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ultimo_update TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  status TEXT DEFAULT 'Em progresso', -- 'Atualizada', 'Precisa Rebase', 'Abandonada', 'Em progresso'
  observacao TEXT
);

-- 4. Retrospective Cards
CREATE TABLE retro_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'Pendentes', -- 'Pendentes', 'Em andamento', 'Concluídas', 'Congeladas'
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Badges Table
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT -- Lucide icon name
);

-- 6. User Badges (Relationship)
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Adjust according to your needs)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Everyone can view tasks." ON tasks FOR SELECT USING (true);
CREATE POLICY "Admins can manage tasks." ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view branches." ON branches FOR SELECT USING (true);
CREATE POLICY "Admins can manage branches." ON branches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view retro_cards." ON retro_cards FOR SELECT USING (true);
CREATE POLICY "Everyone can manage their own retro_cards." ON retro_cards FOR ALL USING (
  auth.uid() = responsavel_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
