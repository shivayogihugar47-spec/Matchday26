// @ts-check
/**
 * @fileoverview Shared helpers for all Vercel API routes.
 *
 * Responsibilities:
 *  - Load and cache the MetLife Stadium knowledge base (JSON)
 *  - Build concise KB summary strings for AI system prompts
 *  - Build full system prompts for the Vapi voice concierge and OpenRouter chat
 *  - Handle Lost & Found report creation (shared between /api/chat tool-calls and /api/lost-found)
 *  - Expose OpenRouter tool definitions
 *  - Set CORS headers on serverless responses
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Knowledge base — loaded once per cold start ──────────────────────────────

/** @type {Record<string, any> | null} */
let _kb = null;

/**
 * Returns the parsed MetLife Stadium knowledge base.
 * Loaded lazily on first call and cached for the lifetime of the serverless instance.
 *
 * @returns {Record<string, any>} Parsed knowledge base object, or empty object on load failure.
 */
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

/**
 * Builds a concise, single-line summary of the stadium knowledge base
 * suitable for inclusion in AI system prompts.
 *
 * @returns {string} Human-readable KB summary.
 */
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
    `Final Match: FIFA World Cup 2026 Final — Spain vs SF2 winner on July 19, 2026 at 3 PM ET at MetLife Stadium. SF1 result: Spain beat France 2-0.`,
  ].join(' ');
}

// ── System prompt builder ────────────────────────────────────────────────────

/**
 * @typedef {Object} SystemPromptOptions
 * @property {string}  zone          - Gate or location the fan is near (e.g. "AMEX Gate").
 * @property {boolean} accessibility - Whether the fan has accessibility needs.
 * @property {string}  language      - Preferred response language, or "Auto-detect".
 */

/**
 * Builds a full system prompt for the AI concierge.
 * Injects real-time context (zone, accessibility, language) into a grounded
 * knowledge-base template so every response is factual and context-aware.
 *
 * @param {SystemPromptOptions} options
 * @returns {string} Complete system prompt string ready for OpenRouter or Vapi.
 */
export function buildSystemPrompt({ zone, accessibility, language }) {
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
}

// ── Lost & Found tool handler ────────────────────────────────────────────────

/**
 * @typedef {Object} LostFoundInput
 * @property {string} [itemType]          - Category of lost item (e.g. "wallet", "child").
 * @property {string}  description        - Description of the lost item or person.
 * @property {string} [lastSeenLocation]  - Where the item was last seen.
 * @property {string} [contactName]       - Name of the reporting fan.
 * @property {string} [contactPhone]      - Phone number of the reporting fan.
 * @property {string} [reportedAt]        - ISO 8601 timestamp; defaults to now.
 */

/**
 * @typedef {Object} LostFoundResult
 * @property {string} reference   - Unique report reference (e.g. "LF-ABC123").
 * @property {string} message     - Confirmation message for the fan.
 * @property {string} reportedAt  - ISO 8601 timestamp the report was created.
 */

/**
 * Creates a Lost & Found report and returns a unique reference number.
 * This handler is shared between the /api/lost-found endpoint and the
 * report_lost_item tool call inside /api/chat, ensuring consistent behaviour.
 *
 * @param {LostFoundInput} input
 * @returns {LostFoundResult}
 */
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

// ── OpenRouter tool definitions ──────────────────────────────────────────────

/**
 * Tool definitions passed to OpenRouter's tool_calls API.
 * The AI uses these schemas to decide when and how to invoke server-side actions
 * (e.g. automatically filing a Lost & Found report from a natural-language message).
 *
 * @type {Array<{type: string, function: {name: string, description: string, parameters: object}}>}
 */
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
          itemType:         { type: 'string', description: 'Type of item or person lost, e.g. "wallet", "phone", "child", "bag"' },
          description:      { type: 'string', description: 'Description of the lost item or person (appearance, color, distinguishing features)' },
          lastSeenLocation: { type: 'string', description: 'Where the item or person was last seen (section number, gate name, concourse, etc.)' },
          contactName:      { type: 'string', description: 'Name of the person making the report' },
          contactPhone:     { type: 'string', description: 'Contact phone number of the person making the report' },
        },
        required: ['itemType', 'description'],
      },
    },
  },
];

// ── CORS headers helper ──────────────────────────────────────────────────────

/**
 * Sets standard CORS headers on a Vercel serverless response object.
 * Allows requests from any origin — appropriate for a public fan-facing API.
 *
 * @param {{ setHeader: (key: string, value: string) => void }} res - Vercel response object.
 * @returns {void}
 */
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
