import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from the project root (one level up from /server)
config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

// ── Knowledge base (loaded once at startup) ─────────────────────────────────
let kb = {};
try {
  const kbPath = join(__dirname, '..', 'metlife_deep_knowledge_base.json');
  kb = JSON.parse(readFileSync(kbPath, 'utf-8'));
  console.log('[Server] Knowledge base loaded ✓');
} catch (e) {
  console.warn('[Server] Could not load knowledge base:', e.message);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function buildKbSummary() {
  if (!kb.venue) return 'MetLife Stadium, FIFA World Cup 2026.';
  return [
    `Venue: ${kb.venue.realName} (${kb.venue.tournamentName}), ${kb.venue.address}.`,
    `Capacity: ~${kb.capacity?.fifaSoccerConfigured || 82000} for FIFA.`,
    `Gates: ${kb.gates?.list?.map((g) => g.name).join(', ')}.`,
    `Payment: ${kb.amenities?.paymentPolicy || 'Cashless only.'}`,
    `Transport: ${kb.transportation?.rail?.njtransit?.summary || 'NJ Transit from Penn Station and Secaucus Junction.'}`,
    `Accessibility: Elevators at ${kb.gates?.elevatorsAt?.join(', ')}.`,
  ].join(' ');
}

function buildSystemPrompt({ zone, accessibility, language }) {
  const kbSummary = buildKbSummary();
  const accessNote = accessibility
    ? 'The fan has accessibility needs — always highlight elevator locations, accessible routes, and ADA services proactively.'
    : '';
  const zoneNote = zone && zone !== 'null' && zone !== 'undefined'
    ? `The fan is currently near ${zone}.`
    : 'The fan has not specified a gate.';
  const langNote = language && language !== 'Auto-detect'
    ? `Respond in ${language}.`
    : "Detect the fan language from their first message and respond accordingly.";

  return `You are MatchDay Concierge — a friendly, knowledgeable assistant for fans at MetLife Stadium during FIFA World Cup 2026.

KNOWLEDGE BASE:
${kbSummary}

CONTEXT:
- ${zoneNote}
- ${accessNote}
- ${langNote}

BEHAVIOR:
- Be concise, warm, and helpful. Max 3 sentences unless the fan asks for detail.
- For exit plans, always mention NJ Transit options and expected wait times.
- For lost & found, direct fans to the lost & found desk near the AMEX Gate concourse.
- For medical emergencies, direct to the nearest first aid station immediately.
- Never make up specific gate numbers or section data — say "check the stadium app" if unsure.
- Always prioritize safety information over convenience.`;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// System prompt for Vapi voice concierge
app.get('/api/concierge/system-prompt', (req, res) => {
  try {
    const { zone = '', accessibility = 'false', language = 'Auto-detect' } = req.query;
    const isAccessibility = accessibility === 'true';

    const systemPrompt = buildSystemPrompt({ zone, accessibility: isAccessibility, language });

    // variableValues are injected into the Vapi assistant's prompt template
    const variableValues = {
      zone: zone || 'the stadium',
      accessibility: isAccessibility ? 'yes' : 'no',
      language: language || 'Auto-detect',
      venue: kb.venue?.realName || 'MetLife Stadium',
      systemPrompt,
    };

    res.json({
      success: true,
      data: {
        systemPrompt,
        variableValues,
      },
    });
  } catch (err) {
    console.error('[/api/concierge/system-prompt] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to build system prompt' });
  }
});

// Text chat via OpenRouter — tencent/hy3:free with reasoning + tool calling
app.post('/api/chat', async (req, res) => {
  const { message, history = [], phase = 'LIVE', language = 'en', accessibility = false } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return res.json({
      success: true,
      data: {
        message: "I'm your MatchDay Concierge! Add your OPENROUTER_API_KEY to the .env file to enable AI responses.",
        source: 'fallback',
        model: 'fallback',
      },
    });
  }

  try {
    const systemPrompt = buildSystemPrompt({
      zone: '',
      accessibility,
      language: language === 'en' ? 'English' : language,
    });

    const messages = [
      { role: 'system', content: `${systemPrompt}\n\nMatch phase: ${phase}.` },
      ...history.map((turn) => {
        if (turn.role === 'assistant') {
          const msg = { role: 'assistant', content: turn.content };
          if (turn.reasoning_details) msg.reasoning_details = turn.reasoning_details;
          return msg;
        }
        return { role: 'user', content: turn.content };
      }),
      { role: 'user', content: message },
    ];

    // ── Tool definitions ──────────────────────────────────────────────────
    const tools = [
      {
        type: 'function',
        function: {
          name: 'report_lost_item',
          description: 'File a lost item or lost person report with stadium staff. Call this whenever the user mentions losing something, losing a child/person, or asks to report something lost.',
          parameters: {
            type: 'object',
            properties: {
              itemType: {
                type: 'string',
                description: 'Type of item or person lost, e.g. "wallet", "phone", "child", "bag"',
              },
              description: {
                type: 'string',
                description: 'Description of the lost item or person (appearance, color, distinguishing features)',
              },
              lastSeenLocation: {
                type: 'string',
                description: 'Where the item or person was last seen (section number, gate name, concourse, etc.)',
              },
              contactName: {
                type: 'string',
                description: 'Name of the person making the report',
              },
              contactPhone: {
                type: 'string',
                description: 'Contact phone number of the person making the report',
              },
            },
            required: ['itemType', 'description'],
          },
        },
      },
    ];

    // ── First call — may return tool_calls ────────────────────────────────
    const firstResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'MatchDay AI - FIFA World Cup 2026',
      },
      body: JSON.stringify({
        model: 'tencent/hy3:free',
        messages,
        tools,
        tool_choice: 'auto',
        reasoning: { enabled: true },
      }),
    });

    if (!firstResponse.ok) {
      const errText = await firstResponse.text();
      throw new Error(`OpenRouter error ${firstResponse.status}: ${errText}`);
    }

    const firstData = await firstResponse.json();
    const assistantMsg = firstData.choices?.[0]?.message;

    // ── Handle tool call ──────────────────────────────────────────────────
    if (assistantMsg?.tool_calls?.length > 0) {
      const toolCall = assistantMsg.tool_calls[0];
      const toolName = toolCall.function.name;
      let toolArgs = {};

      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = { description: message };
      }

      let toolResult = { error: 'Unknown tool' };

      if (toolName === 'report_lost_item') {
        // Actually call our own lost-found endpoint internally
        const reportRes = await fetch(`http://localhost:${PORT}/api/lost-found`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...toolArgs, reportedAt: new Date().toISOString() }),
        });
        toolResult = await reportRes.json();
      }

      // ── Second call — model sees the tool result and gives final reply ──
      const messagesWithTool = [
        ...messages,
        { role: 'assistant', content: assistantMsg.content || '', tool_calls: assistantMsg.tool_calls },
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        },
      ];

      const secondResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'MatchDay AI - FIFA World Cup 2026',
        },
        body: JSON.stringify({
          model: 'tencent/hy3:free',
          messages: messagesWithTool,
          reasoning: { enabled: true },
        }),
      });

      if (!secondResponse.ok) {
        const errText = await secondResponse.text();
        throw new Error(`OpenRouter tool-result error ${secondResponse.status}: ${errText}`);
      }

      const secondData = await secondResponse.json();
      const finalMsg = secondData.choices?.[0]?.message;

      return res.json({
        success: true,
        data: {
          message: finalMsg?.content || 'Report filed successfully.',
          reasoning_details: finalMsg?.reasoning_details || null,
          toolUsed: toolName,
          toolResult: toolResult?.data || toolResult,
          source: 'openrouter',
          model: secondData.model || 'tencent/hy3:free',
        },
      });
    }

    // ── No tool call — plain response ─────────────────────────────────────
    return res.json({
      success: true,
      data: {
        message: assistantMsg?.content || 'Sorry, I could not generate a response.',
        reasoning_details: assistantMsg?.reasoning_details || null,
        source: 'openrouter',
        model: firstData.model || 'tencent/hy3:free',
      },
    });

  } catch (err) {
    console.error('[/api/chat] Error:', err.message);
    res.status(500).json({ error: 'Failed to get AI response', details: err.message });
  }
});

