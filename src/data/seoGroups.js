import { teams } from './worldCupData';

// Map group letter to slug-friendly name and SEO metadata
const groupLetterToSlug = {
  A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', F: 'f',
  G: 'g', H: 'h', I: 'i', J: 'j', K: 'k', L: 'l'
};

export function getGroupTeams(letter) {
  return Object.entries(teams)
    .filter(([_, t]) => t.group === letter)
    .map(([id, t]) => ({ id, ...t }));
}

export function getGroupSEO(letter) {
  const groupTeams = getGroupTeams(letter);
  const teamNames = groupTeams.map(t => t.name).join(', ');
  const slug = `grupo-${groupLetterToSlug[letter]}-copa-2026`;

  return {
    letter,
    slug,
    teams: groupTeams,
    title: `Grupo ${letter} da Copa 2026 — ${teamNames} | Simulador`,
    description: `Veja as seleções do Grupo ${letter} da Copa do Mundo 2026: ${teamNames}. Confira jogos, classificação e simule os resultados!`,
    h1: `Grupo ${letter} — Copa do Mundo 2026`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": `Copa do Mundo 2026 — Grupo ${letter}`,
      "description": `Fase de grupos da Copa do Mundo 2026 — Grupo ${letter} com ${teamNames}.`,
      "location": { "@type": "Place", "name": "Estádios nos EUA, México e Canadá" },
      "startDate": "2026-06-11",
      "endDate": "2026-07-19",
      "competitor": groupTeams.map(t => ({
        "@type": "SportsTeam",
        "name": t.name
      }))
    }
  };
}

export function getAllGroupSEO() {
  return Object.keys(groupLetterToSlug).map(letter => getGroupSEO(letter));
}
