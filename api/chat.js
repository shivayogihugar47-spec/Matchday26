import { buildSystemPrompt, handleLostFoundReport, TOOLS, setCors } from './_lib/helpers.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [], phase = 'LIVE', language = 'en', accessibility = false } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

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

    // Build full message history — preserve reasoning_details for multi-turn continuity
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

    // ── First call — model may return tool_calls ──────────────────────────
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

    // ── Handle tool call ──────────────────────────────────────────────────
    if (assistantMsg?.tool_calls?.length > 0) {
      const toolCall = assistantMsg.tool_calls[0];
      const toolName = toolCall.function.name;

      let toolArgs = {};
      try { toolArgs = JSON.parse(toolCall.function.arguments); }
      catch { toolArgs = { description: message }; }

      let toolResultData = { error: 'Unknown tool' };

      if (toolName === 'report_lost_item') {
        // Call the shared handler directly — no HTTP round-trip needed
        toolResultData = handleLostFoundReport({ ...toolArgs, reportedAt: new Date().toISOString() });
      }

      const toolResult = { success: true, data: toolResultData };

      // ── Second call — model sees tool result and writes final reply ──────
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
}
