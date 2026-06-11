# 🧠 BRAIN — Simulador da Copa do Mundo 2026
> Documento vivo com todo o contexto, arquitetura, decisões técnicas e estado atual do projeto.
> **Última atualização:** Junho 2026

---

## 📌 Visão Geral do Produto

**O que é:** Um Web App interativo que permite ao usuário simular todos os jogos da Copa do Mundo FIFA 2026 — da fase de grupos até a grande final — com classificação em tempo real, chaveamento automático de mata-mata, artilharia e um sistema de Mini-Bolão para competir com amigos.

**Objetivo de negócio:** Capturar leads qualificados (Nome + E-mail + WhatsApp) de fãs de futebol interessados na Copa 2026, usando a mecânica viral do simulador como isca. Cada lead capturado inclui os dados completos da simulação do usuário para segmentação futura.

**Público-alvo:** Fãs de futebol brasileiros, usuários de WhatsApp, apostadores recreativos.

**Mecanismo de viralização:** O usuário compartilha o link de sua simulação (com parâmetro `?sim=...` codificado em Base64) ou o código do grupo do Bolão (ex: `COPA-5A3F`) com amigos.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Função | Motivo |
|---|---|---|
| **Astro** | Framework Web (SSG) | Performance máxima, SEO perfeito, HTML estático |
| **Vanilla CSS** | Estilização | Glassmorphism, variáveis CSS, sem dependências |
| **JavaScript (client-side)** | Engine do simulador | Toda a lógica roda no browser, sem servidor |
| **Supabase** | Banco de dados + API | Gratuito, REST API nativa, fácil integração |
| **Vercel** | Hospedagem / Deploy | Integração direta com GitHub, deploy automático |
| **GitHub** | Repositório de código | Controle de versão e trigger de deploy |
| **Google Fonts (Outfit)** | Tipografia | Fonte moderna, pesos variados, gratuita |
| **html2canvas** | Download de imagem | Captura do mata-mata como PNG sem backend |

---

## 📁 Estrutura de Arquivos

```
TABELA COPA/
├── src/
│   ├── pages/
│   │   └── index.astro         ← Página principal (toda a lógica da app)
│   ├── layouts/
│   │   └── Layout.astro        ← Layout base (HTML head, meta tags, SEO)
│   ├── data/
│   │   └── worldCupData.js     ← Base de dados: 48 seleções, 12 grupos, jogadores
│   └── styles/
│       └── global.css          ← Sistema de design completo (vars, componentes, bolão)
├── public/
│   ├── flags/                  ← Bandeiras das seleções (SVG/PNG via CDN)
│   └── robots.txt              ← Configuração de indexação SEO
├── .env                        ← Credenciais Supabase (NÃO vai ao Git)
├── .env.example                ← Template de configuração para novos devs
├── .gitignore                  ← Ignora .env, node_modules, dist/
├── supabase_schema.sql         ← Script SQL completo do banco de dados
├── astro.config.mjs            ← Configuração do Astro
├── package.json                ← Dependências do projeto
└── brain.md                    ← Este arquivo
```

---

## 🎯 Funcionalidades Implementadas

### Fase de Grupos (⚽)
- Grid responsivo com os **12 grupos** (A a L) da Copa 2026
- Cada grupo exibe: **tabela de classificação** (Pts, J, V, SG) e **lista de partidas** com inputs de placar
- Classificação recalculada **em tempo real** a cada placar digitado
- **Indicadores visuais:** borda verde = classificado direto, borda azul = melhor terceiro colocado
- Regra oficial da FIFA: **seleção dos 8 melhores terceiros colocados** implementada

### Mata-Mata (🏆)
- Chaveamento **automático** montado a partir do resultado dos grupos
- Rodadas: Dezesseis-avos → Oitavas → Quartas → Semifinais → Grande Final
- Clicar na seleção = avança para a próxima fase
- Banner animado **"Campeão do Mundo"** ao definir o vencedor da final

### Artilharia (👟)
- Ícone ⚽ ao lado de cada placar abre modal de seleção de artilheiro
- Tabela **"Chuteira de Ouro"** ordenada por número de gols
- Gols registrados por jogador, associados à seleção

### Instruções (💡)
- Painel accordion colapsável no topo da página
- 4 passos ilustrados explicando como usar o simulador
- Botão **"⚡ Simulação Rápida"** que preenche todos os 72 jogos com placares aleatórios (0-3 gols por time)

