import { useQuery } from '@tanstack/react-query';
import { mockMatch } from '../services/mockData';

const WORLD_CUP_26_API_BASE = 'https://worldcup26.ir';

// Helper function to convert worldcup26.ir API match data to our app's format
function convertWorldCup26MatchToAppFormat(apiMatch) {
  if (!apiMatch) return mockMatch;
  
  // Map status codes
  let status = 'SCHEDULED';
  if (apiMatch.time_elapsed === 'running') status = 'IN_PLAY';
  if (apiMatch.finished === 'TRUE') status = 'FINISHED';
  if (apiMatch.time_elapsed === 'halftime') status = 'PAUSED';

  // Get team codes from team name
  function getTeamCode(teamName) {
    if (!teamName) return 'TBD';
    const name = teamName.toLowerCase();
    if (name.includes('france')) return 'FRA';
    if (name.includes('spain')) return 'ESP';
    if (name.includes('england')) return 'ENG';
    if (name.includes('argentina')) return 'ARG';
    if (name.includes('mexico')) return 'MEX';
    if (name.includes('south africa')) return 'RSA';
    if (name.includes('south korea')) return 'KOR';
    if (name.includes('czech republic')) return 'CZE';
    if (name.includes('canada')) return 'CAN';
    if (name.includes('bosnia')) return 'BIH';
    if (name.includes('united states')) return 'USA';
    if (name.includes('paraguay')) return 'PRY';
    if (name.includes('haiti')) return 'HAI';
    if (name.includes('scotland')) return 'SCO';
    if (name.includes('australia')) return 'AUS';
    if (name.includes('turkey')) return 'TUR';
    if (name.includes('brazil')) return 'BRA';
    if (name.includes('morocco')) return 'MAR';
    if (name.includes('qatar')) return 'QAT';
    if (name.includes('switzerland')) return 'CHE';
    if (name.includes('ivory coast')) return 'CIV';
    if (name.includes('ecuador')) return 'ECU';
    if (name.includes('germany')) return 'DEU';
    if (name.includes('curacao')) return 'CUW';
    if (name.includes('netherlands')) return 'NLD';
    if (name.includes('japan')) return 'JPN';
    if (name.includes('sweden')) return 'SWE';
    if (name.includes('tunisia')) return 'TUN';
    if (name.includes('iran')) return 'IRN';
    if (name.includes('new zealand')) return 'NZL';
    if (name.includes('cape verde')) return 'CPV';
    if (name.includes('belgium')) return 'BEL';
    if (name.includes('egypt')) return 'EGY';
    if (name.includes('saudi')) return 'SAU';
    if (name.includes('uruguay')) return 'URY';
    if (name.includes('senegal')) return 'SEN';
    if (name.includes('iraq')) return 'IRQ';
    if (name.includes('norway')) return 'NOR';
    if (name.includes('algeria')) return 'DZA';
    if (name.includes('austria')) return 'AUT';
    if (name.includes('jordan')) return 'JOR';
    if (name.includes('portugal')) return 'PRT';
    if (name.includes('congo')) return 'COD';
    if (name.includes('croatia')) return 'HRV';
    if (name.includes('uzbekistan')) return 'UZB';
    if (name.includes('colombia')) return 'COL';
    if (name.includes('ghana')) return 'GHA';
    if (name.includes('panama')) return 'PAN';
    return teamName.substring(0, 3).toUpperCase();
  }

  // Parse local_date from "MM/DD/YYYY HH:MM" to ISO string
  function parseLocalDate(dateStr) {
    if (!dateStr) return '2026-07-14T19:00:00.000Z';
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      const date = new Date(year, month - 1, day, hour, minute);
      if (isNaN(date.getTime())) return '2026-07-14T19:00:00.000Z';
      return date.toISOString();
    } catch (e) {
      return '2026-07-14T19:00:00.000Z';
    }
  }

  return {
    homeTeam: getTeamCode(apiMatch.home_team_name_en),
    awayTeam: getTeamCode(apiMatch.away_team_name_en),
    score: {
      home: apiMatch.home_score !== null ? parseInt(apiMatch.home_score, 10) : null,
      away: apiMatch.away_score !== null ? parseInt(apiMatch.away_score, 10) : null,
    },
    minute: 0, // API doesn't provide minute
    status: status,
    kickoff: parseLocalDate(apiMatch.local_date),
    venue: 'TBD', // API has stadium_id but no stadium name data in games endpoint
    source: 'worldcup26.ir',
    // Default stats
    stats: {
      home: {
        possession: 50,
        shots: 0,
        shotsOnTarget: 0,
        corners: 0,
        fouls: 0,
        offsides: 0,
      },
      away: {
        possession: 50,
        shots: 0,
        shotsOnTarget: 0,
        corners: 0,
        fouls: 0,
        offsides: 0,
      },
    },
    events: [],
  };
}

export const useMatchStatus = () => {
  return useQuery({
    queryKey: ['match'],
    queryFn: async () => {
      // Use our real semifinal mock data by default since API only has group stage right now
      return mockMatch;
    },
    refetchInterval: 30000 // Refresh every 30 seconds (for live updates)
  });
};
