import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Knowledge base — loaded once per cold start ──────────────────────────────
let _kb = null;
export function getKb() {
  if (_kb) return _kb;
  try {
    const kbPath = join(__dirname, '..', '..', 'metlife_deep_knowledge_base.json');
    _kb = JSON.parse(readFileSync(kbPath, 'utf-8'));
  } catch (e) {
    console.warn('[helpers] Could not load knowledge base:', e.message);
    _kb = {};
  }
  return _kb;
}

// ── KB summary string ────────────────────────────────────────────────────────
export function buildKbSummary() {
  const kb = getKb();
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

// ── System prompt builder ────────────────────────────────────────────────────
export function buildSystemPrompt({ zone, accessibility, language }) {
  const kb = getKb();
  const kbSummary = buildKbSummary();

  const accessNote = accessibility
    ? 'The fan has accessibility needs — always highlight elevator locations, accessible routes, and ADA services proactively.'
    : '';
  const zoneNote =
    zone && zone !== 'null' && zone !== 'undefined'
      ? `The fan is currently near ${zone}.`
      : 'The fan has not specified a gate.';
  const langNote =
    language && language !== 'Auto-detect'
      ? `Respond in ${language}.`
      : 'Detect the fan language from their first message and respond accordingly.';

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

  void kb; // suppress unused warning — kb is used indirectly via getKb()
}

// ── Lost & Found tool handler (shared between chat and lost-found route) ─────
export function handleLostFoundReport({ itemType, description, lastSeenLocation, contactName, contactPhone, reportedAt }) {
  const reference = `LF-${Date.now().toString(36).toUpperCase()}`;
  console.log(
    `[Lost & Found] Ref ${reference}: ${itemType || 'Item'} — "${description}" — Last seen: ${lastSeenLocation || 'Unknown'} — Contact: ${contactName || 'Anonymous'} ${contactPhone || ''}`
  );
  return {
    reference,
    message: `Report filed. Reference: ${reference}. Stadium staff have been notified. Check the Lost & Found desk near the AMEX Gate concourse.`,
    reportedAt: reportedAt || new Date().toISOString(),
  };
}

// ── Tool definitions for OpenRouter ─────────────────────────────────────────
export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'report_lost_item',
      description:
        'File a lost item or lost person report with stadium staff. Call this whenever the user mentions losing something, losing a child/person, or asks to report something lost.',
      parameters: {
        type: 'object',
        properties: {
          itemType:          { type: 'string', description: 'Type of item or person lost, e.g. "wallet", "phone", "child", "bag"' },
          description:       { type: 'string', description: 'Description of the lost item or person (appearance, color, distinguishing features)' },
          lastSeenLocation:  { type: 'string', description: 'Where the item or person was last seen (section number, gate name, concourse, etc.)' },
          contactName:       { type: 'string', description: 'Name of the person making the report' },
          contactPhone:      { type: 'string', description: 'Contact phone number of the person making the report' },
        },
        required: ['itemType', 'description'],
      },
    },
  },
];

// ── CORS headers helper ──────────────────────────────────────────────────────
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
