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

-- 4. Habilitação de Políticas de Segurança (RLS)
alter table public.leads enable row level security;
alter table public.grupos enable row level security;
alter table public.grupo_membros enable row level security;

-- Políticas de inserção/leitura pública para facilitar chamadas no client-side
create policy "Permitir inserções públicas em leads" on public.leads for insert with check (true);
create policy "Permitir leitura pública em leads" on public.leads for select using (true);

create policy "Permitir inserções públicas em grupos" on public.grupos for insert with check (true);
create policy "Permitir leitura pública em grupos" on public.grupos for select using (true);

create policy "Permitir inserções públicas em membros" on public.grupo_membros for insert with check (true);
create policy "Permitir leitura pública em membros" on public.grupo_membros for select using (true);
create policy "Permitir exclusões públicas em membros" on public.grupo_membros for delete using (true);
