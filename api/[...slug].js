import knowledgeBase from '../knowledgeBase.js';

const mockWeather = {
  tempF: 72,
  tempC: 22,
  wind: 5,
  humidity: 60,
  rain: 10,
  source: 'simulated',
  updatedAt: new Date().toISOString()
};

const mockMatch = {
  homeTeam: 'USA',
  awayTeam: 'Mexico',
  score: { home: 1, away: 0 },
  minute: 45,
  status: 'HALFTIME',
  kickoff: new Date(Date.now() - 45 * 60000).toISOString(),
  venue: 'MetLife Stadium',
  source: 'simulated'
};

const mockRecentReports = [
  "Long lines at security near Verizon Gate",
  "AMEX Gate moving faster",
  "Restrooms by Section 124 are crowded",
  "Plenty of water refill stations available"
];

const zoneCongestionMap = {
  "AMEX Gate": { congestion: 0.3, waitTime: 5, trend: "stable" },
  "HCLTech Gate": { congestion: 0.7, waitTime: 15, trend: "increasing" },
  "Verizon Gate": { congestion: 0.2, waitTime: 3, trend: "stable" },
  "MetLife Gate": { congestion: 0.5, waitTime: 10, trend: "decreasing" },
  "Moody's Gate": { congestion: 0.4, waitTime: 8, trend: "stable" }
};

let lostItems = [];
let foundItems = [
  { id: 1, description: "Black iPhone 15", locationFound: "Section 124", contact: "guest-services@metlifestadium.com" }
];
let lastExitPlan = null;