### Captura de Leads (🎯)
- Modal de cadastro **Lead Gate** (Nome, E-mail, WhatsApp)
- Ativado ao clicar em "Compartilhar" ou "Baixar Imagem"
- Dados salvos no `localStorage` (persistência local) + enviados ao Supabase (persistência na nuvem)
- Simulação do usuário salva junto ao lead no campo `simulacao_data` (JSON)

### Compartilhamento (📢)
- Gera URL única com a simulação codificada em **Base64** no parâmetro `?sim=...`
- Ao abrir o link compartilhado, a simulação do outro usuário é carregada automaticamente
- Integração com **WhatsApp Web** (abre wa.me com mensagem pré-preenchida)

### Download de Imagem (🖼️)
- Usa **html2canvas** para capturar o chaveamento do mata-mata como imagem PNG
- Download direto no navegador sem necessidade de backend

### Mini-Bolão (👥)
- **Criar Grupo:** Gera código único `COPA-XXXX`, cria grupo no Supabase e adiciona criador como primeiro membro
- **Entrar em Grupo:** Valida código no Supabase, adiciona o lead como membro
- **Leaderboard:** Lista participantes do grupo com link para ver palpites de cada um
- **Link Mágico de Convite:** `?bolao=COPA-XXXX` — abre a aba do Bolão com código preenchido automaticamente
- Grupos salvos no `localStorage` para persistência local offline
- Exige cadastro de lead para participar (gate de proteção)

---

## 🗃️ Banco de Dados (Supabase)

**Projeto Supabase:** `lxmzkemrtbdburygyjxj`
**URL base:** `https://lxmzkemrtbdburygyjxj.supabase.co`

### Tabelas

#### `leads` — Participantes cadastrados
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | ID único gerado automaticamente |
| `created_at` | timestamptz | Data/hora do cadastro |
| `nome` | text | Nome completo |
| `email` | text | E-mail (usado como chave de busca) |
| `whatsapp` | text | Número de WhatsApp |
| `simulacao_data` | jsonb | Snapshot completo da simulação (matches, bracket, artilheiros) |
| `url_compartilhamento` | text | URL da simulação gerada |

#### `grupos` — Grupos do Bolão
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | ID único do grupo |
| `created_at` | timestamptz | Data de criação |
| `nome` | text | Nome do grupo (ex: "Família Silva") |
| `codigo_acesso` | text (unique) | Código de convite (ex: `COPA-5A3F`) |
| `criador_id` | uuid (FK → leads.id) | Lead que criou o grupo |

#### `grupo_membros` — Associação Participante ↔ Grupo
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | ID único |
| `joined_at` | timestamptz | Data de entrada no grupo |
| `grupo_id` | uuid (FK → grupos.id) | Grupo ao qual pertence |
| `lead_id` | uuid (FK → leads.id) | Participante |

> **Constraint:** `unique(grupo_id, lead_id)` — impede duplicatas.

### Políticas RLS (Row Level Security)
Todas as 3 tabelas têm RLS habilitado com políticas de **leitura e inserção públicas** para permitir chamadas diretas do client-side com a `anon key`.

---

## 🔐 Variáveis de Ambiente

```env
# .env (local — nunca commitar)
PUBLIC_SUPABASE_URL=https://lxmzkemrtbdburygyjxj.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ As variáveis são prefixadas com `PUBLIC_` pois o Astro SSG as expõe ao browser em tempo de build. Nunca use chaves secretas com esse prefixo.

**Na Vercel:** Configuradas em `Settings → Environment Variables` do projeto.

---

## 🚀 Pipeline de Deploy

```
Edição Local → git add . → git commit → git push origin main
                                              ↓
                                         GitHub (tabeliocopus/tabela_copa)
                                              ↓ webhook automático
                                         Vercel detecta push
                                              ↓
                                         npm run build (astro build)
                                              ↓
                                         Site publicado em produção 🌐
```

**Conta Git local:** `tabeliocopus` (configurada com `git remote set-url` com usuário na URL)
**Repositório:** `https://github.com/tabeliocopus/tabela_copa` (público)
**Branch de produção:** `main`

---

## 🎨 Sistema de Design

**Tema:** Dark mode com glassmorphism e acentos neon

