import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import knowledgeBase from '../metlife_deep_knowledge_base.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Helper to map language codes to names
const getLanguageName = (code) => {
  switch (code) {
    case 'en': return 'English';
    case 'es': return 'Spanish';
    case 'fr': return 'French';
    case 'de': return 'German';
    case 'pt': return 'Portuguese';
    case 'hi': return 'Hindi';
    default: return 'English';
  }
};

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 40;
const rateLimitStore = new Map();

const allowedOrigins = new Set([
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean));

// Allow Vercel deployments and localhost
const isAllowedOrigin = (origin) => !origin || allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || /vercel\.app$/.test(origin);

const sanitizeText = (value, maxLength = 400) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
};

const sanitizeInteger = (value, fallback = 0, max = 1800) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, 0), max);
};

const rateLimiter = (req, res, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const windowEntries = (rateLimitStore.get(key) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  windowEntries.push(now);
  rateLimitStore.set(key, windowEntries);

  if (windowEntries.length > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({ error: 'Too many requests. Please slow down and try again shortly.' });
    return;
  }

  next();
};

// Middleware
app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use('/api', rateLimiter);

// Mock data
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

// Internal functions (instead of internal HTTP calls)
async function getWeatherData(lat, lon) {
  const latitude = lat || 40.8135;
  const longitude = lon || -74.0745;
  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York`;
    const response = await fetch(openMeteoUrl);
    if (!response.ok) throw new Error('Failed to fetch weather from Open-Meteo');
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

async function getMatchData() {
  const liveFixture = await fetchFootballDataFinalFixture();
  const fallback = buildKnowledgeBaseFallback();
  return liveFixture || fallback;
}

const translations = {
  en: { welcome: 'Welcome', lost: 'Lost?' },
  es: { welcome: 'Bienvenido', lost: 'Perdido?' },
  hi: { welcome: 'स्वागत है', lost: 'खो गया?' }
};

// Mock crowdsourced reports
const mockRecentReports = [
  "Long lines at security near Verizon Gate",
  "AMEX Gate moving faster",
  "Restrooms by Section 124 are crowded",
  "Plenty of water refill stations available"
];

// Mock zone congestion values
const zoneCongestionMap = {
  "AMEX Gate": { congestion: 0.3, waitTime: 5, trend: "stable" },
  "HCLTech Gate": { congestion: 0.7, waitTime: 15, trend: "increasing" },
  "Verizon Gate": { congestion: 0.2, waitTime: 3, trend: "stable" },
  "MetLife Gate": { congestion: 0.5, waitTime: 10, trend: "decreasing" },
  "Moody's Gate": { congestion: 0.4, waitTime: 8, trend: "stable" }
};

// In-memory storage for lost and found (will reset when server restarts)
let lostItems = [];
let foundItems = [
  { id: 1, description: "Black iPhone 15", locationFound: "Section 124", contact: "guest-services@metlifestadium.com" }
];
let lastExitPlan = null;

// Rule-based AI fallback
const getRuleBasedResponse = (message, phase, language) => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('seat') || lowerMessage.includes('section')) {
    return "To find your seat: Check your ticket for section & gate. Use the interactive map, or ask a nearby steward in yellow vest!";
  }
  if (lowerMessage.includes('bathroom') || lowerMessage.includes('restroom') || lowerMessage.includes('toilet')) {
    return "Restrooms are every 50m, marked with blue signs. Accessible facilities near all main concourses!";
  }
  if (lowerMessage.includes('food') || lowerMessage.includes('beer') || lowerMessage.includes('drink')) {
    return "Food & beverage: Section 101 (classic dogs), Section 127 (craft beer), Section 148 (vegan). Apple Pay accepted!";
  }
  return "Thanks for reaching out! For immediate help, find the nearest steward in a yellow high-visibility vest.";
};

const getMatchStatusFromFootballData = (status) => {
  switch (status) {
    case 'IN_PLAY':
    case 'PAUSED':
    case 'HALFTIME':
    case 'BREAK':
      return 'IN_PLAY';
    case 'FINISHED':
    case 'AWARDED':
      return 'FINISHED';
    case 'POSTPONED':
    case 'CANCELLED':
    case 'SUSPENDED':
      return 'CANCELLED';
    default:
      return 'SCHEDULED';
  }
};

const getMatchPhaseLabel = (matchStatus) => {
  if (['IN_PLAY', 'PAUSED', 'HALFTIME', 'BREAK'].includes(matchStatus)) return 'LIVE_MATCH';
  if (['FINISHED', 'AWARDED'].includes(matchStatus)) return 'POST_MATCH';
  return 'PRE_MATCH';
};

const buildKnowledgeBaseFallback = () => {
  const finalDate = knowledgeBase.finalMatch?.date || '2026-07-19';
  const kickoff = knowledgeBase.finalMatch?.kickoffET ? `${finalDate}T${knowledgeBase.finalMatch.kickoffET}:00` : `${finalDate}T15:00:00`;
  return {
    homeTeam: knowledgeBase.finalMatch?.teams?.status === 'TBD' ? 'Finalists to be determined' : 'TBD',
    awayTeam: knowledgeBase.finalMatch?.teams?.status === 'TBD' ? 'Finalists to be determined' : 'TBD',
    score: null,
    minute: 0,
    status: 'SCHEDULED',
    kickoff,
    venue: knowledgeBase.venue?.tournamentName || 'MetLife Stadium',
    source: 'knowledge-base',
    sourceLabel: '📋 Reference Data',
    sourceDetail: 'Referenced from the local knowledge base; no live football-data.org key is configured.'
  };
};

const fetchFootballDataFinalFixture = async () => {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches?stage=FINAL', {
      headers: {
        'X-Auth-Token': apiKey
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('football-data.org request failed', response.status, errorBody);
      return null;
    }

    const data = await response.json();
    const finalFixture = data.matches?.find((match) => match.stage === 'FINAL') || data.matches?.[0] || null;
    if (!finalFixture) {
      return null;
    }

    const status = getMatchStatusFromFootballData(finalFixture.status?.code ? finalFixture.status?.state || finalFixture.status?.code : 'SCHEDULED');
    const score = finalFixture.score?.fullTime?.home !== null && finalFixture.score?.fullTime?.away !== null
      ? { home: finalFixture.score.fullTime.home, away: finalFixture.score.fullTime.away }
      : null;

    return {
      homeTeam: finalFixture.homeTeam?.name || 'Finalists to be determined',
      awayTeam: finalFixture.awayTeam?.name || 'Finalists to be determined',
      score,
      minute: finalFixture.score?.minute || 0,
      status,
      kickoff: finalFixture.utcDate || knowledgeBase.finalMatch?.date,
      venue: knowledgeBase.venue?.tournamentName || 'MetLife Stadium',
      source: 'football-data.org',
      sourceLabel: '🟢 Live/Verified',
      sourceDetail: 'Live fixture data from football-data.org',
      phase: getMatchPhaseLabel(status)
    };
  } catch (error) {
    console.error('football-data.org fetch error:', error);
    return null;
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const data = await getWeatherData(lat, lon);
    res.json({ data, meta: { timestamp: Date.now() } });
  } catch (e) {
    console.error('Weather endpoint error:', e);
    res.json({ data: mockWeather, meta: { timestamp: Date.now() } });
  }
});

app.get('/api/match', async (req, res) => {
  try {
    const matchData = await getMatchData();
    const responseMeta = {
      timestamp: Date.now(),
      source: matchData.source,
      sourceLabel: matchData.sourceLabel,
      sourceDetail: matchData.sourceDetail
    };
    res.json({ data: matchData, meta: responseMeta });
  } catch (e) {
    console.error('Match endpoint error:', e);
    res.json({ data: mockMatch, meta: { timestamp: Date.now() } });
  }
});

app.post('/api/chat', async (req, res) => {
  const message = sanitizeText(req.body?.message, 500);
  const phase = sanitizeText(req.body?.phase, 20);
  const language = sanitizeText(req.body?.language, 20);
  const accessibility = req.body?.accessibility === true || req.body?.accessibility === 'true';
  const normalizedPhase = ['PRE_MATCH', 'LIVE_MATCH', 'POST_MATCH'].includes(phase) ? phase : 'PRE_MATCH';
  const normalizedLanguage = ['en', 'es', 'fr', 'de', 'pt', 'hi'].includes(language) ? language : 'en';
  const languageInstruction = "Always respond in the EXACT SAME LANGUAGE as the user's latest message, without any mention of language switching.";

  if (!message) {
    return res.status(400).json({ error: 'A message is required.' });
  }

  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (openRouterKey) {
      const knowledgeBaseString = JSON.stringify(knowledgeBase, null, 2);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:5174',
          'X-Title': 'FIFA World Cup Concierge'
        },
        body: JSON.stringify({
          model: 'tencent/hy3:free',
          messages: [
            {
              role: 'system',
              content: `You are a helpful FIFA World Cup matchday concierge for MetLife Stadium (New York New Jersey Stadium). 
Use ONLY the information from this knowledge base, do not make anything up: 
${knowledgeBaseString}

${languageInstruction}
Keep answers concise, clear, and actionable. Use simple language. Focus on safety and efficiency.
Only reference the Supporter Entry Tier ($60) or pricing if specifically asked by the user, and always mention the as-of date (2026-07-11) and that pricing is dynamic.

HOW TO HANDLE LOST AND FOUND:
- If the user says they lost an item, ask for: 1) item description, 2) where they lost it, 3) their contact info. Then call POST /api/lost-and-found/report with that data.
- If the user asks if an item was found, ask for the item description, then call GET /api/lost-and-found/check?description=[description] and share the results.

