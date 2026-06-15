// sync-scorers.js - Sincroniza artilheiros da Copa 2026 via api-football.com
// Usa o endpoint /players/topscorers com league=1 (World Cup) e season=2026

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const SUPABASE_URL     = process.env.SUPABASE_URL     || 'https://lxmzkemrtbdburygyjxj.supabase.co';
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

const WC_LEAGUE_ID = 1;    // FIFA World Cup na api-football.com
const WC_SEASON    = 2026;

// ─── MAPEAMENTO: nome do país (api-football) → código de bandeira (nosso sistema) ──
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

  // Verificar erros da API
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

async function supabaseUpsert(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/artilheiros_reais`, {
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
async function syncScorers() {
  console.log('⚽ Sincronizando artilheiros da Copa 2026 (api-football.com)...\n');

  if (!API_FOOTBALL_KEY) {
    console.error('❌ API_FOOTBALL_KEY não configurada!');
    console.log('   Configure via: set API_FOOTBALL_KEY=sua_chave');
    console.log('   Obtenha em: https://dashboard.api-football.com');
    process.exit(1);
  }

  if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY não configurada!');
    process.exit(1);
  }

  // 1. Buscar top scorers da Copa do Mundo
  console.log(`📡 Buscando top scorers: league=${WC_LEAGUE_ID}, season=${WC_SEASON}...`);

  const data = await apiFootballGet('players/topscorers', {
    league: WC_LEAGUE_ID,
    season: WC_SEASON,
  });

  const players = data.response || [];
  console.log(`📊 API retornou ${players.length} artilheiro(s).\n`);

  if (players.length === 0) {
    console.log('ℹ️  Nenhum artilheiro disponível ainda (a competição pode não ter começado).');
    return;
  }

  // 2. Mapear para nosso formato
  const toSync = [];

  for (const entry of players) {
    const player = entry.player;
    const stats = entry.statistics?.[0]; // Estatísticas da Copa

    if (!player || !stats) continue;

    const teamName = stats.team?.name || 'Desconhecido';
    const countryName = teamName; // Na Copa, o time = seleção
    const teamCode = COUNTRY_TO_CODE[countryName] || countryName.substring(0, 2).toUpperCase();

    const row = {
      player_id:    player.id,
      player_name:  player.name,
      team_name:    teamName,
      team_code:    teamCode,
      team_logo:    stats.team?.logo || null,
      player_photo: player.photo || null,
      goals:        stats.goals?.total || 0,
      assists:      stats.goals?.assists || 0,
      penalties:    stats.penalty?.scored || 0,
      games:        stats.games?.appearences || 0,
      updated_at:   new Date().toISOString(),
    };

    toSync.push(row);

    const medal = toSync.length <= 3 ? ['🥇','🥈','🥉'][toSync.length - 1] : `  ${toSync.length}.`;
    console.log(`  ${medal} ${player.name} (${teamName}) — ${row.goals} gol(s), ${row.assists} assist(s)`);
  }

  if (toSync.length === 0) {
    console.log('\nℹ️  Nenhum dado válido para sincronizar.');
    return;
  }

  // 3. Upsert no Supabase
  console.log(`\n📥 Enviando ${toSync.length} artilheiro(s) para o Supabase...`);

  const res = await supabaseUpsert(toSync);

  if (res.status >= 200 && res.status < 300) {
    console.log(`\n🎉 Sincronização concluída! ${toSync.length} artilheiro(s) atualizados.\n`);
  } else {
    console.error(`\n❌ Erro Supabase (status ${res.status}): ${res.body}`);
  }
}

syncScorers().catch(err => {
  console.error('💥 Erro fatal:', err.message);
  process.exit(1);
});
