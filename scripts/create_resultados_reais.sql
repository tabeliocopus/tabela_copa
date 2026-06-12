-- Execute este SQL no painel SQL Editor do Supabase
-- https://supabase.com/dashboard/project/lxmzkemrtbdburygyjxj/sql

CREATE TABLE IF NOT EXISTS resultados_reais (
  match_id    text PRIMARY KEY,  -- ex: "A_M1", "C_M1"
  home_score  integer NOT NULL,
  away_score  integer NOT NULL,
  status      text DEFAULT 'FINISHED', -- FINISHED | IN_PLAY | TIMED
  updated_at  timestamptz DEFAULT now()
);

-- Permite leitura pública (anon key)
ALTER TABLE resultados_reais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de resultados"
  ON resultados_reais FOR SELECT
  USING (true);

-- Permite inserção/atualização apenas via service_role key (usada no script de sync)
CREATE POLICY "Apenas service_role pode escrever"
  ON resultados_reais FOR ALL
  USING (auth.role() = 'service_role');
