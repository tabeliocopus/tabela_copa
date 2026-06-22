// sync-results.js - ESM compatible (Node 18+)
import { teams, groups, generateMatches } from '../src/data/worldCupData.js';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const FOOTBALL_TOKEN = process.env.FOOTBALL_DATA_TOKEN || '738986c2808c4be681f13d3c3f54c81b';
const SUPABASE_URL   = process.env.SUPABASE_URL        || 'https://lxmzkemrtbdburygyjxj.supabase.co';
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

// ─── MAPEAMENTO: TLA da API → nosso teamId interno ─────────────────────────
const TLA_TO_ID = {
  'MEX': 'MX', 'RSA': 'ZA', 'KOR': 'KR', 'CZE': 'CZ',
  'CAN': 'CA', 'BIH': 'BA', 'QAT': 'QA', 'SUI': 'CH',
  'BRA': 'BR', 'MAR': 'MA', 'HAI': 'HT', 'SCO': 'GB-SCT',
  'USA': 'US', 'PAR': 'PY', 'AUS': 'AU', 'TUR': 'TR',
  'GER': 'DE', 'CUW': 'CW', 'CIV': 'CI', 'ECU': 'EC',
  'NED': 'NL', 'JPN': 'JP', 'SWE': 'SE', 'TUN': 'TN',
  'ESP': 'ES', 'CPV': 'CV', 'BEL': 'BE', 'EGY': 'EG',
  'IRN': 'IR', 'NZL': 'NZ', 'KSA': 'SA', 'URU': 'UY', 'CUR': 'CW',
  'FRA': 'FR', 'SEN': 'SN', 'IRQ': 'IQ', 'NOR': 'NO',
  'ARG': 'AR', 'ALG': 'DZ', 'AUT': 'AT', 'JOR': 'JO',
  'POR': 'PT', 'COD': 'CD', 'ENG': 'GB-ENG', 'CRO': 'HR',
  'GHA': 'GH', 'PAN': 'PA', 'UZB': 'UZ', 'COL': 'CO',
  'CON': 'CD', 'SAU': 'SA', 'URY': 'UY',
};

// ─── MAPEAMENTO: grupo + times → nosso matchId interno ─────────────────────
const GROUP_TEAMS = {
  A: ['MX', 'ZA', 'KR', 'CZ'],
  B: ['CA', 'BA', 'QA', 'CH'],
  C: ['BR', 'MA', 'HT', 'GB-SCT'],
  D: ['US', 'PY', 'AU', 'TR'],
  E: ['DE', 'CW', 'CI', 'EC'],
  F: ['NL', 'JP', 'SE', 'TN'],
  G: ['BE', 'EG', 'IR', 'NZ'],
  H: ['ES', 'CV', 'SA', 'UY'],
  I: ['FR', 'SN', 'IQ', 'NO'],
  J: ['AR', 'DZ', 'AT', 'JO'],
  K: ['PT', 'CD', 'UZ', 'CO'],
  L: ['GB-ENG', 'HR', 'GH', 'PA'],
};

// Constrói o mapa de grupos: "T1|T2" (sorted) → matchId
const MATCH_PAIR_TO_ID = {};
Object.keys(GROUP_TEAMS).forEach(g => {
  const [t1, t2, t3, t4] = GROUP_TEAMS[g];
  const pairings = [
    [t1, t2, `${g}_M1`], [t3, t4, `${g}_M2`],
    [t4, t2, `${g}_M3`], [t1, t3, `${g}_M4`],
    [t4, t1, `${g}_M5`], [t2, t3, `${g}_M6`],
  ];
  pairings.forEach(([ta, tb, mid]) => {
    const key = [ta, tb].sort().join('|');
    MATCH_PAIR_TO_ID[key] = { matchId: mid, homeId: ta, awayId: tb };
  });
});