| Token | Valor | Uso |
|---|---|---|
| `--bg-main` | `#060913` | Fundo principal |
| `--bg-card` | `rgba(13,20,38,0.65)` | Cards com blur |
| `--color-primary` | `#00ff87` | Verde neon (CTAs, destaques) |
| `--color-secondary` | `#60a5fa` | Azul gelo (links, subtítulos) |
| `--color-accent` | `#ffd700` | Dourado (campeão, troféus) |
| `--color-danger` | `#ff4757` | Vermelho (erros, perigo) |
| `--font-sans` | `Outfit` | Fonte principal (Google Fonts) |

---

## 📊 Dados da Copa 2026

- **48 seleções** distribuídas em **12 grupos** (A a L)
- **4 seleções por grupo**
- **6 jogos por grupo** = **72 jogos** na fase de grupos
- **Fase eliminatória:** Dezesseis-avos → Oitavas → Quartas → Semi → Final
- **Classificados:** 1º e 2º de cada grupo (24) + 8 melhores 3ºs colocados = **32 times** no mata-mata
- Cada seleção possui: nome, bandeira (URL), confederação, e elenco com jogadores e posições

---

## 🗺️ Roadmap / Próximas Features

### Fase 2 — Bolão Competitivo (Pontuação Real)
- [ ] Tabela `resultados_reais` no Supabase com os placares oficiais dos jogos
- [ ] Algoritmo de pontuação: Placar exato (25pts) / Vencedor+Saldo (15pts) / Vencedor (10pts) / Empate (8pts)
- [ ] Leaderboard com pontuação calculada dinamicamente
- [ ] Notificação via WhatsApp quando um jogo real acontecer e os pontos forem atualizados

### Fase 3 — Simulação por Favoritismo
- [ ] Atributo `forca` (0-100) por seleção baseado no ranking FIFA real
- [ ] Botão "Simular por Favoritismo" que pondera resultados aleatórios pela força das equipes

### Fase 4 — Painel Admin
- [ ] Página protegida `/admin` para inserir resultados reais dos jogos
- [ ] Dashboard com total de leads, grupos criados e participantes ativos

### Fase 5 — Estatísticas da Simulação
- [ ] Painel "Curiosidades da sua Copa": maior goleada, confederação com mais times no mata-mata, artilheiro total
- [ ] Shareable card de estatísticas para redes sociais

---

## 🐛 Bugs Conhecidos / Observações

1. **URL do Supabase:** O código sanitiza automaticamente trailing slashes ou `/rest/v1/` acidental no final da URL antes de fazer chamadas à API.
2. **Persistência do Bolão offline:** Se o Supabase não estiver configurado, os grupos são armazenados apenas no `localStorage` — funcional, mas sem sincronização entre dispositivos.
3. **Simulação aleatória:** O botão "Simulação Rápida" não usa favoritismo — é puro `Math.random()`. Pode gerar resultados irreais (ex: 3x3 em toda rodada).

---

## 📞 Contato / Configuração

| Recurso | Detalhe |
|---|---|
| GitHub | `https://github.com/tabeliocopus/tabela_copa` |
| Supabase | `https://supabase.com/dashboard/project/lxmzkemrtbdburygyjxj` |
| Vercel | Conectado ao repo GitHub (deploy automático no push para `main`) |
---

## Atualizacao Fase 2 - Crescimento e Viralizacao

**Status local:** Implementado no workspace, ainda nao commitado/pushado para o GitHub.

### Prioridade 1 - Pagina publica de palpites
- [x] Criada rota dinamica `src/pages/palpite/[slug].astro`.
- [x] Rota publica `/palpite/[slug]` busca dados no Supabase pela tabela `shared_predictions`.
- [x] Exibe campeao, vice-campeao, top 5 artilheiros, resumo do chaveamento e data de criacao.
- [x] CTA "Criar Minha Simulacao" aponta para a home.
- [x] Compartilhamento da home passou a tentar gerar URL publica `/palpite/[slug]`.
- [x] Mantido fallback legado `?sim=...` caso a criacao do palpite publico falhe.
- [x] Tabela `shared_predictions` adicionada ao `supabase_schema.sql` e ja executada manualmente no Supabase pelo usuario.

