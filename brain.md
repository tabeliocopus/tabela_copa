# 🧠 BRAIN — Simulador da Copa do Mundo 2026
> Documento vivo com todo o contexto, arquitetura, decisões técnicas e estado atual do projeto.
> **Última atualização:** 12 de Junho de 2026

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
│   │   ├── index.astro                     ← Página principal (simulador, bolão, leads)
│   │   ├── estatisticas.astro              ← Página de estatísticas globais
│   │   ├── ranking.astro                   ← Ranking global de engajamento e badges
│   │   ├── jogos-do-brasil-copa-2026.astro ← Calendário dos jogos do Brasil (SEO)
│   │   ├── bolao-copa-2026.astro           ← Landing page do Bolão (SEO)
│   │   ├── simulador-copa-2026.astro       ← Landing page do Simulador (SEO)
│   │   ├── tabela-copa-2026.astro          ← Tabela geral dos grupos (SEO)
│   │   ├── grupo-[a-l]-copa-2026.astro     ← Páginas individuais dos 12 grupos (SEO)
│   │   └── palpite/
│   │       └── [slug].astro                ← Rota dinâmica para palpites compartilhados
│   ├── components/
│   │   └── SeoGroupPage.astro              ← Template para páginas de grupo
│   ├── layouts/
│   │   └── Layout.astro                    ← Layout base (HTML head, meta tags, SEO)
│   ├── data/
│   │   ├── worldCupData.js                 ← Base de dados: 48 seleções, 12 grupos, jogadores
│   │   └── seoGroups.js                    ← Metadados e textos para SEO
│   └── styles/
│       └── global.css                      ← Sistema de design completo (vars, componentes)
├── scripts/
│   └── stress_test.js                  ← Teste de carga e estresse de Supabase
├── public/
│   ├── flags/                          ← Bandeiras das seleções
│   ├── favicon.ico / favicon.svg       ← Favicons do site
│   └── robots.txt                      ← Configuração de indexação SEO
├── .env                                ← Credenciais Supabase (NÃO vai ao Git)
├── .env.example                        ← Template de configuração
├── .gitignore                          ← Ignora .env, node_modules, dist/
├── supabase_schema.sql                 ← Script SQL completo do banco de dados
├── astro.config.mjs                    ← Configuração do Astro
├── package.json                        ← Dependências do projeto
└── brain.md                            ← Este arquivo
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

### Fase 5 — Estatísticas Individuais da Simulação
> Nota: As Estatísticas da Galera (Globais) já foram concluídas na Prioridade 2.
- [ ] Painel "Curiosidades da sua Copa" (Individual): maior goleada, confederação com mais times no mata-mata, artilheiro total
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

---

## Atualizacao Prioridade 5 - Conquistas (Gamificacao & Badges)

**Status:** Implementado e commitado.

### Badges implementados
1. **Palpiteiro** (⚽) — Fez a primeira simulacao.
2. **Fundador** (👥) — Criou um grupo no Bolao.
3. **Divulgador** (📢) — Compartilhou a simulacao.
4. **Influenciador** (🔥) — Convidou 5 ou mais amigos.
5. **Embaixador** (👑) — Convidou 10 ou mais amigos.
6. **Elite** (🏆) — Esta no Top 100 do Ranking Global.

### Onde aparecem
- **Ranking Global (`/ranking`):** Badges calculados server-side, exibidos ao lado do nome de cada participante na tabela.
- **Aba Bolao (index):** Card "Minhas Conquistas" carrega eventos e indicacoes do usuario via Supabase e renderiza badges desbloqueados (coloridos, com borda neon) e bloqueados (opacidade reduzida).

### Logica
- No ranking, badges sao calculados a partir dos dados ja carregados (`eventsByLeadId`, `leadMap`, posicao no ranking).
- No client-side, `initBolao()` faz 2 fetches paralelos: `engagement_events` do usuario e `referrals` onde ele e referrer.
- Funcao `renderUserBadges(events, inviteCount)` gera HTML dinamico com cards glass-card.