HOW TO HANDLE EXIT PLANS:
- If the user asks for an exit plan, ask these questions one by one:
  1. What is your preferred transportation method? (train, bus, parking, uber)
  2. Do you have any accessibility needs? (yes/no)
  3. How many people are in your group?
  4. How urgent is your exit? (low/medium/high)
  5. Do you have a preferred exit gate?
- Once you have all the answers, call POST /api/exit-plan/generate with all the data and share the plan in a clear, step-by-step way.`
            },
            { role: 'user', content: message }
          ],
          reasoning: { enabled: true }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({
          data: {
            message: data.choices?.[0]?.message?.content || 'I can help with that.',
            source: 'OpenRouter',
            model: 'Tencent HY3',
            reasoning_details: data.choices?.[0]?.message?.reasoning_details || null
          }
        });
      }

      const fallback = await response.text();
      console.error('OpenRouter API error:', fallback.slice(0, 400));
      return res.status(502).json({
        error: 'The concierge service is temporarily unavailable.'
      });
    }

    return res.status(503).json({
      error: 'The concierge service is currently unavailable. Please try again later.'
    });
  } catch (err) {
    console.error('chat error', err);
    res.status(500).json({
      error: 'Unable to process the request right now.'
    });
  }
});

app.post('/api/crowd-report', (req, res) => {
  const zone = sanitizeText(req.body?.zone, 80);
  const congestion = sanitizeText(req.body?.congestion, 20);
  const waitTime = sanitizeInteger(req.body?.waitTime, 0, 1800);
  const userId = sanitizeText(req.body?.userId, 100);

  if (!zone || !['light', 'medium', 'heavy', 'extreme'].includes(congestion)) {
    return res.status(400).json({ error: 'Invalid crowd report payload.' });
  }

  console.log('Crowd report received:', { zone, congestion, waitTime, userId });
  res.json({
    data: {
      success: true,
      message: 'Thanks for the report! We will update the crowd map.'
    }
  });
});

app.post('/api/lost-found', (req, res) => {
  const name = sanitizeText(req.body?.name, 80);
  const age = sanitizeText(req.body?.age, 20);
  const lastSeen = sanitizeText(req.body?.lastSeen, 200);
  const clothing = sanitizeText(req.body?.clothing, 200);
  const contact = sanitizeText(req.body?.contact, 200);
  const userId = sanitizeText(req.body?.userId, 100);

  if (!name || !lastSeen || !contact) {
    return res.status(400).json({ error: 'Please include your name, last known location, and a contact method.' });
  }

  console.log('Lost person report received:', { name, age, lastSeen, clothing, contact, userId });
  res.json({
    data: {
      success: true,
      reference: `LOST-${Date.now()}`,
      message: 'Report received! Stewards have been notified.'
    }
  });
});

app.get('/api/exit-plan', (req, res) => {
  const { transport } = req.query;
  const exitPlans = {
    'train': {
      title: 'NJ Transit Exit Plan',
      steps: [
        `Exit via one of the recommended gates (AMEX, Verizon, or Moody's Gate)`,
        'Follow signs to Meadowlands Rail Line station',
        'Take the special event train directly to Secaucus Junction',
        'From Secaucus Junction, connect to your final destination'
      ]
    },
    'bus': {
      title: 'Bus Exit Plan',
      steps: [
        'Exit via HCLTech or MetLife Gate',
        'Proceed to designated bus pick-up zones',
        'Board NJ Transit Route 703 or Coach USA 351 Meadowlands Express',
        'Coach USA 351 goes to Port Authority Bus Terminal (Manhattan)'
      ]
    },
    'parking': {
      title: 'Parking Exit Plan',
      steps: [
        'Wait 10–15 minutes to avoid initial exit surge',
        'If parked in Platinum lot, use that for less congested exit',
        'Exit via your assigned lot route',
        'Merge safely onto Route 3 or NJ Turnpike'
      ]
    },
    'uber': {
      title: 'Rideshare Exit Plan',
      steps: [
        'Exit via Verizon Gate or MetLife Gate',
        'Proceed to designated Uber/Lyft lot on-site',
        'Expect surge pricing and long waits post-event',
        'Match with your driver once you reach the pick-up zone'
      ]
    }
  };
  const plan = exitPlans[transport] || exitPlans['train'];
  res.json({ data: plan });
});