### Prioridade 2 - Estatisticas da Galera
- [x] Criada rota `src/pages/estatisticas.astro`.
- [x] Pagina `/estatisticas` busca dados da tabela `leads`.
- [x] Exibe total de simulacoes, total de usuarios unicos, campeoes computados e artilheiros computados.
- [x] Exibe percentual de Brasil, Argentina e Franca campeoes.
- [x] Exibe top 10 campeoes mais escolhidos.
- [x] Exibe top 10 artilheiros mais escolhidos.
- [x] Nao exigiu SQL novo alem do que ja existia em `leads`.

### Infra/Build
- [x] Instalado `@astrojs/vercel` para suportar rotas server-rendered no deploy da Vercel.
- [x] `astro.config.mjs` configurado com adapter da Vercel.
- [x] `.vercel/` adicionado ao `.gitignore`.
- [x] Build validado com `npm.cmd run build`.

### Arquivos alterados nesta etapa
- `.gitignore`
- `astro.config.mjs`
- `package.json`
- `package-lock.json`
- `src/pages/index.astro`
- `src/pages/palpite/[slug].astro`
- `src/pages/estatisticas.astro`
- `supabase_schema.sql`
- `brain.md`

### Proxima prioridade
- Prioridade 3 - Ranking Global (`/ranking`) com pontuacao por engajamento.

---

## Atualizacao Prioridade 3 - Ranking Global

**Status local:** Implementado no workspace, ainda nao commitado/pushado para o GitHub.

### Ranking Global
- [x] Criada rota `src/pages/ranking.astro`.
- [x] Pagina `/ranking` mostra posicao, nome e pontuacao.
- [x] Ranking agrega dados da tabela `engagement_events`.
- [x] Leads antigos com `simulacao_data` recebem fallback visual de +10 pontos quando ainda nao existe evento `simulation_created`.
- [x] Regras iniciais implementadas no codigo:
  - Criou simulacao: +10
  - Compartilhou: +20
  - Criou grupo: +30
  - Entrou em grupo: +5
  - Convidou amigo: +15 preparado na lista de regras para a proxima prioridade

### Banco
- [x] Adicionada tabela `engagement_events` ao `supabase_schema.sql`.
- [x] Eventos usam `event_key` unico para reduzir pontuacao duplicada.
- [x] RLS e policies publicas de insert/select adicionadas para chamadas client-side.

### Arquivos alterados nesta prioridade
- `src/pages/index.astro`
- `src/pages/ranking.astro`
- `supabase_schema.sql`
- `brain.md`

### Validacao
- [x] Build validado com `npm.cmd run build`.

### Proxima prioridade
- Prioridade 5 - Conquistas/Badges baseadas em eventos e indicacoes.

---

## Atualizacao Prioridade 4 - Sistema de Indicação

**Status local:** Implementado no workspace, ainda nao commitado/pushado para o GitHub.

### Sistema de Indicacao
- [x] Criada tabela `referrals` no banco de dados e adicionado campo `ref_code` na tabela de `leads`.
- [x] Gerado `ref_code` unico do usuario (ex: `COPUS-8F3A`) ao registrar lead.
- [x] Legados sao migrados dinamicamente ao abrir a aba Bolao, recebendo `ref_code` e atualizando local e remotamente (via fetch `PATCH`).
- [x] Exibido Card do Programa de Indicacoes na aba do Bolao com link de indicacao (`?ref=COPUS-XXXX`) e botao de copiar link.
- [x] Links de compartilhamento (`?sim=` ou `/palpite/[slug]`) agora ganham sufixo `&ref=COPUS-XXXX` automaticamente ao serem gerados.
- [x] Quando um usuario entra com `?ref=...`, o codigo de convite e salvo em local storage.
- [x] Apos o cadastro do lead convidado, o vinculo e criado na tabela `referrals`.
- [x] Atribuida recompensa no Ranking Global:
  - Quem convida ganha: +15 pontos (evento `friend_invited`).
  - Quem e convidado e se cadastra ganha: +15 pontos (evento `invited_by_friend`).

### Banco
- [x] Adicionada coluna `ref_code` na tabela de `leads` no `supabase_schema.sql`.
- [x] Adicionada tabela `referrals` e suas restricoes no `supabase_schema.sql`.
- [x] Políticas de RLS de insert e select publicas criadas para `referrals`.

### Arquivos alterados nesta prioridade
- `src/pages/index.astro`
- `src/pages/ranking.astro`
- `supabase_schema.sql`
- `brain.md`

### Validacao
- [x] Build validado com `npm run build`.