### Arquivos alterados nesta prioridade
- `src/pages/index.astro`
- `src/pages/ranking.astro`
- `brain.md`

### Validacao
- [x] Build validado com `npm run build`.

---

## Atualizacao Prioridade 6 - SEO Programático

**Status:** Implementado e compilado.

### Paginas Criadas
- **Grupo A a L (`/grupo-a-copa-2026` a `/grupo-l-copa-2026`):**
  - Mostra as seleções do grupo, destaques de jogadores e a tabela de confrontos de forma responsiva.
- **Jogos do Brasil (`/jogos-do-brasil-copa-2026`):**
  - Mostra a tabela completa dos jogos da Seleção Brasileira na fase de grupos (Grupo D) com destaques de elenco.
- **Tabela Geral (`/tabela-copa-2026`):**
  - Visão agregada de todos os 12 grupos com links diretos para o detalhe de cada grupo.
- **Simulador Geral (`/simulador-copa-2026`):**
  - Apresenta as principais funcionalidades do simulador (fase de grupos, mata-mata, artilharia, bolão).
- **Bolão Geral (`/bolao-copa-2026`):**
  - Explicação do funcionamento, regras, pontos e benefícios do Mini-Bolão.

### SEO e Performance
- Todos os arquivos utilizam metadados Open Graph (Title, Description, Images) dinâmicos ou específicos para a página.
- Adicionado JSON-LD no padrão Schema.org (`SportsEvent` para partidas e grupos, `WebApplication` para simulador e bolão).
- Design responsivo unificado integrado com a identidade visual do projeto principal.
- CTA chamativo ("CRIAR MINHA SIMULAÇÃO") direcionando para a home page.
- Renderizados estaticamente durante o build para performance máxima.

### Arquivos alterados/criados nesta prioridade
- `src/data/seoGroups.js` (Helper de metadados)
- `src/components/SeoGroupPage.astro` (Template reutilizável)
- `src/pages/grupo-[a-l]-copa-2026.astro` (12 páginas de grupo)
- `src/pages/jogos-do-brasil-copa-2026.astro`
- `src/pages/tabela-copa-2026.astro`
- `src/pages/simulador-copa-2026.astro`
- `src/pages/bolao-copa-2026.astro`
- `brain.md`

### Validacao
- [x] Build completo gerou com sucesso todos os arquivos HTML na pasta dist.

---

## Atualizacao Prioridade 7 - Captura Avançada de Leads

**Status:** Implementado e compilado.

### Recursos e Gatilhos adicionados
- **Variável de controle (`leadModalTriggered`):** Garante que o modal de cadastro seja aberto no máximo 1 vez por sessão para não prejudicar a experiência do usuário.
- **Função unificada (`triggerLeadCaptureModal(reason)`):** Centraliza a abertura do modal verificando se o usuário já está cadastrado (`localStorage.getItem('lead_cadastrado')`).
- **Gatilho de Finalização de Chaveamento:**
  - Disparado automaticamente 1 segundo após o usuário preencher o placar da final e determinar o Campeão.
- **Gatilho de Exit Intent (Intenção de Saída):**
  - Monitora o movimento do mouse (`mouseleave` no document). Caso o cursor saia do topo da janela (coordenada `clientY < 0`), o modal é ativado instantaneamente.
- **Gatilho por Tempo (Timer):**
  - Abre o modal após 45 segundos de navegação ininterrupta na página principal.

### Arquivos alterados/criados nesta prioridade
- `src/pages/index.astro`
- `brain.md`

### Validacao
- [x] Build verificado com sucesso.

---

## Atualizacao Prioridade 8 - Testes de Estresse, Carga e Simulações

**Status:** Implementado e validado.

