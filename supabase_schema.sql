-- 1. Tabela de leads (Participantes)
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nome text not null,
  email text not null,
  whatsapp text not null,
  simulacao_data jsonb,
  url_compartilhamento text
);

-- 2. Tabela de Grupos de Palpites
create table if not exists public.grupos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nome text not null,
  codigo_acesso text unique not null,
  criador_id uuid references public.leads(id) on delete cascade not null
);

-- 3. Tabela de Associação (Membros do Grupo)
create table if not exists public.grupo_membros (
  id uuid default gen_random_uuid() primary key,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  lead_id uuid references public.leads(id) on delete cascade not null,
  unique (grupo_id, lead_id)
);

-- 4. Tabela de palpites compartilhados publicamente
create table if not exists public.shared_predictions (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  lead_id uuid references public.leads(id) on delete set null,
  simulation_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Eventos de pontuacao para ranking global
create table if not exists public.engagement_events (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  event_type text not null,
  event_key text unique not null,
  points integer not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Habilitação de Políticas de Segurança (RLS)
alter table public.leads enable row level security;
alter table public.grupos enable row level security;
alter table public.grupo_membros enable row level security;
alter table public.shared_predictions enable row level security;
alter table public.engagement_events enable row level security;

create policy "Permitir insercoes publicas em palpites compartilhados" on public.shared_predictions for insert with check (true);
create policy "Permitir leitura publica em palpites compartilhados" on public.shared_predictions for select using (true);

create policy "Permitir insercoes publicas em eventos de ranking" on public.engagement_events for insert with check (true);
create policy "Permitir leitura publica em eventos de ranking" on public.engagement_events for select using (true);

-- Políticas de inserção/leitura pública para facilitar chamadas no client-side
create policy "Permitir inserções públicas em leads" on public.leads for insert with check (true);
create policy "Permitir leitura pública em leads" on public.leads for select using (true);

create policy "Permitir inserções públicas em grupos" on public.grupos for insert with check (true);
create policy "Permitir leitura pública em grupos" on public.grupos for select using (true);

create policy "Permitir inserções públicas em membros" on public.grupo_membros for insert with check (true);
create policy "Permitir leitura pública em membros" on public.grupo_membros for select using (true);
create policy "Permitir exclusões públicas em membros" on public.grupo_membros for delete using (true);

-- 5. Adições da Prioridade 4 (Indicação)
alter table if exists public.leads add column if not exists ref_code text unique;

create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.leads(id) on delete cascade not null,
  invited_id uuid references public.leads(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (referrer_id, invited_id)
);

alter table public.referrals enable row level security;
create policy "Permitir insercoes publicas em referrals" on public.referrals for insert with check (true);
create policy "Permitir leitura publica em referrals" on public.referrals for select using (true);

