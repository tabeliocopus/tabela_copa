const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY precisam estar no ambiente.');
  process.exit(1);
}

const cleanUrl = supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const restUrl = `${cleanUrl}/rest/v1`;

const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

async function runStressTest() {
  console.log('--- INICIANDO SIMULAÇÃO E TESTE DE ESTRESSE ---');
  console.log('API Target:', restUrl);
  
  // 1. Verificar suporte a ref_code e tabela referrals
  console.log('Verificando suporte à coluna ref_code na tabela leads...');
  let hasRefCode = false;
  try {
    const testRes = await fetch(`${restUrl}/leads?select=ref_code&limit=1`, { headers });
    if (testRes.ok) {
      hasRefCode = true;
      console.log('✔ Coluna ref_code ativa no banco de dados!');
    } else {
      console.log('ℹ Coluna ref_code não encontrada ou inacessível. Omitindo no teste.');
    }
  } catch (err) {
    console.log('ℹ Erro ao checar ref_code, omitindo no teste.');
  }

  const startTime = Date.now();

  // 1. Criar 10.000 Leads (Simulacoes)
  console.log('\n1. Gerando 10.000 leads...');
  const leadsToInsert = [];
  for (let i = 0; i < 10000; i++) {
    const leadObj = {
      nome: `Stress User ${i}`,
      email: `stress_${i}_${Date.now()}@test.com`,
      whatsapp: `+551198888${String(i).padStart(4, '0')}`,
      simulacao_data: { champion: 'BR', runnerUp: 'FR' },
      url_compartilhamento: `http://localhost:4321/palpite/stress-${i}`
    };
    if (hasRefCode) {
      leadObj.ref_code = 'COPUS-' + generateRandomString(4);
    }
    leadsToInsert.push(leadObj);
  }

  console.log('Inserindo Leads em blocos de 1.000 (Bulk Insertion)...');
  const createdLeads = [];
  const leadBatchSize = 1000;
  for (let i = 0; i < leadsToInsert.length; i += leadBatchSize) {
    const batch = leadsToInsert.slice(i, i + leadBatchSize);
    const t0 = Date.now();
    try {
      const res = await fetch(`${restUrl}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify(batch)
      });
      if (!res.ok) {
        console.error(`Erro ao inserir lote de leads:`, await res.text());
        continue;
      }
      const data = await res.json();
      createdLeads.push(...data.map(l => l.id));
      const t1 = Date.now();
      console.log(`Lote ${i / leadBatchSize + 1}/10 inserido. Tempo: ${t1 - t0}ms. Total: ${createdLeads.length} leads.`);
    } catch (err) {
      console.error('Erro na requisição de leads:', err);
    }
  }

  if (createdLeads.length === 0) {
    console.error('Nenhum lead criado. Abortando teste.');
    return;
  }

  // 2. Criar 2.000 Grupos
  console.log('\n2. Gerando 2.000 grupos de bolão...');
  const groupsToInsert = [];
  for (let i = 0; i < 2000; i++) {
    const creatorId = createdLeads[Math.floor(Math.random() * createdLeads.length)];
    groupsToInsert.push({
      nome: `Grupo Stress ${i}`,
      codigo_acesso: `GRP-${generateRandomString(6)}`,
      criador_id: creatorId
    });
  }

  console.log('Inserindo Grupos em blocos de 500...');
  const createdGroups = [];
  const groupBatchSize = 500;
  for (let i = 0; i < groupsToInsert.length; i += groupBatchSize) {
    const batch = groupsToInsert.slice(i, i + groupBatchSize);
    const t0 = Date.now();
    try {
      const res = await fetch(`${restUrl}/grupos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(batch)
      });
      if (!res.ok) {
        console.error(`Erro ao inserir lote de grupos:`, await res.text());
        continue;
      }
      const data = await res.json();
      createdGroups.push(...data);
      const t1 = Date.now();
      console.log(`Lote ${i / groupBatchSize + 1}/4 inserido. Tempo: ${t1 - t0}ms. Total: ${createdGroups.length} grupos.`);
    } catch (err) {
      console.error('Erro na requisição de grupos:', err);
    }
  }

  // Vincular criadores como membros nos grupos criados (grupo_membros)
  if (createdGroups.length > 0) {
    console.log('Associando criadores na tabela de membros (grupo_membros)...');
    const membersToInsert = createdGroups.map(g => ({
      grupo_id: g.id,
      lead_id: g.criador_id
    }));

    const memberBatchSize = 500;
    for (let i = 0; i < membersToInsert.length; i += memberBatchSize) {
      const batch = membersToInsert.slice(i, i + memberBatchSize);
      try {
        const res = await fetch(`${restUrl}/grupo_membros`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify(batch)
        });
        if (!res.ok) {
          console.error(`Erro ao inserir membros:`, await res.text());
        }
      } catch (err) {
        console.error('Erro ao registrar membros:', err);
      }
    }
  }

  // 3. Criar 50.000 Engagement Events
  console.log('\n3. Gerando 50.000 eventos de engajamento (simulação, compartilhamento, bolão)...');
  const eventTypes = [
    { type: 'simulation_created', points: 10 },
    { type: 'simulation_shared', points: 20 },
    { type: 'group_created', points: 30 },
    { type: 'friend_invited', points: 15 },
    { type: 'invited_by_friend', points: 15 },
    { type: 'group_joined', points: 5 }
  ];

  const eventsToInsert = [];
  for (let i = 0; i < 50000; i++) {
    const leadId = createdLeads[Math.floor(Math.random() * createdLeads.length)];
    const ev = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    eventsToInsert.push({
      lead_id: leadId,
      event_type: ev.type,
      event_key: `stress:${i}:${leadId}:${ev.type}`,
      points: ev.points,
      metadata: { stress: true, index: i }
    });
  }

  console.log('Inserindo Engagement Events em blocos de 2.000...');
  const eventBatchSize = 2000;
  let successfulEventsCount = 0;
  for (let i = 0; i < eventsToInsert.length; i += eventBatchSize) {
    const batch = eventsToInsert.slice(i, i + eventBatchSize);
    const t0 = Date.now();
    try {
      const res = await fetch(`${restUrl}/engagement_events`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify(batch)
      });
      const t1 = Date.now();
      if (res.ok) {
        successfulEventsCount += batch.length;
        console.log(`Lote ${i / eventBatchSize + 1}/25 inserido. Tempo: ${t1 - t0}ms. Total acumulado: ${successfulEventsCount} eventos.`);
      } else {
        console.error(`Erro ao inserir lote de eventos:`, await res.text());
      }
    } catch (err) {
      console.error('Erro na requisição de eventos:', err);
    }
  }

  const totalTime = Date.now() - startTime;

  console.log('\n=============================================');
  console.log('   SIMULAÇÃO E TESTE DE ESTRESSE CONCLUÍDOS');
  console.log('=============================================');
  console.log(`Tempo total gasto: ${(totalTime / 1000).toFixed(2)} segundos.`);
  console.log(`Resumo dos registros inseridos com sucesso:`);
  console.log(`- Leads (Simulações): ${createdLeads.length} (Alvo: 10.000)`);
  console.log(`- Grupos do Bolão: ${createdGroups.length} (Alvo: 2.000)`);
  console.log(`- Eventos de Engajamento: ${successfulEventsCount} (Alvo: 50.000)`);
  console.log('=============================================\n');
}

runStressTest();