### Recursos criados
- **Script de teste automatizado (`scripts/stress_test.js`):**
  - Desenvolvido em Node.js nativo (v22+), utilizando ES Modules e `fetch` nativo.
  - Implementa inserções em lote (bulk posts) de 1.000 para `leads`, 500 para `grupos`/`grupo_membros` e 2.000 para `engagement_events`.
  - Possui fallback inteligente: detecta se a coluna `ref_code` está presente na tabela `leads` no banco de dados e se adapta dinamicamente para não falhar o teste.
- **Relatório e Diagnóstico de RLS:**
  - Identificou que as tabelas estão com RLS ativo no Supabase, mas sem políticas públicas de `INSERT` correspondentes, gerando erro `42501 (new row violates row-level security policy)`.
  - Criado o artefato contendo as queries de SQL necessárias para corrigir as políticas diretamente no painel do Supabase.

### Arquivos alterados/criados nesta prioridade
- `scripts/stress_test.js`
- `brain.md`
- `artifacts/stress_test_report.md` (Relatório de Diagnóstico e SQL de Correção)

### Conclusao Geral
- Todas as Prioridades de 1 a 8 do plano de crescimento e viralização do Tabélio Copus foram concluídas, validadas e commitadas com sucesso!

---

## Atualizacao Adicional — Correção dos Grupos e Calendário Oficial da Copa 2026

**Status:** Implementado, validado e compilado com sucesso.

### Correções Realizadas
1. **Seleções e Grupos Oficiais (Fase de Grupos):**
   - Substituídas as 48 seleções genéricas/mockadas do arquivo `src/data/worldCupData.js` pelos times oficiais que compõem os 12 grupos reais (A a L) do sorteio da Copa do Mundo 2026.
   - O Brasil foi realocado corretamente para o **Grupo C** (composto por Brasil, Marrocos, Haiti e Escócia) — corrigindo o erro onde estava no Grupo D com times incorretos.
   - Adicionados jogadores reais destacados para cada seleção no array `players`.

2. **Datas e Horários Oficiais das Partidas:**
   - Atualizado o gerador de partidas em `src/data/worldCupData.js` para usar a rotação oficial de dias do torneio (Fase de grupos de 11 a 27 de Junho de 2026).
   - Inseridas as datas, horários e dias da semana oficiais (Brasília) de estreia do Brasil:
     - **Brasil x Marrocos:** 13/06 (Sábado) às 19:00
     - **Brasil x Haiti:** 19/06 (Sexta-feira) às 21:30
     - **Escócia x Brasil:** 24/06 (Quarta-feira) às 19:00 (Simultâneo)
   - Adicionado um cap automático (`Math.min(day, 27)`) para garantir que nenhum jogo da fase de grupos ultrapasse o dia 27 de Junho.

3. **Validação de Estado Local (Prevenção de Crash):**
   - Adicionada uma verificação de integridade no helper client-side `loadLocalState()` em `src/pages/index.astro`.
   - Caso o navegador tente carregar palpites salvos no `localStorage` de versões anteriores que continham IDs de seleções deletadas (como `CL` para Chile ou `HN` para Honduras), o script detecta a incompatibilidade de dados, limpa o estado desatualizado de forma segura e reinicia com o novo mapa oficial sem quebrar a renderização da página.

4. **Página de Jogos do Brasil (`/jogos-do-brasil-copa-2026`):**
   - Atualizados os textos de metadados, títulos e o filtro de consulta para o **Grupo C** para refletir o novo grupo oficial da Seleção Brasileira de forma 100% dinâmica.

### Arquivos alterados nesta prioridade
- `src/data/worldCupData.js` (atualização de seleções, grupos, jogadores e datas de jogos)
- `src/pages/index.astro` (sanitização de dados carregados do localStorage)
- `src/pages/jogos-do-brasil-copa-2026.astro` (referências e metadados atualizados para o Grupo C)
- `brain.md` (documentação de controle de versão)

