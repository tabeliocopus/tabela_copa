// sync-scorers.js - Sincroniza artilheiros da Copa 2026 via football-data.org
// Usa o endpoint /competitions/WC/scorers

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
  'IRN': 'IR', 'NZL': 'NZ', 'KSA': 'SA', 'URY': 'UY',
  'FRA': 'FR', 'SEN': 'SN', 'IRQ': 'IQ', 'NOR': 'NO',
  'ARG': 'AR', 'ALG': 'DZ', 'AUT': 'AT', 'JOR': 'JO',
  'POR': 'PT', 'COD': 'CD', 'ENG': 'GB-ENG', 'CRO': 'HR',
  'GHA': 'GH', 'PAN': 'PA', 'UZB': 'UZ', 'COL': 'CO',
};

// ─── HELPERS ───────────────────────────────────────────────────────────────
async function apiGet(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
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
  console.log('⚽ Sincronizando artilheiros da Copa 2026 (football-data.org)...\n');

  if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY não configurada!');
    process.exit(1);
  }

  // 1. Buscar top scorers da Copa do Mundo
  console.log(`📡 Buscando top scorers da API...`);

  const data = await apiGet(
    'https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=20',
    { 'X-Auth-Token': FOOTBALL_TOKEN }
  );

  const players = data.scorers || [];
  console.log(`📊 API retornou ${players.length} artilheiro(s).\n`);

  if (players.length === 0) {
    console.log('ℹ️  Nenhum artilheiro disponível ainda (a competição pode não ter começado).');
    return;
  }

  // 2. Mapear para nosso formato
  const toSync = [];

  for (const entry of players) {
    const player = entry.player;
    const team = entry.team;

    if (!player || !team) continue;

    const teamTla = team.tla;
    const teamCode = TLA_TO_ID[teamTla] || teamTla.substring(0, 2);

    const row = {
      player_id:    player.id,
      player_name:  player.name,
      team_name:    team.name,
      team_code:    teamCode,
      team_logo:    team.crest || null,
      player_photo: null, // football-data org doesn't usually provide player photos
      goals:        entry.goals || 0,
      assists:      entry.assists || 0,
      penalties:    entry.penalties || 0,
      games:        entry.playedMatches || 0,
      updated_at:   new Date().toISOString(),
    };

    toSync.push(row);

    const medal = toSync.length <= 3 ? ['🥇','🥈','🥉'][toSync.length - 1] : `  ${toSync.length}.`;
    console.log(`  ${medal} ${player.name} (${team.name}) — ${row.goals} gol(s), ${row.assists} assist(s)`);
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