// ─── HELPERS ───────────────────────────────────────────────────────────────
async function apiGet(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function supabaseUpsert(url, key, rows) {
  const res = await fetch(`${url}/rest/v1/resultados_reais`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        key,
      'Authorization': `Bearer ${key}`,
      'Prefer':        'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  return { status: res.status, body: await res.text() };
}

// Helper to determine winner
function getMatchWinner(match) {
  if (!match || match.homeId === null || match.awayId === null) return null;
  if (match.homeScore === null || match.awayScore === null) return null;
  if (match.homeScore > match.awayScore) return match.homeId;
  if (match.homeScore < match.awayScore) return match.awayId;
  return match.homeId; // Empate favorece home por padrão
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function syncResults() {
  console.log('🔄 Iniciando sincronização completa da Copa 2026...\n');

  if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY não configurada!');
    console.log('   Configure via: set SUPABASE_SERVICE_KEY=sua_chave');
    process.exit(1);
  }

  // 1. Busca todos os jogos do torneio na API (sem filtro de stage para vir mata-mata também)
  const apiData = await apiGet(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    { 'X-Auth-Token': FOOTBALL_TOKEN }
  );

  const apiMatches = apiData.matches || [];
  const finishedOrLive = apiMatches.filter(m => 
    m.status === 'FINISHED' || 
    m.status === 'IN_PLAY' || 
    m.status === 'PAUSED'
  );
  
  console.log(`📡 API retornou ${apiMatches.length} jogos no total, sendo ${finishedOrLive.length} finalizados/ao vivo.\n`);

  // Local state para classificação e chaveamento
  const localMatches = generateMatches(); // lista padrão de 72 jogos de grupos
  const toSync = [];

  // 2. Mapeamento da FASE DE GRUPOS
  const apiGroupMatches = finishedOrLive.filter(m => m.stage === 'GROUP_STAGE');
  for (const m of apiGroupMatches) {
    const homeTla = m.homeTeam.tla;
    const awayTla = m.awayTeam.tla;
    const homeId  = TLA_TO_ID[homeTla];
    const awayId  = TLA_TO_ID[awayTla];

    if (!homeId || !awayId) {
      console.warn(`⚠️  TLA não mapeado no grupo: ${homeTla} ou ${awayTla}`);
      continue;
    }

    const key = [homeId, awayId].sort().join('|');
    const info = MATCH_PAIR_TO_ID[key];

    if (!info) {
      console.warn(`⚠️  Par de grupo não encontrado no mapa: ${homeId} | ${awayId}`);
      continue;
    }

    const score = m.score.fullTime;
    let homeScore, awayScore;

    if (homeId === info.homeId) {
      homeScore = score.home;
      awayScore = score.away;
    } else {
      homeScore = score.away;
      awayScore = score.home;
    }

    toSync.push({
      match_id:   info.matchId,
      home_score: homeScore,
      away_score: awayScore,
      status:     m.status,
    });

    // Atualiza o localMatches para calcular a classificação correta
    const matchRef = localMatches.find(x => x.id === info.matchId);
    if (matchRef) {
      matchRef.homeScore = homeScore;
      matchRef.awayScore = awayScore;
    }
  }

  // 3. CALCULAR CLASSIFICAÇÃO DOS GRUPOS E MONTAR O CHAVEAMENTO MATA-MATA
  const groupWinners = [];
  const groupRunnersUp = [];
  const groupThirds = [];

  groups.forEach(groupLetter => {
    const groupTeams = Object.keys(teams)
      .filter(key => teams[key].group === groupLetter)
      .map(key => ({
        id: key,
        name: teams[key].name,
        pts: 0, gd: 0, gf: 0, ga: 0, w: 0
      }));

    const groupMatches = localMatches.filter(m => m.group === groupLetter);
    groupMatches.forEach(m => {
      if (m.homeScore !== null && m.awayScore !== null) {
        const home = groupTeams.find(t => t.id === m.homeId);
        const away = groupTeams.find(t => t.id === m.awayId);
        
        if (home && away) {
          home.gf += m.homeScore;
          home.ga += m.awayScore;
          away.gf += m.awayScore;
          away.ga += m.homeScore;

          if (m.homeScore > m.awayScore) { home.pts += 3; home.w += 1; }
          else if (m.homeScore < m.awayScore) { away.pts += 3; away.w += 1; }
          else { home.pts += 1; away.pts += 1; }
        }
      }
    });

    groupTeams.forEach(t => t.gd = t.gf - t.ga);

    groupTeams.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });

    groupWinners.push(groupTeams[0]);
    groupRunnersUp.push(groupTeams[1]);
    groupThirds.push(groupTeams[2]);
  });

  groupThirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  const bestThirds = groupThirds.slice(0, 8);
  
  const pairings = [
    { home: groupWinners[0], away: bestThirds[0] }, // R32_M1
    { home: groupWinners[1], away: bestThirds[1] }, // R32_M2
    { home: groupWinners[2], away: bestThirds[2] }, // R32_M3
    { home: groupWinners[3], away: bestThirds[3] }, // R32_M4
    { home: groupWinners[4], away: bestThirds[4] }, // R32_M5
    { home: groupWinners[5], away: bestThirds[5] }, // R32_M6
    { home: groupWinners[6], away: bestThirds[6] }, // R32_M7
    { home: groupWinners[7], away: bestThirds[7] }, // R32_M8
    { home: groupWinners[8], away: groupRunnersUp[0] }, // R32_M9
    { home: groupWinners[9], away: groupRunnersUp[1] }, // R32_M10
    { home: groupWinners[10], away: groupRunnersUp[2] }, // R32_M11
    { home: groupWinners[11], away: groupRunnersUp[3] }, // R32_M12
    { home: groupRunnersUp[4], away: groupRunnersUp[5] }, // R32_M13
    { home: groupRunnersUp[6], away: groupRunnersUp[7] }, // R32_M14
    { home: groupRunnersUp[8], away: groupRunnersUp[9] }, // R32_M15
    { home: groupRunnersUp[10], away: groupRunnersUp[11] } // R32_M16
  ];

  // Chaveamento dinâmico local de 31 posições
  const bracket = Array.from({ length: 31 }, () => ({
    homeId: null, awayId: null, homeScore: null, awayScore: null, isFinished: false, isInPlay: false
  }));

  for (let i = 0; i < 16; i++) {
    bracket[i].homeId = pairings[i].home ? pairings[i].home.id : null;
    bracket[i].awayId = pairings[i].away ? pairings[i].away.id : null;
  }

  // 4. MAPEAR E PROCESSAR CADA FASE DE MATA-MATA DA API
  const apiKnockouts = finishedOrLive.filter(m => m.stage !== 'GROUP_STAGE');

  // Helper para buscar jogo da API entre duas seleções específicas
  function findApiKnockoutMatch(stageName, t1, t2) {
    if (!t1 || !t2) return null;
    return apiKnockouts.find(m => {
      if (m.stage !== stageName) return false;
      const homeTla = m.homeTeam?.tla;
      const awayTla = m.awayTeam?.tla;
      const apiH = TLA_TO_ID[homeTla];
      const apiA = TLA_TO_ID[awayTla];
      return (apiH === t1 && apiA === t2) || (apiH === t2 && apiA === t1);
    });
  }

  // Helper para sincronizar e propagar rodada
  function processRound(startIndex, count, apiStageName, dbPrefix, nextIndexOffset) {
    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      const slot = bracket[idx];
      if (!slot.homeId || !slot.awayId) continue;

      const apiMatch = findApiKnockoutMatch(apiStageName, slot.homeId, slot.awayId);
      if (apiMatch) {
        const homeTla = apiMatch.homeTeam.tla;
        const apiHomeId = TLA_TO_ID[homeTla];
        const fullTimeScore = apiMatch.score.fullTime;

        let homeScore, awayScore;
        // Alinha os placares com a orientação do nosso bracket
        if (apiHomeId === slot.homeId) {
          homeScore = fullTimeScore.home;
          awayScore = fullTimeScore.away;
        } else {
          homeScore = fullTimeScore.away;
          awayScore = fullTimeScore.home;
        }

        const matchId = `${dbPrefix}_M${i + 1}`;
        toSync.push({
          match_id: matchId,
          home_score: homeScore,
          away_score: awayScore,
          status: apiMatch.status,
        });

        // Atualiza localmente para propagação de fases subsequentes
        slot.homeScore = homeScore;
        slot.awayScore = awayScore;
        slot.isFinished = (apiMatch.status === 'FINISHED');

        console.log(`  🏆 [${dbPrefix}] ${slot.homeId} ${homeScore}x${awayScore} ${slot.awayId} → [${matchId}]`);
      }

      // Propaga o vencedor para a próxima fase na memória local
      if (nextIndexOffset !== null) {
        const winner = getMatchWinner(slot);
        const nextIdx = nextIndexOffset + Math.floor(i / 2);
        const isHomeInNext = (i % 2 === 0);

        if (isHomeInNext) {
          bracket[nextIdx].homeId = winner;
        } else {
          bracket[nextIdx].awayId = winner;
        }
      }
    }
  }

  // 1. Processar Rodada de 32 (Slots 0 a 15) -> Propaga para Oitavas (Slots 16 a 23)
  console.log('⚙️ Processando Rodada de 32...');
  processRound(0, 16, 'LAST_32', 'R32', 16);

  // 2. Processar Rodada de 16 / Oitavas (Slots 16 a 23) -> Propaga para Quartas (Slots 24 a 27)
  console.log('⚙️ Processando Oitavas de Final...');
  // O football-data.org pode usar LAST_16 ou ROUND_OF_16. Vamos checar os matches para garantir
  const hasLast16 = apiKnockouts.some(m => m.stage === 'LAST_16');
  const stage16Name = hasLast16 ? 'LAST_16' : 'ROUND_OF_16';
  processRound(16, 8, stage16Name, 'R16', 24);

  // 3. Processar Quartas de Final (Slots 24 a 27) -> Propaga para Semifinais (Slots 28 a 29)
  console.log('⚙️ Processando Quartas de Final...');
  processRound(24, 4, 'QUARTER_FINALS', 'QF', 28);

  // 4. Processar Semifinais (Slots 28 a 29) -> Propaga para Grande Final (Slot 30)
  console.log('⚙️ Processando Semifinais...');
  processRound(28, 2, 'SEMI_FINALS', 'SF', 30);

  // 5. Processar Grande Final (Slot 30, FNL_M1) -> Determina Campeão
  console.log('⚙️ Processando Grande Final...');
  processRound(30, 1, 'FINAL', 'FNL', null);

  // 6. UPSERT NO SUPABASE
  if (toSync.length === 0) {
    console.log('\nℹ️  Nenhum jogo finalizado ou ao vivo para sincronizar.');
    return;
  }

  console.log(`\n📥 Enviando ${toSync.length} resultado(s) totais para o Supabase...`);
  const res = await supabaseUpsert(SUPABASE_URL, SUPABASE_KEY, toSync);

  if (res.status >= 200 && res.status < 300) {
    console.log(`\n🎉 Sincronização concluída com sucesso! ${toSync.length} resultado(s) salvos.\n`);
  } else {
    console.error(`\n❌ Erro Supabase (status ${res.status}): ${res.body}`);
  }
}

syncResults().catch(err => {
  console.error('💥 Erro fatal no script:', err.message);
  process.exit(1);
});
