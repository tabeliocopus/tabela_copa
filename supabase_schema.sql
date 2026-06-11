-- 1. Criação da tabela de leads
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nome text not null,
  email text not null,
  whatsapp text not null,
  simulacao_data jsonb, -- Guarda os dados de palpites e elenco selecionados pelo usuário
  url_compartilhamento text
);

-- 2. Habilitação de permissão pública para inserção (necessário para APIs client-side)
alter table public.leads enable row level security;

create policy "Permitir inserções públicas na tabela de leads"
on public.leads
for insert
with check (true);

create policy "Permitir leitura apenas autenticada"
on public.leads
for select
to authenticated
using (true);
