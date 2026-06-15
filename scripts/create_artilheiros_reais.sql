-- Tabela para armazenar os artilheiros oficiais da Copa do Mundo 2026
-- Sincronizados automaticamente via api-football.com

CREATE TABLE IF NOT EXISTS artilheiros_reais (
  player_id   INTEGER PRIMARY KEY,       -- ID do jogador na API
  player_name TEXT    NOT NULL,           -- Nome do jogador
  team_name   TEXT    NOT NULL,           -- Nome da seleção
  team_code   TEXT    NOT NULL,           -- Código da seleção (ex: BR, AR, DE)
  team_logo   TEXT,                       -- URL do logo do time na API
  player_photo TEXT,                      -- URL da foto do jogador na API
  goals       INTEGER NOT NULL DEFAULT 0, -- Gols marcados
  assists     INTEGER NOT NULL DEFAULT 0, -- Assistências
  penalties   INTEGER NOT NULL DEFAULT 0, -- Pênaltis convertidos
  games       INTEGER NOT NULL DEFAULT 0, -- Jogos disputados
  updated_at  TIMESTAMPTZ DEFAULT NOW()   -- Última atualização
);

-- Políticas RLS
ALTER TABLE artilheiros_reais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública artilheiros"
  ON artilheiros_reais FOR SELECT
  USING (true);

CREATE POLICY "Insert/Update via service key"
  ON artilheiros_reais FOR ALL
  USING (true)
  WITH CHECK (true);
