// @ts-check
/**
 * @fileoverview POST /api/chat — AI-powered multi-turn concierge chat.
 *
 * Architecture:
 *  1. Builds a system prompt grounded in the MetLife Stadium knowledge base
 *  2. Sends message + full conversation history to OpenRouter (tencent/hy3:free)
 *     with reasoning enabled — the model shows its chain-of-thought
 *  3. If the model returns a tool_call (e.g. report_lost_item), the server
 *     executes it directly via handleLostFoundReport — no HTTP round-trip
 *  4. A second OpenRouter call receives the tool result and produces the
 *     final fan-facing response
 *  5. reasoning_details are returned to the client for preservation in
 *     conversation history, enabling multi-turn reasoning continuity
 *
 * Security:
 *  - API key is never exposed to the client
 *  - Tool execution is server-side only
 *  - Input is validated before calling the AI
 *
 * @module api/chat
 */

import { buildSystemPrompt, handleLostFoundReport, TOOLS, setCors } from './_lib/helpers.js';

/**
 * @typedef {Object} ChatMessage
 * @property {'user'|'assistant'|'system'} role     - Message role.
 * @property {string}                      content  - Message text content.
 * @property {Array<*>}                    [reasoning_details] - Preserved reasoning chain.
 */

/**
 * @typedef {Object} ChatRequest
 * @property {string}        message        - Fan's current message (required).
 * @property {ChatMessage[]} [history=[]]   - Prior conversation turns.
 * @property {string}        [phase='LIVE'] - Match phase context.
 * @property {string}        [language='en']- Fan's UI language code.
 * @property {boolean}       [accessibility=false] - Accessibility mode.
 */

/**
 * @typedef {Object} ChatResponse
 * @property {boolean}       success          - Whether the request succeeded.
 * @property {{ message: string, reasoning_details: Array<*>|null, toolUsed?: string, toolResult?: object, source: string, model: string }} data
 */

/**
 * Chat handler — the primary AI endpoint for MatchDay 26.
 *
 * @param {import('@vercel/node').VercelRequest}  req - POST body: ChatRequest
 * @param {import('@vercel/node').VercelResponse} res - Response: ChatResponse
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [], phase = 'LIVE', language = 'en', accessibility = false } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  // Graceful fallback when API key is not configured
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return res.json({
      success: true,
      data: {
        message: "I'm your MatchDay Concierge! Add your OPENROUTER_API_KEY to Vercel environment variables to enable AI responses.",
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

    // Reconstruct full message history, preserving reasoning_details for continuity
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

    const OR_HEADERS = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',
      'X-Title': 'MatchDay AI - FIFA World Cup 2026',
    };

    // ── First OpenRouter call — may return tool_calls ─────────────────────
    const firstResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: OR_HEADERS,
      body: JSON.stringify({
        model: 'tencent/hy3:free',
        messages,
        tools: TOOLS,
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

    // ── Handle tool call (e.g. report_lost_item) ──────────────────────────
    if (assistantMsg?.tool_calls?.length > 0) {
      const toolCall = assistantMsg.tool_calls[0];
      const toolName = toolCall.function.name;

      let toolArgs = {};
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = { description: message };
      }

      let toolResultData = { error: 'Unknown tool' };

      if (toolName === 'report_lost_item') {
        // Execute server-side — never exposes internal logic to client
        toolResultData = handleLostFoundReport({ ...toolArgs, reportedAt: new Date().toISOString() });
      }

      const toolResult = { success: true, data: toolResultData };

      // ── Second OpenRouter call — model receives tool result ────────────
      const messagesWithTool = [
        ...messages,
        { role: 'assistant', content: assistantMsg.content || '', tool_calls: assistantMsg.tool_calls },
        { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(toolResult) },
      ];

      const secondResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: OR_HEADERS,
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
          toolResult: toolResultData,
          source: 'openrouter',
          model: secondData.model || 'tencent/hy3:free',
        },
      });
    }

    // ── Plain response (no tool call) ─────────────────────────────────────
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
}