### Validação Técnica
- Executado `npm run build` confirmando que todas as rotas estáticas (incluindo as rotas dinâmicas `/grupo-[a-l]-copa-2026`) geraram corretamente sem erros de compilação ou referências undefined.

---

## Atualizacao Prioridade 9 - Auditoria Geral de Dados e Alinhamento FIFA 2026

**Status:** Concluído e verificado em build time.

### Ajustes Realizados
1. **Auditoria Automática (`validateWorldCupData`):**
   - Implementada função de validação automatizada que confere quantidade de seleções (48), grupos (12), partidas (72), confrontos válidos, chaves de times corretas, datas no ano de 2026, além de estádios e cidades preenchidos para todos os 72 jogos.
   - A validação é disparada a cada build, interrompendo o processo e gerando erro caso alguma inconsistência seja identificada.

2. **Cálculo Dinâmico dos Dias da Semana (`getWeekDay`):**
   - Desenvolvido o helper `getWeekDay(date)` para calcular dinamicamente o nome por extenso dos dias da semana (ex: Quinta-feira, Sexta-feira, Sábado) com base em objetos Date do JavaScript utilizando fuso horário UTC (evitando quaisquer deslocamentos de fuso local).

3. **Cidades e Estádios (Fixture Metadata):**
   - Mapeados e atribuídos os 16 estádios oficiais em suas respectivas cidades nos EUA, México e Canadá em cada um dos 72 confrontos.
   - Adicionada a exibição do local do jogo ("🏟️ Nome do Estádio, Cidade") abaixo do horário nas tabelas de jogos da Home, das páginas de grupos individuais (`SeoGroupPage`) e na página dos jogos do Brasil.

4. **Padronização de Nomes:**
   - Corrigido o nome abreviado `"Bósnia e Hering."` para o oficial `"Bósnia e Herzegovina"`, garantindo maior credibilidade.

5. **Renomeação de Cabeçalho e Ajustes de SEO:**
   - Atualizado o título no badge do cabeçalho da Home para `"United States • Canada • Mexico 2026"`.
   - Modificados os metadados de layout da Home e das páginas dinâmicas para o título oficial `"Simulador da Copa do Mundo FIFA 2026"` e descrição atualizada.

### Arquivos alterados/criados nesta prioridade
- `src/data/worldCupData.js` (helper getWeekDay, validateWorldCupData, estádios/cidades)
- `src/pages/index.astro` (ajustes do cabeçalho, meta tags, exibição do estádio/cidade e trigger da validação)
- `src/components/SeoGroupPage.astro` (exibição de estádio/cidade, ajuste da logo-badge)
- `src/pages/jogos-do-brasil-copa-2026.astro` (exibição de estádio/cidade, layout e meta tags)
- `src/data/seoGroups.js` (templates SEO atualizados para o padrão FIFA)
- `brain.md` (registro de histórico)

### Validação Técnica e Relatório de Auditoria
- **Grupos Validados:** 12
- **Seleções Validadas:** 48
- **Jogos Validados:** 72
- **Inconsistências encontradas:** 0
- **Status da Compilação:** Sucesso (Astro build concluído sem avisos ou erros).

---

## Atualizacao Adicional — Funcionalidade Limpar Palpites

**Status:** Implementado e commitado.

### Ajustes Realizados
1. **Botão "Limpar Palpites":**
   - Adicionado um botão "🗑️ Limpar Palpites" na área de ações, ao lado da Simulação Rápida.
   - Criada funcionalidade no client-side para limpar os `localStorage` (`sim_matches`, `sim_bracket`, `sim_scorers`) mediante confirmação do usuário.
   - Reflete a limpeza instantaneamente nos placares visuais e recarrega a página para reiniciar o simulador ao seu estado original de forma limpa.

### Arquivos alterados nesta funcionalidade
- `src/pages/index.astro` (layout do botão e lógica JS)
- `src/styles/global.css` (estilização do botão com vermelho neon)
- `brain.md` (documentação)

