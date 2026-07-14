// @ts-check
/**
 * @fileoverview GET /api/concierge/system-prompt — Dynamic system prompt for Vapi voice concierge.
 *
 * Called by the frontend immediately before starting a Vapi voice call.
 * Builds a real-time system prompt by combining:
 *   - Verified MetLife Stadium knowledge base data
 *   - Fan's current gate/zone context
 *   - Accessibility mode flag
 *   - Preferred language
 *
 * The resulting `variableValues` object is injected into the Vapi assistant's
 * prompt template, ensuring every voice call is grounded in real venue data.
 *
 * @module api/concierge/system-prompt
 */

import { buildSystemPrompt, getKb, setCors } from '../_lib/helpers.js';

/**
 * @typedef {Object} SystemPromptResponse
 * @property {boolean}             success        - Whether the prompt was built successfully.
 * @property {{ systemPrompt: string, variableValues: Record<string, string> }} data - Prompt data.
 */

/**
 * System prompt handler.
 *
 * @param {import('@vercel/node').VercelRequest}  req - Query params: { zone?, accessibility?, language? }
 * @param {import('@vercel/node').VercelResponse} res - Response: SystemPromptResponse
 * @returns {void}
 *
 * @example
 * // GET /api/concierge/system-prompt?zone=AMEX+Gate&accessibility=false&language=English
 * // → { success: true, data: { systemPrompt: "...", variableValues: { zone: "AMEX Gate", ... } } }
 */
export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { zone = '', accessibility = 'false', language = 'Auto-detect' } = req.query;
    const isAccessibility = accessibility === 'true';

    const systemPrompt = buildSystemPrompt({ zone, accessibility: isAccessibility, language });
    const kb = getKb();

    /** @type {Record<string, string>} */
    const variableValues = {
      zone:          zone || 'the stadium',
      accessibility: isAccessibility ? 'yes' : 'no',
      language:      language || 'Auto-detect',
      venue:         kb.venue?.realName || 'MetLife Stadium',
      systemPrompt,
    };

    res.json({ success: true, data: { systemPrompt, variableValues } });
  } catch (err) {
    console.error('[system-prompt] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to build system prompt' });
  }
}
