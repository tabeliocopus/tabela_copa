// sync-results.js - Sincroniza placares da Copa 2026 via api-football.com
// Usa o endpoint /fixtures com league=1 (World Cup) e season=2026

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const SUPABASE_URL     = process.env.SUPABASE_URL     || 'https://lxmzkemrtbdburygyjxj.supabase.co';
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

const WC_LEAGUE_ID = 1;
const WC_SEASON    = 2026;

// ─── MAPEAMENTO: nome do país (api-football) → nosso teamId interno ────────
const COUNTRY_TO_CODE = {
  'Mexico': 'MX', 'South Africa': 'ZA', 'South Korea': 'KR', 'Czech Republic': 'CZ',
  'Canada': 'CA', 'Bosnia And Herzegovina': 'BA', 'Bosnia and Herzegovina': 'BA',
  'Qatar': 'QA', 'Switzerland': 'CH',
  'Brazil': 'BR', 'Morocco': 'MA', 'Haiti': 'HT', 'Scotland': 'GB-SCT',
  'USA': 'US', 'United States': 'US', 'Paraguay': 'PY', 'Australia': 'AU', 'Turkey': 'TR',
  'Germany': 'DE', 'Curacao': 'CW', 'Curaçao': 'CW',
  'Ivory Coast': 'CI', 'Cote D\'Ivoire': 'CI', 'Côte d\'Ivoire': 'CI',
  'Ecuador': 'EC',
  'Netherlands': 'NL', 'Japan': 'JP', 'Sweden': 'SE', 'Tunisia': 'TN',
  'Belgium': 'BE', 'Egypt': 'EG', 'Iran': 'IR', 'New Zealand': 'NZ',
  'Cape Verde': 'CV', 'Cabo Verde': 'CV', 'Saudi Arabia': 'SA',
  'Spain': 'ES', 'Uruguay': 'UY',
  'France': 'FR', 'Senegal': 'SN', 'Iraq': 'IQ', 'Norway': 'NO',
  'Argentina': 'AR', 'Algeria': 'DZ', 'Austria': 'AT', 'Jordan': 'JO',
  'Portugal': 'PT', 'DR Congo': 'CD', 'Congo DR': 'CD',
  'England': 'GB-ENG', 'Croatia': 'HR',
  'Ghana': 'GH', 'Panama': 'PA', 'Uzbekistan': 'UZ', 'Colombia': 'CO',
};

// ─── MAPEAMENTO: grupo + times → nosso matchId interno ─────────────────────
// Par de teamIds (sempre ordenado alfabeticamente) → matchId
const GROUP_TEAMS = {
  A: ['MX', 'ZA', 'KR', 'CZ'],
  B: ['CA', 'BA', 'QA', 'CH'],
  C: ['BR', 'MA', 'HT', 'GB-SCT'],
  D: ['US', 'PY', 'AU', 'TR'],
  E: ['DE', 'CW', 'CI', 'EC'],
  F: ['NL', 'JP', 'SE', 'TN'],
  G: ['BE', 'EG', 'IR', 'NZ'],
  H: ['CV', 'SA', 'ES', 'UY'],
  I: ['FR', 'IQ', 'NO', 'SN'],
  J: ['DZ', 'AR', 'AT', 'JO'],
  K: ['CO', 'CD', 'PT', 'UZ'],
  L: ['HR', 'GB-ENG', 'GH', 'PA'],
};

const MATCH_PAIR_TO_ID = {};
Object.keys(GROUP_TEAMS).forEach(g => {
  const [t1, t2, t3, t4] = GROUP_TEAMS[g];
  const pairings = [
    [t1, t2, `${g}_M1`], [t3, t4, `${g}_M2`],
    [t1, t3, `${g}_M3`], [t2, t4, `${g}_M4`],
    [t1, t4, `${g}_M5`], [t2, t3, `${g}_M6`],
  ];
  pairings.forEach(([ta, tb, mid]) => {
    const key = [ta, tb].sort().join('|');
    MATCH_PAIR_TO_ID[key] = { matchId: mid, homeId: ta, awayId: tb };
  });
});

// ─── HELPERS ───────────────────────────────────────────────────────────────
async function apiFootballGet(endpoint, params = {}) {
  const url = new URL(`https://v3.football.api-sports.io/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API-Football error ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

async function supabaseUpsert(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/resultados_reais`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer':        'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  return { status: res.status, body: await res.text() };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function syncResults() {
  console.log('🔄 Sincronizando resultados da Copa 2026 (api-football.com)...\n');

  if (!API_FOOTBALL_KEY) {
    console.error('❌ API_FOOTBALL_KEY não configurada!');
    console.log('   Configure via: set API_FOOTBALL_KEY=sua_chave');
    process.exit(1);
  }

  if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY não configurada!');
    process.exit(1);
  }

  // 1. Busca todos os jogos da Copa do Mundo
  const apiData = await apiFootballGet('fixtures', {
    league: WC_LEAGUE_ID,
    season: WC_SEASON
  });

  const fixtures = apiData.response || [];
  
  // Na api-football, status 'FT' = finalizado, 'AET' = prorrogacao finalizada, 'PEN' = penaltis finalizado
  // '1H', '2H', 'HT' = in play
  const validStatuses = ['FT', 'AET', 'PEN', '1H', '2H', 'HT', 'ET', 'P'];
  
  const relevantFixtures = fixtures.filter(f => validStatuses.includes(f.fixture.status.short));
  
  console.log(`📡 API retornou ${fixtures.length} jogos, sendo ${relevantFixtures.length} em andamento ou finalizados.\n`);

  // 2. Mapeia cada jogo para nosso matchId
  const toSync = [];
  
  for (const f of relevantFixtures) {
    const homeName = f.teams.home.name;
    const awayName = f.teams.away.name;
    const homeId  = COUNTRY_TO_CODE[homeName];
    const awayId  = COUNTRY_TO_CODE[awayName];

    if (!homeId || !awayId) {
      // Ignora times não mapeados (pode ser mata-mata ainda indefinido)
      continue;
    }

    const key = [homeId, awayId].sort().join('|');
    const info = MATCH_PAIR_TO_ID[key];

    if (!info) {
      // Pode ser jogo de mata-mata real (que não mapeamos no MATCH_PAIR_TO_ID)
      continue;
    }

    const scoreHome = f.goals.home !== null ? f.goals.home : 0;
    const scoreAway = f.goals.away !== null ? f.goals.away : 0;
    
    let finalHomeScore, finalAwayScore;

    if (homeId === info.homeId) {
      finalHomeScore = scoreHome;
      finalAwayScore = scoreAway;
    } else {
      finalHomeScore = scoreAway;
      finalAwayScore = scoreHome;
    }

    const isFinished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short);

    toSync.push({
      match_id:   info.matchId,
      home_score: finalHomeScore,
      away_score: finalAwayScore,
      status:     isFinished ? 'FINISHED' : 'IN_PLAY',
    });

    console.log(`  ✅ ${info.matchId}: ${homeName} ${scoreHome}x${scoreAway} ${awayName} → [${info.matchId}] ${finalHomeScore}x${finalAwayScore} (${isFinished ? 'FINISHED' : 'IN_PLAY'})`);
  }

  if (toSync.length === 0) {
    console.log('\nℹ️  Nenhum jogo relevante para sincronizar.');
    return;
  }

  console.log(`\n📥 Enviando ${toSync.length} resultado(s) para o Supabase...`);

  // 3. Upsert em lotes no Supabase
  const res = await supabaseUpsert(toSync);

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