// NEW: Concierge endpoints
// Internal function for live status
async function getLiveStatus(gateName) {
  // Get zone congestion or default
  const zoneStats = zoneCongestionMap[gateName] || zoneCongestionMap["Verizon Gate"];
  const congestionLevel = zoneStats.congestion < 0.4 ? "low" : zoneStats.congestion < 0.7 ? "medium" : "high";
  
  // Get weather and match via internal functions
  const weather = await getWeatherData();
  const match = await getMatchData();
  
  // Build match status string
  const matchStatus = `${match.status}; kickoff at ${new Date(match.kickoff).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  const currentPhase = match.status === 'Pre-Match' ? 'before kickoff' : match.status === 'HALFTIME' ? 'halftime' : 'during match';
  const weatherSummary = `${weather.rain > 30 ? 'light rain' : 'clear'}, ${Math.round(weather.tempF)} degrees`;

  return {
    zone: gateName,
    zoneCongestion: congestionLevel,
    recentReports: mockRecentReports.join("; "),
    currentPhase,
    currentWeather: weatherSummary,
    matchStatus,
    weather,
    zoneStats,
    match
  };
}

app.get('/api/concierge/live-status', async (req, res) => {
  try {
    const { zone } = req.query;
    const gateName = zone || "Verizon Gate";
    const liveStatus = await getLiveStatus(gateName);
    res.json({ data: liveStatus });
  } catch (e) {
    console.error('Live status error:', e);
    res.status(500).json({ error: 'Failed to get live status' });
  }
});

app.get('/api/concierge/system-prompt', async (req, res) => {
  try {
    const { zone, accessibility, language } = req.query;
    const gateName = zone || "Verizon Gate";
    const accessMode = accessibility === 'true' ? "Accessibility mode enabled (wheelchair assistance, elevator info, etc.)" : "none";
    const lang = language || "English";
    const languageInstruction = lang === "Auto-detect" 
        ? "Always respond in the EXACT SAME LANGUAGE as the user's latest message, without any mention of language switching." 
        : `Always respond in ${lang} exclusively.`;
    
    // Get live status directly
    const liveStatus = await getLiveStatus(gateName);
    
    // Build system prompt
    const systemPrompt = `You are MatchDay AI, a helpful concierge for the FIFA World Cup match at MetLife Stadium (New York New Jersey Stadium) in East Rutherford, NJ.

CURRENT CONTEXT (right now):
- Current Phase: ${liveStatus.currentPhase}
- Current Weather: ${liveStatus.currentWeather}
- Selected Gate: ${gateName}
- Zone Congestion: ${liveStatus.zoneCongestion}
- Recent Reports: ${liveStatus.recentReports}
- Accessibility Mode: ${accessMode}
- Match Status: ${liveStatus.matchStatus}

Use only the following knowledge base to answer questions:
${JSON.stringify(knowledgeBase, null, 2)}

${languageInstruction}
Keep answers concise, clear, actionable, and friendly! Focus on safety and efficiency!

HOW TO HANDLE LOST AND FOUND:
- If the user says they lost an item, ask for: 1) item description, 2) where they lost it, 3) their contact info. Then call POST /api/lost-and-found/report with that data.
- If the user asks if an item was found, ask for the item description, then call GET /api/lost-and-found/check?description=[description] and share the results.

