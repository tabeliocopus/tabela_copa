// sync-results.js - ESM compatible (Node 18+)

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
  'IRN': 'IR', 'NZL': 'NZ', 'KSA': 'SA', 'URU': 'UY',
  'FRA': 'FR', 'SEN': 'SN', 'IRQ': 'IQ', 'NOR': 'NO',
  'ARG': 'AR', 'ALG': 'DZ', 'AUT': 'AT', 'JOR': 'JO',
  'POR': 'PT', 'COD': 'CD', 'ENG': 'GB-ENG', 'CRO': 'HR',
  'GHA': 'GH', 'PAN': 'PA', 'UZB': 'UZ', 'COL': 'CO',
  'CON': 'CD', // fallback alternativo para Congo
};

// ─── MAPEAMENTO: grupo + times → nosso matchId interno ─────────────────────
// Par de teamIds (sempre ordenado alfabeticamente) → matchId
// Estrutura de cada grupo (T1, T2, T3, T4 seguindo a ordem em worldCupData.js):
// M1: T1xT2, M2: T3xT4, M3: T1xT3, M4: T2xT4, M5: T1xT4, M6: T2xT3
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

// Constrói o mapa: "T1|T2" (sorted) → "X_MY" para todos os grupos
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

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function syncResults() {
  console.log('🔄 Sincronizando resultados da Copa 2026...\n');

  if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY não configurada!');
    console.log('   Configure via: set SUPABASE_SERVICE_KEY=sua_chave');
    process.exit(1);
  }

  // 1. Busca todos os jogos da fase de grupos na API
  const apiData = await apiGet(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026&stage=GROUP_STAGE',
    { 'X-Auth-Token': FOOTBALL_TOKEN }
  );

  const matches = apiData.matches || [];
  const finished = matches.filter(m => 
    m.status === 'FINISHED' || 
    m.status === 'IN_PLAY' || 
    m.status === 'PAUSED'   // Intervalo do jogo
  );
  
  console.log(`📡 API retornou ${matches.length} jogos, sendo ${finished.length} finalizados.\n`);

  // 2. Mapeia cada jogo finalizado para nosso matchId
  const toSync = [];
  
  for (const m of finished) {
    const homeTla = m.homeTeam.tla;
    const awayTla = m.awayTeam.tla;
    const homeId  = TLA_TO_ID[homeTla];
    const awayId  = TLA_TO_ID[awayTla];

    if (!homeId || !awayId) {
      console.warn(`⚠️  TLA não mapeado: ${homeTla} ou ${awayTla}`);
      continue;
    }

    const key = [homeId, awayId].sort().join('|');
    const info = MATCH_PAIR_TO_ID[key];

    if (!info) {
      console.warn(`⚠️  Par não encontrado no mapa: ${homeId} | ${awayId}`);
      continue;
    }

    // Determina placar na orientação correta (home/away do nosso sistema)
    // Nossa definição de "home" é sempre T1 na ordem do worldCupData.js
    const score = m.score.fullTime;
    let homeScore, awayScore;

    if (homeId === info.homeId) {
      // Mesma orientação que a API
      homeScore = score.home;
      awayScore = score.away;
    } else {
      // Orientação invertida — swap
      homeScore = score.away;
      awayScore = score.home;
    }

    toSync.push({
      match_id:   info.matchId,
      home_score: homeScore,
      away_score: awayScore,
      status:     m.status, // FINISHED, IN_PLAY ou PAUSED
    });

    console.log(`  ✅ ${info.matchId}: ${homeTla} ${score.home}x${score.away} ${awayTla} → [${info.matchId}] ${homeScore}x${awayScore}`);
  }

  if (toSync.length === 0) {
    console.log('\nℹ️  Nenhum jogo finalizado para sincronizar.');
    return;
  }

  console.log(`\n📥 Enviando ${toSync.length} resultado(s) para o Supabase...`);

  // 3. Upsert em lotes no Supabase
  const res = await supabaseUpsert(SUPABASE_URL, SUPABASE_KEY, toSync);

  if (res.status >= 200 && res.status < 300) {
    console.log(`\n🎉 Sincronização concluída! ${toSync.length} resultado(s) salvos.\n`);
  } else {
    console.error(`\n❌ Erro Supabase (status ${res.status}): ${res.body}`);
  }
}

syncResults().catch(err => {
  console.error('💥 Erro fatal:', err.message);
  process.exit(1);
});