// Weather — uses Open-Meteo (free, no API key needed)
app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;

  // Fallback to MetLife Stadium coords if none provided
  const latitude  = parseFloat(lat)  || 40.8135;
  const longitude = parseFloat(lon)  || -74.0745;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);

    const raw = await response.json();
    const c = raw.current;

    const tempF = Math.round(c.temperature_2m);
    const tempC = Math.round((tempF - 32) * 5 / 9);

    res.json({
      success: true,
      data: {
        tempF,
        tempC,
        humidity: Math.round(c.relative_humidity_2m),
        rain: Math.round(c.precipitation_probability),
        wind: Math.round(c.wind_speed_10m),
        weatherCode: c.weather_code,
        source: 'open-meteo',
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[/api/weather] Error:', err.message, '— using mock fallback');
    // Return mock data so the UI never breaks
    res.json({
      success: true,
      data: {
        tempF: 72,
        tempC: 22,
        humidity: 60,
        rain: 10,
        wind: 5,
        source: 'simulated',
        updatedAt: new Date().toISOString(),
      },
    });
  }
});

// Lost & Found report
app.post('/api/lost-found', (req, res) => {
  const { itemType, description, lastSeenLocation, contactName, contactPhone, reportedAt } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  // Generate a reference number
  const reference = `LF-${Date.now().toString(36).toUpperCase()}`;

  console.log(`[Lost & Found] Ref ${reference}: ${itemType || 'Item'} — "${description}" — Last seen: ${lastSeenLocation || 'Unknown'} — Contact: ${contactName || 'Anonymous'} ${contactPhone || ''}`);

  res.json({
    success: true,
    data: {
      reference,
      message: `Report filed. Reference: ${reference}. Stadium staff have been notified. Check the Lost & Found desk near the AMEX Gate concourse.`,
      reportedAt: reportedAt || new Date().toISOString(),
    },
  });
});

// Crowd report
app.post('/api/crowd-report', (req, res) => {
  const { zone, congestion, waitTime } = req.body;
  console.log(`[Crowd report] Zone: ${zone}, Congestion: ${congestion}, Wait: ${waitTime}s`);
  res.json({ success: true, data: { received: true } });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] OpenRouter: ${process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here' ? '✓ configured' : '✗ not set (chat will use fallback)'}`);
});
