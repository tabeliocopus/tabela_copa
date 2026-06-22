import { officialMatches } from './officialMatches.js';

export const teams = {
  // Group A
  "MX": { name: "México", code: "mx", group: "A", players: ["Santiago Giménez", "Edson Álvarez", "Chucky Lozano"] },
  "ZA": { name: "África do Sul", code: "za", group: "A", players: ["Percy Tau", "Teboho Mokoena", "Themba Zwane"] },
  "KR": { name: "Coreia do Sul", code: "kr", group: "A", players: ["Heung-min Son", "Kim Min-jae", "Hwang Hee-chan"] },
  "CZ": { name: "República Tcheca", code: "cz", group: "A", players: ["Patrik Schick", "Tomas Soucek", "Adam Hlozek"] },

  // Group B
  "CA": { name: "Canadá", code: "ca", group: "B", players: ["Alfonso Davies", "Jonathan David", "Cyle Larin"] },
  "BA": { name: "Bósnia e Herzegovina", code: "ba", group: "B", players: ["Edin Dzeko", "Sead Kolasinac", "Miralem Pjanic"] },
  "QA": { name: "Catar", code: "qa", group: "B", players: ["Akram Afif", "Almoez Ali", "Hassan Al-Haydos"] },
  "CH": { name: "Suíça", code: "ch", group: "B", players: ["Granit Xhaka", "Manuel Akanji", "Xherdan Shaqiri"] },

  // Group C
  "BR": { name: "Brasil", code: "br", group: "C", players: ["Vinícius Júnior", "Rodrygo", "Endrick"] },
  "MA": { name: "Marrocos", code: "ma", group: "C", players: ["Achraf Hakimi", "Brahim Díaz", "Yassine Bounou"] },
  "HT": { name: "Haiti", code: "ht", group: "C", players: ["Duckens Nazon", "Frantzdy Pierrot", "Derrick Etienne"] },
  "GB-SCT": { name: "Escócia", code: "gb-sct", group: "C", players: ["Scott McTominay", "Andy Robertson", "John McGinn"] },

  // Group D
  "US": { name: "Estados Unidos", code: "us", group: "D", players: ["Christian Pulisic", "Weston McKennie", "Timothy Weah"] },
  "PY": { name: "Paraguai", code: "py", group: "D", players: ["Miguel Almirón", "Julio Enciso", "Ramón Sosa"] },
  "AU": { name: "Austrália", code: "au", group: "D", players: ["Mathew Ryan", "Harry Souttar", "Craig Goodwin"] },
  "TR": { name: "Turquia", code: "tr", group: "D", players: ["Arda Güler", "Hakan Çalhanoğlu", "Kenan Yıldız"] },

  // Group E
  "DE": { name: "Alemanha", code: "de", group: "E", players: ["Jamal Musiala", "Florian Wirtz", "Kai Havertz"] },
  "CW": { name: "Curaçao", code: "cw", group: "E", players: ["Juninho Bacuna", "Leandro Bacuna", "Kenji Gorré"] },
  "CI": { name: "Costa do Marfim", code: "ci", group: "E", players: ["Sébastien Haller", "Simon Adingra", "Franck Kessié"] },
  "EC": { name: "Equador", code: "ec", group: "E", players: ["Enner Valencia", "Moisés Caicedo", "Piero Hincapié"] },

  // Group F
  "NL": { name: "Holanda", code: "nl", group: "F", players: ["Cody Gakpo", "Virgil van Dijk", "Xavi Simons"] },
  "JP": { name: "Japão", code: "jp", group: "F", players: ["Kaoru Mitoma", "Wataru Endo", "Takefusa Kubo"] },
  "SE": { name: "Suécia", code: "se", group: "F", players: ["Viktor Gyökeres", "Alexander Isak", "Dejan Kulusevski"] },
  "TN": { name: "Tunísia", code: "tn", group: "F", players: ["Elyes Skhiri", "Youssef Msakni", "Hannibal Mejbri"] },

  // Group G
  "BE": { name: "Bélgica", code: "be", group: "G", players: ["Kevin De Bruyne", "Romelu Lukaku", "Jérémy Doku"] },
  "EG": { name: "Egito", code: "eg", group: "G", players: ["Mohamed Salah", "Mostafa Mohamed", "Omar Marmoush"] },
  "IR": { name: "Irã", code: "ir", group: "G", players: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh"] },
  "NZ": { name: "Nova Zelândia", code: "nz", group: "G", players: ["Chris Wood", "Sarpreet Singh", "Liberato Cacace"] },

  // Group H
  "ES": { name: "Espanha", code: "es", group: "H", players: ["Lamine Yamal", "Nico Williams", "Rodri"] },
  "CV": { name: "Cabo Verde", code: "cv", group: "H", players: ["Ryan Mendes", "Garry Rodrigues", "Jovane Cabral"] },
  "SA": { name: "Arábia Saudita", code: "sa", group: "H", players: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saud Abdulhamid"] },
  "UY": { name: "Uruguai", code: "uy", group: "H", players: ["Darwin Núñez", "Federico Valverde", "Luis Suárez"] },

  // Group I
  "FR": { name: "França", code: "fr", group: "I", players: ["Kylian Mbappé", "Antoine Griezmann", "Ousmane Dembélé"] },
  "SN": { name: "Senegal", code: "sn", group: "I", players: ["Sadio Mané", "Nicolas Jackson", "Kalidou Koulibaly"] },
  "IQ": { name: "Iraque", code: "iq", group: "I", players: ["Aymen Hussein", "Ali Jasim", "Ibrahim Bayesh"] },
  "NO": { name: "Noruega", code: "no", group: "I", players: ["Erling Haaland", "Martin Ødegaard", "Oscar Bobb"] },

  // Group J
  "AR": { name: "Argentina", code: "ar", group: "J", players: ["Lionel Messi", "Lautaro Martínez", "Julián Álvarez"] },
  "DZ": { name: "Argélia", code: "dz", group: "J", players: ["Riyad Mahrez", "Said Benrahma", "Amine Gouiri"] },
  "AT": { name: "Áustria", code: "at", group: "J", players: ["David Alaba", "Marcel Sabitzer", "Konrad Laimer"] },
  "JO": { name: "Jordânia", code: "jo", group: "J", players: ["Musa Al-Taamari", "Yazan Al-Naimat", "Ali Olwan"] },

  // Group K
  "PT": { name: "Portugal", code: "pt", group: "K", players: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão"] },
  "CD": { name: "RD Congo", code: "cd", group: "K", players: ["Yoane Wissa", "Chancel Mbemba", "Arthur Masuaku"] },
  "UZ": { name: "Uzbequistão", code: "uz", group: "K", players: ["Eldor Shomurodov", "Abbosbek Fayzullaev", "Oston Urunov"] },
  "CO": { name: "Colômbia", code: "co", group: "K", players: ["Luis Díaz", "James Rodríguez", "Jhon Durán"] },

  // Group L
  "GB-ENG": { name: "Inglaterra", code: "gb-eng", group: "L", players: ["Harry Kane", "Jude Bellingham", "Bukayo Saka"] },
  "HR": { name: "Croácia", code: "hr", group: "L", players: ["Luka Modrić", "Mateo Kovačić", "Joško Gvardiol"] },
  "GH": { name: "Gana", code: "gh", group: "L", players: ["Mohammed Kudus", "Inaki Williams", "Jordan Ayew"] },
  "PA": { name: "Panamá", code: "pa", group: "L", players: ["Adalberto Carrasquilla", "José Fajardo", "Aníbal Godoy"] }
};

export const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Helper to get day name dynamically
export function getWeekDay(date) {
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return daysOfWeek[date.getUTCDay()];
}

// Group Stage Host Venues (Geographic Clustering for World Cup 2026)
const groupVenues = {
  "A": [
    { city: "Mexico City", stadium: "Azteca Stadium" },
    { city: "Guadalajara", stadium: "Guadalajara Stadium" },
    { city: "Monterrey", stadium: "Monterrey Stadium" }
  ],
  "B": [
    { city: "Toronto", stadium: "Toronto Stadium" },
    { city: "Vancouver", stadium: "BC Place" },
    { city: "Seattle", stadium: "Lumen Field" }
  ],
  "C": [
    { city: "New York/New Jersey", stadium: "MetLife Stadium" },
    { city: "Boston", stadium: "Gillette Stadium" },
    { city: "Philadelphia", stadium: "Lincoln Financial Field" }
  ],
  "D": [
    { city: "Los Angeles", stadium: "SoFi Stadium" },
    { city: "San Francisco Bay Area", stadium: "Levi's Stadium" },
    { city: "Seattle", stadium: "Lumen Field" }
  ],
  "E": [
    { city: "Dallas", stadium: "AT&T Stadium" },
    { city: "Houston", stadium: "NRG Stadium" },
    { city: "Atlanta", stadium: "Mercedes-Benz Stadium" }
  ],
  "F": [
    { city: "Kansas City", stadium: "Arrowhead Stadium" },
    { city: "Miami", stadium: "Hard Rock Stadium" },
    { city: "Atlanta", stadium: "Mercedes-Benz Stadium" }
  ],
  "G": [
    { city: "Boston", stadium: "Gillette Stadium" },
    { city: "Philadelphia", stadium: "Lincoln Financial Field" },
    { city: "New York/New Jersey", stadium: "MetLife Stadium" }
  ],
  "H": [
    { city: "Los Angeles", stadium: "SoFi Stadium" },
    { city: "San Francisco Bay Area", stadium: "Levi's Stadium" },
    { city: "Vancouver", stadium: "BC Place" }
  ],
  "I": [
    { city: "Houston", stadium: "NRG Stadium" },
    { city: "Dallas", stadium: "AT&T Stadium" },
    { city: "Monterrey", stadium: "Monterrey Stadium" }
  ],
  "J": [
    { city: "Toronto", stadium: "Toronto Stadium" },
    { city: "Boston", stadium: "Gillette Stadium" },
    { city: "New York/New Jersey", stadium: "MetLife Stadium" }
  ],
  "K": [
    { city: "Seattle", stadium: "Lumen Field" },
    { city: "San Francisco Bay Area", stadium: "Levi's Stadium" },
    { city: "Los Angeles", stadium: "SoFi Stadium" }
  ],
  "L": [
    { city: "Miami", stadium: "Hard Rock Stadium" },
    { city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
    { city: "Dallas", stadium: "AT&T Stadium" }
  ]
};

// Generate match schedules using official real schedules from API
export const generateMatches = () => {
  return officialMatches.map(m => ({
    ...m,
    homeScore: null,
    awayScore: null,
    scorers: { home: [], away: [] }
  }));
};

// Automatic audit function for build validation
export function validateWorldCupData() {
  const matchesList = generateMatches();
  const errors = [];
  const teamKeys = Object.keys(teams);

  // Validate quantities
  if (teamKeys.length !== 48) errors.push(`Expected 48 teams, found ${teamKeys.length}`);
  if (groups.length !== 12) errors.push(`Expected 12 groups, found ${groups.length}`);
  if (matchesList.length !== 72) errors.push(`Expected 72 matches, found ${matchesList.length}`);

  // Group counts & match counts
  const groupTeamsCount = {};
  const teamMatchesCount = {};
  const groupMatchesCount = {};

  teamKeys.forEach(k => {
    const t = teams[k];
    groupTeamsCount[t.group] = (groupTeamsCount[t.group] || 0) + 1;
    teamMatchesCount[k] = 0;
  });

  groups.forEach(g => {
    if (groupTeamsCount[g] !== 4) {
      errors.push(`Group ${g} has ${groupTeamsCount[g] || 0} teams instead of 4`);
    }
  });

  matchesList.forEach(m => {
    groupMatchesCount[m.group] = (groupMatchesCount[m.group] || 0) + 1;
    if (teamMatchesCount[m.homeId] !== undefined) teamMatchesCount[m.homeId]++;
    if (teamMatchesCount[m.awayId] !== undefined) teamMatchesCount[m.awayId]++;

    if (m.homeId === m.awayId) errors.push(`Match ${m.id} has same team playing against itself: ${m.homeId}`);
    if (!m.city || m.city.trim() === '') errors.push(`Match ${m.id} has missing city`);
    if (!m.stadium || m.stadium.trim() === '') errors.push(`Match ${m.id} has missing stadium`);

    const dateRegex = /^\d{2}\/\d{2}\/2026/;
    if (!dateRegex.test(m.datetime)) {
      errors.push(`Match ${m.id} has invalid date format: ${m.datetime}`);
    }
  });

  groups.forEach(g => {
    if (groupMatchesCount[g] !== 6) errors.push(`Group ${g} has ${groupMatchesCount[g] || 0} matches instead of 6`);
  });

  teamKeys.forEach(k => {
    if (teamMatchesCount[k] !== 3) {
      errors.push(`Team ${teams[k].name} has ${teamMatchesCount[k]} matches instead of 3`);
    }
  });

  console.log("=========================================");
  console.log("🔍 RELATÓRIO DE AUDITORIA COPA DO MUNDO 2026");
  console.log(`- Grupos validados: ${groups.length}`);
  console.log(`- Seleções validadas: ${teamKeys.length}`);
  console.log(`- Jogos validados: ${matchesList.length}`);
  if (errors.length > 0) {
    console.error(`🚨 Inconsistências encontradas: ${errors.length}`);
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(`Build falhou devido a inconsistências na base de dados da Copa 2026.`);
  } else {
    console.log("✅ Nenhuma inconsistência encontrada na base de dados!");
  }
  console.log("=========================================");

  return {
    totalGroups: groups.length,
    totalTeams: teamKeys.length,
    totalMatches: matchesList.length,
    errorsCount: errors.length
  };
}