async function getWeatherData(lat, lon) {
  const latitude = lat || 40.8135;
  const longitude = lon || -74.0745;
  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York`;
    const response = await fetch(openMeteoUrl);
    if (!response.ok) throw new Error('Failed to fetch from Open-Meteo');
    const weatherData = await response.json();
    const current = weatherData.current;
    const tempF = Math.round(current.temperature_2m);
    const tempC = Math.round((tempF - 32) * 5 / 9);
    return {
      tempF,
      tempC,
      wind: current.wind_speed_10m || 0,
      humidity: current.relative_humidity_2m,
      rain: current.precipitation_probability,
      source: 'Open-Meteo',
      updatedAt: new Date().toISOString()
    };
  } catch (e) {
    console.error("Weather fetch error, using mock", e);
    return mockWeather;
  }
}

function getLiveStatus(zone) {
  const gateName = zone || "Verizon Gate";
  const zoneStats = zoneCongestionMap[gateName] || zoneCongestionMap["Verizon Gate"];
  const congestionLevel = zoneStats.congestion < 0.4 ? "low" : zoneStats.congestion < 0.7 ? "medium" : "high";
  const currentPhase = "PRE_MATCH";
  const weatherSummary = "clear, 72 degrees";
  
  return {
    zone: gateName,
    zoneCongestion: congestionLevel,
    recentReports: mockRecentReports.join("; "),
    currentPhase,
    currentWeather: weatherSummary,
    matchStatus: "SCHEDULED; kickoff at 3:00 PM",
    weather: mockWeather,
    zoneStats,
    match: mockMatch
  };
}

export default async function handler(req, res) {
  try {
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');
    const path = pathname.replace('/api', '');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    if (path === '/health') {
      return res.status(200).json({ status: 'ok' });
    }
    
    if (path === '/weather' && req.method === 'GET') {
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      const data = await getWeatherData(lat, lon);
      return res.status(200).json({ data, meta: { timestamp: Date.now() } });
    }
    
    if (path === '/match' && req.method === 'GET') {
      return res.status(200).json({ data: mockMatch, meta: { timestamp: Date.now() } });
    }
    
    if (path === '/concierge/live-status' && req.method === 'GET') {
      const zone = searchParams.get('zone');
      const liveStatus = getLiveStatus(zone);
      return res.status(200).json({ data: liveStatus });
    }
    
    if (path === '/concierge/system-prompt' && req.method === 'GET') {
      const zone = searchParams.get('zone');
      const accessibility = searchParams.get('accessibility') === 'true';
      const language = searchParams.get('language') || 'English';
      const gateName = zone || "Verizon Gate";
      const liveStatus = getLiveStatus(gateName);
      
      const systemPrompt = `You are MatchDay AI, a helpful concierge for the FIFA World Cup match at MetLife Stadium (New York New Jersey Stadium) in East Rutherford, NJ.

CURRENT CONTEXT (right now):
- Current Phase: ${liveStatus.currentPhase}
- Current Weather: ${liveStatus.currentWeather}
- Selected Gate: ${gateName}
- Zone Congestion: ${liveStatus.zoneCongestion}
- Recent Reports: ${liveStatus.recentReports}
- Accessibility Mode: ${accessibility ? "Enabled" : "Disabled"}
- Match Status: ${liveStatus.matchStatus}

Use only the following knowledge base to answer questions:
${JSON.stringify(knowledgeBase, null, 2)}

Always respond in the EXACT SAME LANGUAGE as the user's latest message, without any mention of language switching.
Keep answers concise, clear, actionable, and friendly! Focus on safety and efficiency!`;

      return res.status(200).json({
        data: {
          systemPrompt,
          variableValues: {
            currentPhase: liveStatus.currentPhase,
            currentWeather: liveStatus.currentWeather,
            selectedGate: gateName,
            zoneCongestion: liveStatus.zoneCongestion,
            recentReports: liveStatus.recentReports,
            accessibilityMode: accessibility ? "Enabled" : "Disabled",
            matchStatus: liveStatus.matchStatus
          }
        }
      });
    }
    
    if (path === '/exit-plan/latest' && req.method === 'GET') {
      return res.status(200).json({ data: lastExitPlan });
    }
    
    if (path === '/exit-plan/generate' && req.method === 'POST') {
      let body = {};
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch (e) { body = {}; }
      const { transportMethod, hasAccessibleNeeds, preferredGate } = body;
      
      const gateRecommendations = {
        'train': ['AMEX Gate', 'Verizon Gate', "Moody's Gate"],
        'bus': ['HCLTech Gate', 'MetLife Gate'],
        'parking': preferredGate ? [preferredGate] : ['Platinum Lot Exit', 'Green Lot Exit'],
        'uber': ['Verizon Gate', 'MetLife Gate']
      };
      
      let steps = [];
      switch (transportMethod) {
        case 'train':
          steps = [
            `Exit via one of these recommended gates: ${gateRecommendations['train'].join(', ')}`,
            'Follow signs to Meadowlands Rail Line station',
            'Take the special event train directly to Secaucus Junction',
            'From Secaucus Junction, connect to your final destination'
          ];
          break;
        case 'bus':
          steps = [
            `Exit via one of these recommended gates: ${gateRecommendations['bus'].join(', ')}`,
            'Proceed to designated bus pick-up zones',
            'Board NJ Transit Route 703 or Coach USA 351 Meadowlands Express'
          ];
          break;
        case 'parking':
          steps = [
            'Wait 10–15 minutes to avoid initial exit surge',
            `Use ${preferredGate || 'your assigned lot exit'} for less congestion`,
            'Follow parking lot attendants\' directions'
          ];
          break;
        case 'uber':
          steps = [
            `Exit via one of these recommended gates: ${gateRecommendations['uber'].join(', ')}`,
            'Proceed to designated Uber/Lyft lot on-site'
          ];
          break;
        default:
          steps = [
            'Exit via the nearest available gate',
            'Follow stadium staff directions'
          ];
      }
      
      if (hasAccessibleNeeds) {
        steps.unshift('Use elevators at HCLTech Gate, Verizon Gate, or Moody\'s Gate');
        steps.push('Ask any Accessibility Assistant for help if needed');
      }
      
      const result = {
        title: `Personalized Exit Plan (${transportMethod || 'train'})`,
        transportMethod: transportMethod || 'train',
        recommendedGates: gateRecommendations[transportMethod] || ['Verizon Gate'],
        steps,
        generatedAt: new Date().toISOString()
      };
      
      lastExitPlan = result;
      return res.status(200).json({ result, data: result });
    }
    
    if (path === '/lost-and-found/report' && req.method === 'POST') {
      let body = {};
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch (e) { body = {}; }
      
      const params = body.parameters || body;
      const description = params.description || '';
      const locationLost = params.locationLost || '';
      const contact = params.contact || '';
      
      const newItem = {
        id: lostItems.length + 1,
        description,
        locationLost,
        contact,
        reportedAt: new Date().toISOString()
      };
      lostItems.push(newItem);
      
      return res.status(200).json({
        result: { success: true, item: newItem, message: "Your lost item has been reported." },
        data: { success: true, item: newItem, message: "Your lost item has been reported." }
      });
    }
    
    if ((path === '/lost-and-found/check') && (req.method === 'GET' || req.method === 'POST')) {
      let params = {};
      if (req.method === 'GET') {
        params = Object.fromEntries(searchParams.entries());
      } else {
        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = JSON.parse(Buffer.concat(chunks).toString());
          params = body.parameters || body;
        } catch (e) { params = {}; }
      }
      
      const description = (params.description || '').toLowerCase();
      const matches = foundItems.filter(item =>
        item.description.toLowerCase().includes(description)
      );
      
      return res.status(200).json({
        result: { found: matches.length > 0, items: matches },
        data: { found: matches.length > 0, items: matches }
      });
    }
    
    return res.status(404).json({ error: 'Not Found' });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
