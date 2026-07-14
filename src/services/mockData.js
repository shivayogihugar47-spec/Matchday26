// @ts-check
/**
 * @fileoverview Mock / seed data for MatchDay 26.
 *
 * Used as fallback values when live API integrations are unavailable,
 * and as fixture data in the test suite.
 *
 * All values reflect realistic MetLife Stadium / FIFA World Cup 2026 data.
 */

// Mock data for MatchDay AI

export const mockWeather = {
  tempF: 72,
  tempC: 22,
  wind: 5,
  humidity: 60,
  rain: 10,
  source: 'simulated',
  updatedAt: new Date().toISOString()
};

// First semifinal: France vs Spain (July 14, 2026 at 3 PM ET)
export const mockMatch = {
  homeTeam: 'FRA',
  awayTeam: 'ESP',
  score: { home: null, away: null }, // Scheduled match, no score yet
  minute: 0,
  status: 'SCHEDULED',
  kickoff: '2026-07-14T19:00:00.000Z', // 3 PM ET is 19:00 UTC
  venue: 'AT&T Stadium, Arlington, Texas',
  source: 'real-2026-world-cup',
  stats: {
    home: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      offsides: 0
    },
    away: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      offsides: 0
    }
  },
  events: []
};

export const mockZones = [
  { id: 'gate-amex', name: 'AMEX Gate', congestion: 0.3, waitTime: 5, trend: 'stable', reportCount: 2, recommended: true },
  { id: 'gate-hcltech', name: 'HCLTech Gate', congestion: 0.7, waitTime: 15, trend: 'increasing', reportCount: 5, recommended: false },
  { id: 'gate-verizon', name: 'Verizon Gate', congestion: 0.2, waitTime: 3, trend: 'stable', reportCount: 1, recommended: true },
  { id: 'gate-metlife', name: 'MetLife Gate', congestion: 0.5, waitTime: 10, trend: 'decreasing', reportCount: 3, recommended: false },
  { id: 'gate-moodys', name: "Moody's Gate", congestion: 0.4, waitTime: 8, trend: 'stable', reportCount: 2, recommended: true }
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
    askAI: 'Demander à l\'IA...',
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
