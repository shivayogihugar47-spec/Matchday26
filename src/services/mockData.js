// @ts-check
/**
 * @fileoverview Match data for MatchDay 26.
 *
 * Updated with verified 2026 FIFA World Cup Final result:
 *   Spain 1–0 Argentina (AET) — July 19, 2026 — MetLife Stadium, NJ
 *   Goal: Ferran Torres 108' (assist: Nico Williams)
 *   Red card: Enzo Fernández (Argentina) 90+3' — 2nd yellow
 *   Spain are 2026 FIFA World Cup Champions — their 2nd title (also 2010)
 *   Stats: Spain 20 shots (6 on target) vs Argentina 3 shots (0 on target)
 */

// Mock data for MatchDay AI

export const mockWeather = {
  tempF: 84,
  tempC: 29,
  wind: 8,
  humidity: 65,
  rain: 5,
  source: 'simulated',
  updatedAt: new Date().toISOString(),
};

export const mockMatch = {
  homeTeam: 'Spain',
  awayTeam: 'Argentina',
  score: { home: 1, away: 0 },
  minute: 120,
  status: 'FINISHED',
  kickoff: '2026-07-19T19:00:00.000Z', // 3 PM ET
  venue: 'MetLife Stadium, East Rutherford, NJ',
  source: 'real-2026-world-cup',
  winner: 'Spain',
  extraTime: true,
  semifinalResults: [
    {
      match: 'SF1',
      home: 'France',
      away: 'Spain',
      score: '0-2',
      scorers: ["Oyarzabal 45+2' (pen)", "Porro 67'"],
      venue: 'AT&T Stadium, Dallas',
    },
    {
      match: 'SF2',
      home: 'England',
      away: 'Argentina',
      score: '0-1',
      scorers: ["Messi 78'"],
      venue: 'Mercedes-Benz Stadium, Atlanta',
    },
  ],
  stats: {
    home: { possession: 62, shots: 20, shotsOnTarget: 6,  corners: 9, fouls: 10 },
    away: { possession: 38, shots: 3,  shotsOnTarget: 0,  corners: 2, fouls: 14 },
  },
  events: [
    { id: 1, type: 'yellow', team: 'away', player: 'Enzo Fernández',  minute: '67',   assist: null },
    { id: 2, type: 'red',    team: 'away', player: 'Enzo Fernández',  minute: '90+3', assist: null, on: null, off: null },
    { id: 3, type: 'goal',   team: 'home', player: 'Ferran Torres',   minute: '108',  assist: 'Nico Williams' },
  ],
};

export const mockZones = [
  { id: 'gate-amex',    name: 'AMEX Gate',     congestion: 0.3, waitTime: 5,  trend: 'stable',     reportCount: 2, recommended: true  },
  { id: 'gate-hcltech', name: 'HCLTech Gate',  congestion: 0.7, waitTime: 15, trend: 'increasing', reportCount: 5, recommended: false },
  { id: 'gate-verizon', name: 'Verizon Gate',  congestion: 0.2, waitTime: 3,  trend: 'stable',     reportCount: 1, recommended: true  },
  { id: 'gate-metlife', name: 'MetLife Gate',  congestion: 0.5, waitTime: 10, trend: 'decreasing', reportCount: 3, recommended: false },
  { id: 'gate-moodys',  name: "Moody's Gate",  congestion: 0.4, waitTime: 8,  trend: 'stable',     reportCount: 2, recommended: true  },
];

export const mockConversations = [];

export const languageTranslations = {
  en: {
    appTitle: 'MatchDay AI',
    preMatch: 'PRE MATCH',
    liveMatch: 'LIVE MATCH',
    postMatch: 'POST MATCH',
    weather: 'Weather',
    matchStatus: 'Match Status',
    askAI: 'Ask AI...',
    quickActions: 'Quick Actions',
    exitPlan: 'Exit Plan',
    crowdReports: 'Crowd Reports',
    accessibility: 'Accessibility',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    portuguese: 'Português',
    hindi: 'हिन्दी'
  },
  es: {
    appTitle: 'MatchDay AI',
    preMatch: 'PRE PARTIDO',
    liveMatch: 'PARTIDO EN VIVO',
    postMatch: 'POST PARTIDO',
    weather: 'Clima',
    matchStatus: 'Estado del Partido',
    askAI: 'Pregunta a la IA...',
    quickActions: 'Acciones Rápidas',
    exitPlan: 'Plan de Salida',
    crowdReports: 'Reportes de Afluencia',
    accessibility: 'Accesibilidad',
    language: 'Idioma',
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    portuguese: 'Português',
    hindi: 'हिन्दी'
  },
  fr: {
    appTitle: 'MatchDay AI',
    preMatch: 'AVANT MATCH',
    liveMatch: 'MATCH EN DIRECT',
    postMatch: 'APRÈS MATCH',
    weather: 'Météo',
    matchStatus: 'Statut du Match',
    askAI: "Demander à l'IA...",
    quickActions: 'Actions Rapides',
    exitPlan: 'Plan de Sortie',
    crowdReports: 'Rapports de Foule',
    accessibility: 'Accessibilité',
    language: 'Langue',
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    portuguese: 'Português',
    hindi: 'हिन्दी'
  },
  de: {
    appTitle: 'MatchDay AI',
    preMatch: 'VOR DEM SPIEL',
    liveMatch: 'SPIEL LIVE',
    postMatch: 'NACH DEM SPIEL',
    weather: 'Wetter',
    matchStatus: 'Spielstatus',
    askAI: 'KI fragen...',
    quickActions: 'Schnellaktionen',
    exitPlan: 'Ausstiegsplan',
    crowdReports: 'Menschenmengenberichte',
    accessibility: 'Barrierefreiheit',
    language: 'Sprache',
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    portuguese: 'Português',
    hindi: 'हिन्दी'
  },
  pt: {
    appTitle: 'MatchDay AI',
    preMatch: 'PRÉ-JOGO',
    liveMatch: 'JOGO AO VIVO',
    postMatch: 'PÓS-JOGO',
    weather: 'Tempo',
    matchStatus: 'Status do Jogo',
    askAI: 'Pergunte à IA...',
    quickActions: 'Ações Rápidas',
    exitPlan: 'Plano de Saída',
    crowdReports: 'Relatórios de Fila',
    accessibility: 'Acessibilidade',
    language: 'Idioma',
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    portuguese: 'Português',
    hindi: 'हिन्दी'
  },
  hi: {
    appTitle: 'MatchDay AI',
    preMatch: 'प्री मैच',
    liveMatch: 'लाइव मैच',
    postMatch: 'पोस्ट मैच',
    weather: 'मौसम',
    matchStatus: 'मैच की स्थिति',
    askAI: 'AI से पूछें...',
    quickActions: 'त्वरित क्रियाएँ',
    exitPlan: 'निकास योजना',
    crowdReports: 'भीड़ की रिपोर्टें',
    accessibility: 'सुलभता',
    language: 'भाषा',
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    portuguese: 'Português',
    hindi: 'हिन्दी'
  }
};