HOW TO HANDLE EXIT PLANS:
- If the user asks for an exit plan, ask these questions one by one:
  1. What is your preferred transportation method? (train, bus, parking, uber)
  2. Do you have any accessibility needs? (yes/no)
  3. How many people are in your group?
  4. How urgent is your exit? (low/medium/high)
  5. Do you have a preferred exit gate?
- Once you have all the answers, call POST /api/exit-plan/generate with all the data and share the plan in a clear, step-by-step way.`;

    res.json({
        data: {
            systemPrompt,
            variableValues: {
                currentPhase: liveStatus.currentPhase,
                currentWeather: liveStatus.currentWeather,
                selectedGate: gateName,
                zoneCongestion: liveStatus.zoneCongestion,
                recentReports: liveStatus.recentReports,
                accessibilityMode: accessMode,
                matchStatus: liveStatus.matchStatus
            }
        }
    });
  } catch (e) {
    console.error('System prompt error:', e);
    res.status(500).json({ error: 'Failed to generate system prompt' });
  }
});

// Helper to extract parameters from Vapi tool-call OR direct request
const extractParams = (req) => {
  // Check if it's a Vapi tool-call (has parameters) or direct request
  if (req.body.parameters) {
    return req.body.parameters;
  }
  // Otherwise, use direct body or query params
  if (req.method === 'GET') {
    return req.query;
  }
  return req.body;
};

// Lost and Found endpoints
app.post('/api/lost-and-found/report', (req, res) => {
  const params = extractParams(req);
  const description = sanitizeText(params?.description, 200);
  const locationLost = sanitizeText(params?.locationLost, 200);
  const contact = sanitizeText(params?.contact, 200);

  if (!description || !locationLost || !contact) {
    return res.status(400).json({ error: 'Please provide a description, location, and contact method.' });
  }

  const newItem = {
    id: lostItems.length + 1,
    description,
    locationLost,
    contact,
    reportedAt: new Date().toISOString()
  };
  lostItems.push(newItem);
  const result = {
    success: true,
    item: newItem,
    message: "Your lost item has been reported. We'll notify you if it's found!"
  };
  res.json({
    result,
    data: result
  });
});

app.all('/api/lost-and-found/check', (req, res) => {
  const params = extractParams(req);
  const description = sanitizeText(params?.description, 200);
  const matches = foundItems.filter(item =>
    item.description.toLowerCase().includes((description || '').toLowerCase())
  );
  const result = {
    found: matches.length > 0,
    items: matches
  };
  res.json({
    result,
    data: result
  });
});

// Personalized Exit Plan endpoint
app.post('/api/exit-plan/generate', (req, res) => {
  const params = extractParams(req);
  const {
    transportMethod,
    hasAccessibleNeeds,
    groupSize,
    urgencyLevel,
    preferredGate
  } = params;

  // Gate recommendations based on transport method
  const gateRecommendations = {
    'train': ['AMEX Gate', 'Verizon Gate', 'Moody\'s Gate'],
    'bus': ['HCLTech Gate', 'MetLife Gate'],
    'parking': preferredGate ? [preferredGate] : ['Platinum Lot Exit', 'Green Lot Exit'],
    'uber': ['Verizon Gate', 'MetLife Gate']
  };

  // Customize steps based on user inputs
  let steps = [];

  switch (transportMethod) {
    case 'train':
      steps = [
        `Exit via one of these recommended gates: ${gateRecommendations.train.join(', ')}`,
        'Follow signs to Meadowlands Rail Line station',
        (groupSize || 1) > 4 ? 'Stick together as a group to avoid getting separated' : 'Keep your personal items close',
        'Take the special event train directly to Secaucus Junction',
        'From Secaucus Junction, connect to your final destination'
      ];
      break;
    case 'bus':
      steps = [
        `Exit via one of these recommended gates: ${gateRecommendations.bus.join(', ')}`,
        'Proceed to designated bus pick-up zones',
        'Board NJ Transit Route 703 or Coach USA 351 Meadowlands Express',
        'Coach USA 351 goes to Port Authority Bus Terminal (Manhattan)'
      ];
      break;
    case 'parking':
      steps = [
        urgencyLevel === 'high' ? 'Leave immediately to avoid the rush' : 'Wait 10–15 minutes to avoid initial exit surge',
        `Use ${preferredGate || 'your assigned lot exit'} for less congestion`,
        'Follow parking lot attendants\' directions',
        'Merge safely onto Route 3 or NJ Turnpike'
      ];
      break;
    case 'uber':
      steps = [
        `Exit via one of these recommended gates: ${gateRecommendations.uber.join(', ')}`,
        'Proceed to designated Uber/Lyft lot on-site',
        'Expect surge pricing and long waits post-event',
        'Match with your driver once you reach the pick-up zone'
      ];
      break;
    default:
      steps = [
        'Exit via the nearest available gate',
        'Follow stadium staff directions',
        'Choose your preferred transportation method'
      ];
  }

  // Add accessibility notes if needed
  if (hasAccessibleNeeds) {
    steps.unshift('Use elevators at HCLTech Gate, Verizon Gate, or Moody\'s Gate');
    steps.push('Ask any Accessibility Assistant for help if needed');
  }

  const result = {
    title: `Personalized Exit Plan (${transportMethod})`,
    transportMethod,
    recommendedGates: gateRecommendations[transportMethod] || ['Verizon Gate'],
    steps,
    generatedAt: new Date().toISOString()
  };
  lastExitPlan = result; // Store for frontend
  res.json({
    result,
    data: result
  });
});

app.get('/api/exit-plan/latest', (req, res) => {
  res.json({ data: lastExitPlan });
});

// Vercel serverless function handler
export default async function handler(req, res) {
  return app(req, res);
}

// Start server for local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('Ready to handle Vapi tool calls!');
    console.log('Exit plan endpoint: /api/exit-plan/latest');
  });
}