### Validação
- Testado manualmente, botão possui alert de confirmação e as chaves de storage são excluídas corretamente.

---

## Atualizacao Fase 2 (Concluída) — Sincronização Automática de Placares Reais e UX

**Status:** Implementado, Validado e Publicado (Deploy Automático via Vercel).

### Sincronização Oficial de Jogos (football-data.org)
- [x] **Banco de Dados (Supabase):** Criada a tabela `resultados_reais` via script SQL para armazenar o ID do jogo, placar (Home x Away) e status oficial da partida (`IN_PLAY`, `FINISHED`).
- [x] **Script de Sincronização (`sync-results.js`):** Script em Node (ESM) desenvolvido para bater na API oficial (football-data.org), obter dados atualizados, mapear os IDs de times reais para os IDs internos do simulador, corrigir o posicionamento Home/Away dos placares e atualizar a tabela no Supabase via `upsert`.
- [x] **Automação Completa (GitHub Actions):** Criado o workflow `.github/workflows/sync-results.yml` para disparar a sincronização automaticamente a cada 15 minutos sem a necessidade de instâncias de servidor ligadas.
- [x] **Bloqueio Automático de Jogos Concluídos:** A engine do client-side (no `index.astro`) consulta a base de dados via `fetch` ao inicializar. Para todo jogo com status de "finalizado", os selects interativos de placar são trocados nativamente por um painel de visualização estática com o selo "✅ Oficial". Os pontos e o mata-mata do site inteiro reagem a isso.
- [x] **Feedback Gamificado (Gatilho de Retenção):** Antes do script sobrepor os placares com os oficiais, ele lê o palpite antigo salvo no dispositivo do usuário e compara. Se o usuário cravou o placar, mostra um banner verde neon. Se acertou o vencedor, um banner dourado. Se errou (zebra), um banner vermelho. Isso gera um loop forte de engajamento emocional a cada jogo real.

### Onboarding e Experiência do Usuário (UX)
- [x] **Manual Amigável (Welcome Carousel):** Desenvolvido um modal responsivo no formato de "Stories" (Glassmorphism e CSS vanilla puro) para educar visitantes de primeira viagem sobre as três principais funções do simulador.
  - Slide 1: Simule a Copa (preenchimento manual e mata-mata automático).
  - Slide 2: Bolão com Amigos (integração social e ranking).
  - Slide 3: Placares Oficiais (sincronização automática em tempo real).
- [x] **Persistência de UX:** O estado de visualização do onboarding é gravado em `localStorage` (`hasSeenWelcome`) para evitar interrupções repetitivas no fluxo do usuário.

### Viralização e Crescimento Avançado
- [x] **OG Image Dinâmica na Vercel Edge (`@vercel/og`):** Criada uma rota Serverless (`/api/og/[slug].js`) que intercepta requisições de crawlers (WhatsApp, Twitter, Facebook). Ela busca a simulação no Supabase via o `slug` fornecido, recupera o nome do criador e o Campeão escolhido, e renderiza instantaneamente uma imagem PNG usando Satori. Isso melhora drasticamente o CTR dos links compartilhados.

### Arquivos alterados/criados nesta prioridade
- `scripts/sync-results.js` (Lógica de integração com a API esportiva)
- `scripts/create_resultados_reais.sql` (Schema de gravação)
- `.github/workflows/sync-results.yml` (Automação programada cron job)
- `src/pages/index.astro` (Componente visual do Modal Welcome, integração via fetch do Supabase e manipulação de interface nativa)
- `src/pages/api/og/[slug].js` (Geração de imagem serverless Satori/React JSX no edge)
- `src/pages/palpite/[slug].astro` (Atualização da meta tag de imagem)
- `src/styles/global.css` (Transições e estilização para o carousel)
- `brain.md` (Atualização do documento vivo)
